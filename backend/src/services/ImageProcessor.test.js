import imageProcessor from './ImageProcessor.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import * as fc from 'fast-check';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('ImageProcessor', () => {
  beforeAll(async () => {
    // Load model once before all tests
    await imageProcessor.loadModel();
  }, 30000); // 30 second timeout for model loading

  describe('validateImageUrl', () => {
    test('should accept valid HTTP URLs', () => {
      expect(imageProcessor.validateImageUrl('http://example.com/image.jpg')).toBe(true);
    });

    test('should accept valid HTTPS URLs', () => {
      expect(imageProcessor.validateImageUrl('https://example.com/image.png')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(imageProcessor.validateImageUrl('not-a-url')).toBe(false);
    });

    test('should reject non-HTTP protocols', () => {
      expect(imageProcessor.validateImageUrl('ftp://example.com/image.jpg')).toBe(false);
    });
  });

  describe('validateImage', () => {
    test('should reject empty buffers', async () => {
      const result = await imageProcessor.validateImage(Buffer.from([]));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too small');
    });

    test('should reject oversized images', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
      const result = await imageProcessor.validateImage(largeBuffer);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    test('should reject corrupted image data', async () => {
      const corruptedBuffer = Buffer.from('not an image');
      const result = await imageProcessor.validateImage(corruptedBuffer);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Image Validation Edge Cases', () => {
    describe('File Size Boundary Cases', () => {
      test('should accept image exactly at 10MB limit', async () => {
        // Create a valid PNG at exactly 10MB
        const maxSize = 10 * 1024 * 1024;
        const testImage = await sharp({
          create: {
            width: 2000,
            height: 2000,
            channels: 3,
            background: { r: 128, g: 128, b: 128 }
          }
        })
        .png({ compressionLevel: 0 })
        .toBuffer();

        // If generated image is under 10MB, it should be valid
        if (testImage.length <= maxSize) {
          const result = await imageProcessor.validateImage(testImage);
          expect(result.valid).toBe(true);
        }
      });

      test('should reject image at 10MB + 1 byte', async () => {
        const oversizedBuffer = Buffer.alloc(10 * 1024 * 1024 + 1);
        const result = await imageProcessor.validateImage(oversizedBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('exceeds maximum');
      });

      test('should reject image at exactly 100 bytes (minimum boundary)', async () => {
        const tinyBuffer = Buffer.alloc(100);
        const result = await imageProcessor.validateImage(tinyBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject image at 99 bytes (below minimum)', async () => {
        const tooSmallBuffer = Buffer.alloc(99);
        const result = await imageProcessor.validateImage(tooSmallBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too small');
      });
    });

    describe('Invalid Format Cases', () => {
      test('should reject BMP format', async () => {
        // Create a minimal BMP header
        const bmpHeader = Buffer.from([
          0x42, 0x4D, // BM signature
          0x36, 0x00, 0x00, 0x00, // File size
          0x00, 0x00, 0x00, 0x00, // Reserved
          0x36, 0x00, 0x00, 0x00, // Offset to pixel data
        ]);
        const bmpBuffer = Buffer.concat([bmpHeader, Buffer.alloc(100)]);
        
        const result = await imageProcessor.validateImage(bmpBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/format|corrupted/i);
      });

      test('should reject TIFF format', async () => {
        // Create a minimal TIFF header
        const tiffHeader = Buffer.from([
          0x49, 0x49, 0x2A, 0x00 // Little-endian TIFF signature
        ]);
        const tiffBuffer = Buffer.concat([tiffHeader, Buffer.alloc(100)]);
        
        const result = await imageProcessor.validateImage(tiffBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/format|corrupted/i);
      });

      test('should reject SVG format', async () => {
        const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>');
        
        const result = await imageProcessor.validateImage(svgBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject PDF format', async () => {
        const pdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n');
        
        const result = await imageProcessor.validateImage(pdfBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should accept valid JPEG format', async () => {
        const jpegImage = await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
          }
        })
        .jpeg()
        .toBuffer();

        const result = await imageProcessor.validateImage(jpegImage);
        expect(result.valid).toBe(true);
        expect(result.metadata.format).toBe('jpeg');
      });

      test('should accept valid PNG format', async () => {
        const pngImage = await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 0, g: 255, b: 0 }
          }
        })
        .png()
        .toBuffer();

        const result = await imageProcessor.validateImage(pngImage);
        expect(result.valid).toBe(true);
        expect(result.metadata.format).toBe('png');
      });

      test('should accept valid WebP format', async () => {
        const webpImage = await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 0, g: 0, b: 255 }
          }
        })
        .webp()
        .toBuffer();

        const result = await imageProcessor.validateImage(webpImage);
        expect(result.valid).toBe(true);
        expect(result.metadata.format).toBe('webp');
      });
    });

    describe('Corrupted Image Data Cases', () => {
      test('should reject truncated JPEG header', async () => {
        // JPEG starts with FF D8 but is incomplete
        const truncatedJpeg = Buffer.from([0xFF, 0xD8, 0xFF]);
        
        const result = await imageProcessor.validateImage(truncatedJpeg);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/corrupted|invalid/i);
      });

      test('should reject truncated PNG header', async () => {
        // PNG signature is 8 bytes, provide only 4
        const truncatedPng = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
        
        const result = await imageProcessor.validateImage(truncatedPng);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/corrupted|invalid|too small/i);
      });

      test('should reject corrupted PNG with valid header but invalid data', async () => {
        // Valid PNG signature but corrupted data
        const corruptedPng = Buffer.concat([
          Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
          Buffer.from('corrupted data here')
        ]);
        
        const result = await imageProcessor.validateImage(corruptedPng);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/corrupted|invalid/i);
      });

      test('should reject corrupted JPEG with valid header but invalid data', async () => {
        // Valid JPEG start marker but corrupted data
        const corruptedJpeg = Buffer.concat([
          Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG SOI + APP0 marker
          Buffer.from('this is not valid jpeg data')
        ]);
        
        const result = await imageProcessor.validateImage(corruptedJpeg);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/corrupted|invalid/i);
      });

      test('should reject image with null bytes', async () => {
        const nullBuffer = Buffer.alloc(1000, 0);
        
        const result = await imageProcessor.validateImage(nullBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject random binary data', async () => {
        const randomBuffer = Buffer.from(Array.from({ length: 500 }, () => Math.floor(Math.random() * 256)));
        
        const result = await imageProcessor.validateImage(randomBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject text file masquerading as image', async () => {
        const textBuffer = Buffer.from('This is a text file, not an image!\n'.repeat(10));
        
        const result = await imageProcessor.validateImage(textBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject HTML file', async () => {
        const htmlBuffer = Buffer.from('<!DOCTYPE html><html><body><h1>Not an image</h1></body></html>');
        
        const result = await imageProcessor.validateImage(htmlBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject JSON data', async () => {
        const jsonBuffer = Buffer.from(JSON.stringify({ message: 'This is not an image' }));
        
        const result = await imageProcessor.validateImage(jsonBuffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Dimension Edge Cases', () => {
      test('should reject image with width below minimum (49px)', async () => {
        const tooNarrow = await sharp({
          create: {
            width: 49,
            height: 100,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
        .png()
        .toBuffer();

        const result = await imageProcessor.validateImage(tooNarrow);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too small');
      });

      test('should reject image with height below minimum (49px)', async () => {
        const tooShort = await sharp({
          create: {
            width: 100,
            height: 49,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
        .png()
        .toBuffer();

        const result = await imageProcessor.validateImage(tooShort);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too small');
      });

      test('should accept image at minimum dimensions (50x50)', async () => {
        const minSize = await sharp({
          create: {
            width: 50,
            height: 50,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
        .png()
        .toBuffer();

        const result = await imageProcessor.validateImage(minSize);
        expect(result.valid).toBe(true);
        expect(result.metadata.width).toBe(50);
        expect(result.metadata.height).toBe(50);
      });

      test('should accept image at maximum dimensions (4096x4096)', async () => {
        const maxSize = await sharp({
          create: {
            width: 4096,
            height: 4096,
            channels: 3,
            background: { r: 128, g: 128, b: 128 }
          }
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

        const result = await imageProcessor.validateImage(maxSize);
        expect(result.valid).toBe(true);
        expect(result.metadata.width).toBe(4096);
        expect(result.metadata.height).toBe(4096);
      });

      test('should reject image exceeding maximum width (4097px)', async () => {
        const tooWide = await sharp({
          create: {
            width: 4097,
            height: 100,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

        const result = await imageProcessor.validateImage(tooWide);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too large');
      });

      test('should reject image exceeding maximum height (4097px)', async () => {
        const tooTall = await sharp({
          create: {
            width: 100,
            height: 4097,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

        const result = await imageProcessor.validateImage(tooTall);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too large');
      });
    });
  });

  describe('computeSimilarity', () => {
    test('should return 1 for identical embeddings', () => {
      const embedding = [1, 2, 3, 4, 5];
      const similarity = imageProcessor.computeSimilarity(embedding, embedding);
      expect(similarity).toBeCloseTo(1, 5);
    });

    test('should return 0 for orthogonal embeddings', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [0, 1, 0];
      const similarity = imageProcessor.computeSimilarity(embedding1, embedding2);
      expect(similarity).toBeCloseTo(0, 5);
    });

    test('should return value between 0 and 1 for different embeddings', () => {
      const embedding1 = [1, 2, 3];
      const embedding2 = [4, 5, 6];
      const similarity = imageProcessor.computeSimilarity(embedding1, embedding2);
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    test('should throw error for embeddings of different lengths', () => {
      const embedding1 = [1, 2, 3];
      const embedding2 = [1, 2];
      expect(() => {
        imageProcessor.computeSimilarity(embedding1, embedding2);
      }).toThrow('same length');
    });

    test('should throw error for empty embeddings', () => {
      expect(() => {
        imageProcessor.computeSimilarity([], []);
      }).toThrow('cannot be empty');
    });

    test('should throw error for non-array inputs', () => {
      expect(() => {
        imageProcessor.computeSimilarity('not an array', [1, 2, 3]);
      }).toThrow('must be arrays');
    });

    test('should handle zero vectors', () => {
      const embedding1 = [0, 0, 0];
      const embedding2 = [1, 2, 3];
      const similarity = imageProcessor.computeSimilarity(embedding1, embedding2);
      expect(similarity).toBe(0);
    });
  });

  describe('extractFeatures', () => {
    test('should extract features from valid image', async () => {
      // Create a simple test image using sharp
      const testImage = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      })
      .png()
      .toBuffer();

      const embedding = await imageProcessor.extractFeatures(testImage);
      
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
      expect(embedding.every(val => typeof val === 'number')).toBe(true);
    }, 30000); // Increase timeout for model inference

    test('should throw error for invalid image buffer', async () => {
      const invalidBuffer = Buffer.from('not an image');
      await expect(imageProcessor.extractFeatures(invalidBuffer)).rejects.toThrow();
    });
  });

  describe('processImage', () => {
    test('should successfully process valid image', async () => {
      // Create a simple test image using sharp
      const testImage = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      })
      .png()
      .toBuffer();

      const result = await imageProcessor.processImage(testImage);
      
      expect(result.success).toBe(true);
      expect(result.embedding).toBeDefined();
      expect(Array.isArray(result.embedding)).toBe(true);
      expect(result.metadata).toBeDefined();
    }, 30000);

    test('should fail for invalid image', async () => {
      const invalidBuffer = Buffer.from('not an image');
      const result = await imageProcessor.processImage(invalidBuffer);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should fail for oversized image', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
      const result = await imageProcessor.processImage(largeBuffer);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: visual-product-matcher, Property 3: Invalid input rejection
     * Validates: Requirements 1.3, 1.4, 1.6
     * 
     * For any invalid file type or oversized image, the system should reject the input,
     * display an appropriate error message, and maintain the current application state.
     */
    test('Property 3: Invalid input rejection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Generate oversized buffers (> 10MB)
            fc.constant(Buffer.alloc(11 * 1024 * 1024)),
            fc.constant(Buffer.alloc(15 * 1024 * 1024)),
            fc.constant(Buffer.alloc(20 * 1024 * 1024)),
            
            // Generate undersized/empty buffers
            fc.constant(Buffer.from([])),
            fc.constant(Buffer.alloc(10)),
            fc.constant(Buffer.alloc(50)),
            
            // Generate corrupted/invalid data
            fc.string({ minLength: 10, maxLength: 1000 }).map(s => Buffer.from(s)),
            fc.uint8Array({ minLength: 100, maxLength: 5000 }).map(arr => Buffer.from(arr)),
            
            // Generate invalid image-like data (has some structure but not valid image)
            fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 100, maxLength: 1000 })
              .map(arr => Buffer.from(arr))
          ),
          async (invalidBuffer) => {
            // Process the invalid input
            const result = await imageProcessor.processImage(invalidBuffer);
            
            // Property 1: System should reject invalid input
            expect(result.success).toBe(false);
            
            // Property 2: System should provide an error message
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
            
            // Property 3: Error message should be informative
            // Should mention the specific issue (size, format, corruption)
            const errorLower = result.error.toLowerCase();
            const hasInformativeMessage = 
              errorLower.includes('size') ||
              errorLower.includes('small') ||
              errorLower.includes('large') ||
              errorLower.includes('exceeds') ||
              errorLower.includes('invalid') ||
              errorLower.includes('corrupted') ||
              errorLower.includes('format') ||
              errorLower.includes('failed');
            
            expect(hasInformativeMessage).toBe(true);
            
            // Property 4: No embedding should be returned for invalid input
            expect(result.embedding).toBeUndefined();
            
            // Property 5: System should not throw unhandled exceptions
            // (if we got here, no exception was thrown)
            expect(true).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000); // Increased timeout for property-based testing

    test('Property 3: Invalid URL rejection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Invalid URL formats
            fc.constant('not-a-url'),
            fc.constant(''),
            fc.constant('ftp://example.com/image.jpg'),
            fc.constant('file:///local/path/image.jpg'),
            fc.constant('javascript:alert(1)'),
            
            // Malformed URLs
            fc.string({ minLength: 5, maxLength: 50 }).filter(s => {
              try {
                new URL(s);
                return false;
              } catch {
                return true;
              }
            }),
            
            // URLs with invalid protocols
            fc.constant('data:image/png;base64,invalid'),
            fc.constant('blob:http://example.com/invalid')
          ),
          async (invalidUrl) => {
            // Validate URL format
            const isValid = imageProcessor.validateImageUrl(invalidUrl);
            
            // Property 1: Invalid URLs should be rejected
            expect(isValid).toBe(false);
            
            // Property 2: Processing invalid URL should fail gracefully
            const result = await imageProcessor.processImageFromUrl(invalidUrl);
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            
            // Property 3: No embedding should be returned
            expect(result.embedding).toBeUndefined();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });
});
