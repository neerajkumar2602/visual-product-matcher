import { errorHandler, APIError, ErrorCodes, asyncHandler } from './errorHandler.js';
import * as fc from 'fast-check';
import { jest } from '@jest/globals';

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      path: '/api/test',
      method: 'POST',
      requestId: 'test-request-id'
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('APIError handling', () => {
    test('should handle INVALID_IMAGE error correctly', () => {
      const error = new APIError(
        ErrorCodes.INVALID_IMAGE,
        'Invalid image format',
        400
      );

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid image format',
          code: ErrorCodes.INVALID_IMAGE,
          actionable: expect.any(String)
        })
      );
    });

    test('should handle PROCESSING_ERROR correctly', () => {
      const error = new APIError(
        ErrorCodes.PROCESSING_ERROR,
        'Failed to process image',
        500
      );

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: ErrorCodes.PROCESSING_ERROR,
          actionable: expect.any(String)
        })
      );
    });

    test('should handle SERVICE_UNAVAILABLE correctly', () => {
      const error = new APIError(
        ErrorCodes.SERVICE_UNAVAILABLE,
        'Service temporarily unavailable',
        503
      );

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          actionable: expect.any(String)
        })
      );
    });
  });

  describe('Multer error handling', () => {
    test('should handle LIMIT_FILE_SIZE error', () => {
      const error = new Error('File too large');
      error.name = 'MulterError';
      error.code = 'LIMIT_FILE_SIZE';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('10MB'),
          code: ErrorCodes.INVALID_IMAGE,
          actionable: expect.stringContaining('smaller')
        })
      );
    });

    test('should handle generic MulterError', () => {
      const error = new Error('Upload failed');
      error.name = 'MulterError';
      error.code = 'UNEXPECTED_ERROR';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: ErrorCodes.INVALID_IMAGE,
          actionable: expect.any(String)
        })
      );
    });
  });

  describe('Generic error handling', () => {
    test('should handle generic Error with message', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Something went wrong',
          actionable: expect.any(String)
        })
      );
    });

    test('should handle error without message', () => {
      const error = new Error();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          actionable: expect.any(String)
        })
      );
    });
  });

  describe('asyncHandler', () => {
    test('should catch async errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = async () => {
        throw error;
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('should handle successful async operations', async () => {
      const asyncFn = async (req, res) => {
        res.json({ success: true });
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: visual-product-matcher, Property 12: Error handling and messaging
     * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
     * 
     * For any error condition (network failure, processing error, database unavailable),
     * the system should display a user-friendly error message with actionable guidance
     * and log the error for debugging.
     */
    test('Property 12: Error handling and messaging', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Generate various APIError scenarios
            fc.record({
              type: fc.constant('api'),
              code: fc.constantFrom(
                ErrorCodes.INVALID_IMAGE,
                ErrorCodes.PROCESSING_ERROR,
                ErrorCodes.SERVICE_UNAVAILABLE,
                ErrorCodes.RATE_LIMIT_EXCEEDED,
                ErrorCodes.DATABASE_ERROR,
                ErrorCodes.VALIDATION_ERROR
              ),
              message: fc.string({ minLength: 10, maxLength: 100 }),
              statusCode: fc.constantFrom(400, 403, 404, 429, 500, 503)
            }),
            
            // Generate MulterError scenarios
            fc.record({
              type: fc.constant('multer'),
              code: fc.constantFrom('LIMIT_FILE_SIZE', 'LIMIT_UNEXPECTED_FILE', 'UNEXPECTED_ERROR'),
              message: fc.string({ minLength: 5, maxLength: 50 })
            }),
            
            // Generate generic Error scenarios
            fc.record({
              type: fc.constant('generic'),
              message: fc.string({ minLength: 1, maxLength: 100 })
            }),
            
            // Generate ValidationError scenarios
            fc.record({
              type: fc.constant('validation'),
              message: fc.string({ minLength: 10, maxLength: 100 })
            })
          ),
          async (errorSpec) => {
            // Create error based on specification
            let error;
            if (errorSpec.type === 'api') {
              error = new APIError(errorSpec.code, errorSpec.message, errorSpec.statusCode);
            } else if (errorSpec.type === 'multer') {
              error = new Error(errorSpec.message);
              error.name = 'MulterError';
              error.code = errorSpec.code;
            } else if (errorSpec.type === 'validation') {
              error = new Error(errorSpec.message);
              error.name = 'ValidationError';
            } else {
              error = new Error(errorSpec.message);
            }

            // Create fresh mock objects for each test
            const req = {
              path: '/api/test',
              method: 'POST',
              requestId: `req_${Date.now()}`
            };

            const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis()
            };

            const next = jest.fn();

            // Call error handler
            errorHandler(error, req, res, next);

            // Property 1: Error handler should set an HTTP status code
            expect(res.status).toHaveBeenCalled();
            const statusCode = res.status.mock.calls[0][0];
            expect(statusCode).toBeGreaterThanOrEqual(400);
            expect(statusCode).toBeLessThan(600);

            // Property 2: Error handler should send a JSON response
            expect(res.json).toHaveBeenCalled();
            const response = res.json.mock.calls[0][0];

            // Property 3: Response should indicate failure
            expect(response.success).toBe(false);

            // Property 4: Response should include an error message
            expect(response.error).toBeDefined();
            expect(typeof response.error).toBe('string');
            expect(response.error.length).toBeGreaterThan(0);

            // Property 5: Response should include an error code
            expect(response.code).toBeDefined();
            expect(typeof response.code).toBe('string');

            // Property 6: Response should include actionable guidance
            expect(response.actionable).toBeDefined();
            expect(typeof response.actionable).toBe('string');
            expect(response.actionable.length).toBeGreaterThan(0);

            // Property 7: Actionable guidance should be user-friendly
            // Should contain helpful words like "try", "please", "check", "wait", etc.
            const actionableLower = response.actionable.toLowerCase();
            const hasHelpfulWords = 
              actionableLower.includes('try') ||
              actionableLower.includes('please') ||
              actionableLower.includes('check') ||
              actionableLower.includes('wait') ||
              actionableLower.includes('upload') ||
              actionableLower.includes('ensure') ||
              actionableLower.includes('provide');
            expect(hasHelpfulWords).toBe(true);

            // Property 8: Status code should match error code mapping
            // The error handler uses a mapping that overrides the status code based on error code
            if (errorSpec.type === 'api') {
              // APIError should use the mapped status code for its error code
              const expectedStatusCodes = {
                [ErrorCodes.INVALID_IMAGE]: 400,
                [ErrorCodes.VALIDATION_ERROR]: 400,
                [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
                [ErrorCodes.PROCESSING_ERROR]: 500,
                [ErrorCodes.DATABASE_ERROR]: 500,
                [ErrorCodes.SERVICE_UNAVAILABLE]: 503
              };
              expect(statusCode).toBe(expectedStatusCodes[errorSpec.code]);
            } else if (errorSpec.type === 'multer' || errorSpec.type === 'validation') {
              // Multer and validation errors should be 400 (bad request)
              expect(statusCode).toBe(400);
            } else {
              // Generic errors should be 500 (internal server error)
              expect(statusCode).toBe(500);
            }

            // Property 9: Error code should be from valid set
            const validErrorCodes = Object.values(ErrorCodes);
            expect(validErrorCodes).toContain(response.code);

            // Property 10: Response structure should be consistent
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('error');
            expect(response).toHaveProperty('code');
            expect(response).toHaveProperty('actionable');

            // Property 11: Error message should not expose sensitive information
            // Should not contain stack traces, file paths, or internal details in production
            if (process.env.NODE_ENV !== 'development') {
              expect(response.stack).toBeUndefined();
            }

            // Property 12: next() should not be called (error is handled)
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000); // Increased timeout for property-based testing

    test('Property 12: Async handler error propagation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            errorMessage: fc.string({ minLength: 5, maxLength: 100 }),
            shouldThrow: fc.boolean()
          }),
          async (spec) => {
            const req = { path: '/test', method: 'GET' };
            const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis()
            };
            const next = jest.fn();

            if (spec.shouldThrow) {
              // Create async function that throws
              const asyncFn = async () => {
                throw new Error(spec.errorMessage);
              };

              const wrappedFn = asyncHandler(asyncFn);
              await wrappedFn(req, res, next);

              // Property 1: Errors should be passed to next()
              expect(next).toHaveBeenCalled();
              const passedError = next.mock.calls[0][0];
              
              // Property 2: Error should be an Error instance
              expect(passedError).toBeInstanceOf(Error);
              
              // Property 3: Error message should be preserved
              expect(passedError.message).toBe(spec.errorMessage);
            } else {
              // Create async function that succeeds
              const asyncFn = async (req, res) => {
                res.json({ success: true, data: 'test' });
              };

              const wrappedFn = asyncHandler(asyncFn);
              await wrappedFn(req, res, next);

              // Property 4: Successful operations should not call next()
              expect(next).not.toHaveBeenCalled();
              
              // Property 5: Response should be sent
              expect(res.json).toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    test('Property 12: Error code to status code mapping consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            ErrorCodes.INVALID_IMAGE,
            ErrorCodes.PROCESSING_ERROR,
            ErrorCodes.SERVICE_UNAVAILABLE,
            ErrorCodes.RATE_LIMIT_EXCEEDED,
            ErrorCodes.DATABASE_ERROR,
            ErrorCodes.VALIDATION_ERROR
          ),
          fc.string({ minLength: 10, maxLength: 100 }),
          async (errorCode, errorMessage) => {
            // Create APIError with the error code
            const error = new APIError(errorCode, errorMessage);

            const req = { path: '/test', method: 'POST', requestId: 'test' };
            const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis()
            };
            const next = jest.fn();

            errorHandler(error, req, res, next);

            const statusCode = res.status.mock.calls[0][0];
            const response = res.json.mock.calls[0][0];

            // Property 1: Status code should be consistent for each error code
            const expectedStatusCodes = {
              [ErrorCodes.INVALID_IMAGE]: 400,
              [ErrorCodes.VALIDATION_ERROR]: 400,
              [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
              [ErrorCodes.PROCESSING_ERROR]: 500,
              [ErrorCodes.DATABASE_ERROR]: 500,
              [ErrorCodes.SERVICE_UNAVAILABLE]: 503
            };

            expect(statusCode).toBe(expectedStatusCodes[errorCode]);

            // Property 2: Error code in response should match input
            expect(response.code).toBe(errorCode);

            // Property 3: 4xx errors should indicate client errors
            if (statusCode >= 400 && statusCode < 500) {
              expect([
                ErrorCodes.INVALID_IMAGE,
                ErrorCodes.VALIDATION_ERROR,
                ErrorCodes.RATE_LIMIT_EXCEEDED
              ]).toContain(errorCode);
            }

            // Property 4: 5xx errors should indicate server errors
            if (statusCode >= 500) {
              expect([
                ErrorCodes.PROCESSING_ERROR,
                ErrorCodes.DATABASE_ERROR,
                ErrorCodes.SERVICE_UNAVAILABLE
              ]).toContain(errorCode);
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });
});
