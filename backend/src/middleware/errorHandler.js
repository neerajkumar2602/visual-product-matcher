import { logError } from '../utils/logger.js';

/**
 * Custom API Error class with error codes
 */
export class APIError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes for different error types
 */
export const ErrorCodes = {
  INVALID_IMAGE: 'INVALID_IMAGE',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

/**
 * Map error codes to HTTP status codes and user-friendly messages
 */
const errorMapping = {
  [ErrorCodes.INVALID_IMAGE]: {
    statusCode: 400,
    userMessage: 'The provided image is invalid or unsupported. Please upload a valid JPEG, PNG, WebP, or GIF image.'
  },
  [ErrorCodes.PROCESSING_ERROR]: {
    statusCode: 500,
    userMessage: 'We encountered an error while processing your image. Please try again.'
  },
  [ErrorCodes.SERVICE_UNAVAILABLE]: {
    statusCode: 503,
    userMessage: 'The service is temporarily unavailable. Please try again in a few moments.'
  },
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: {
    statusCode: 429,
    userMessage: 'Too many requests. Please wait a moment before trying again.'
  },
  [ErrorCodes.DATABASE_ERROR]: {
    statusCode: 500,
    userMessage: 'We encountered a database error. Please try again.'
  },
  [ErrorCodes.VALIDATION_ERROR]: {
    statusCode: 400,
    userMessage: 'The request contains invalid data. Please check your input and try again.'
  }
};

/**
 * Centralized error handling middleware for Express
 * Maps errors to appropriate HTTP status codes and user-friendly messages
 */
export const errorHandler = (err, req, res, next) => {
  // Default error response
  let statusCode = 500;
  let errorCode = ErrorCodes.SERVICE_UNAVAILABLE;
  let message = 'An unexpected error occurred';
  let actionable = 'Please try again later';

  // Handle APIError instances
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    
    const mapping = errorMapping[err.code];
    if (mapping) {
      statusCode = mapping.statusCode;
      message = err.message || mapping.userMessage;
      actionable = getActionableGuidance(err.code);
    } else {
      message = err.message;
    }
  } 
  // Handle multer file upload errors
  else if (err.name === 'MulterError') {
    statusCode = 400;
    errorCode = ErrorCodes.INVALID_IMAGE;
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the maximum limit of 10MB';
      actionable = 'Please upload a smaller image';
    } else {
      message = 'File upload error: ' + err.message;
      actionable = 'Please check your file and try again';
    }
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = err.message;
    actionable = 'Please check your input and try again';
  }
  // Handle generic errors
  else {
    message = err.message || 'An unexpected error occurred';
    actionable = 'Please try again later or contact support if the problem persists';
  }

  // Log error for debugging
  logError('ErrorHandler', message, err, {
    statusCode,
    errorCode,
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code: errorCode,
    actionable,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Get actionable guidance for users based on error code
 */
function getActionableGuidance(errorCode) {
  const guidance = {
    [ErrorCodes.INVALID_IMAGE]: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF) under 10MB',
    [ErrorCodes.PROCESSING_ERROR]: 'Try uploading a different image or retry in a moment',
    [ErrorCodes.SERVICE_UNAVAILABLE]: 'Please wait a moment and try again',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Please wait a few seconds before making another request',
    [ErrorCodes.DATABASE_ERROR]: 'Please try again in a moment',
    [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and ensure all required fields are provided'
  };

  return guidance[errorCode] || 'Please try again later';
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
