import request from 'supertest';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fc from 'fast-check';
import app from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        message: 'Visual Product Matcher API is running'
      });
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.count).toBe(response.body.products.length);
    }, 30000);

    it('should return products with required fields', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('imageUrl');
      }
    }, 30000);
  });

  describe('POST /api/search', () => {
    it('should return error when no image is provided', async () => {
      const response = await request(app)
        .post('/api/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No image provided');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for invalid URL format', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({ imageUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_IMAGE');
    });

    /**
     * Property 4: Search results ordering
     * Validates: Requirements 2.4
     * 
     * For any set of search results, the products should be ordered by 
     * similarity score in descending order (highest similarity first).
     */
    it('Feature: visual-product-matcher, Property 4: Search results ordering', async () => {
      // Use a product image URL from the database for testing
      const testImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';

      await fc.assert(
        fc.asyncProperty(
          fc.constant(testImageUrl),
          async (imageUrl) => {
            const response = await request(app)
              .post('/api/search')
              .send({ imageUrl })
              .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.results).toBeDefined();
            expect(Array.isArray(response.body.results)).toBe(true);

            const results = response.body.results;

            // Property: Results must be ordered by similarity score in descending order
            for (let i = 0; i < results.length - 1; i++) {
              const currentScore = results[i].similarityScore;
              const nextScore = results[i + 1].similarityScore;
              
              expect(currentScore).toBeGreaterThanOrEqual(nextScore);
            }

            // Additional invariant: All scores should be between 0 and 100
            results.forEach(result => {
              expect(result.similarityScore).toBeGreaterThanOrEqual(0);
              expect(result.similarityScore).toBeLessThanOrEqual(100);
            });

            // Additional invariant: Each result should have required fields
            results.forEach(result => {
              expect(result).toHaveProperty('id');
              expect(result).toHaveProperty('name');
              expect(result).toHaveProperty('category');
              expect(result).toHaveProperty('imageUrl');
              expect(result).toHaveProperty('similarityScore');
              expect(result).toHaveProperty('rank');
            });
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // Extended timeout for property-based test

    /**
     * Property 5: Result completeness
     * Validates: Requirements 2.3
     * 
     * For any product in the search results, the displayed information should 
     * include the product image, name, category, and similarity score.
     */
    it('Feature: visual-product-matcher, Property 5: Result completeness', async () => {
      // Use a product image URL from the database for testing
      const testImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';

      await fc.assert(
        fc.asyncProperty(
          fc.constant(testImageUrl),
          async (imageUrl) => {
            const response = await request(app)
              .post('/api/search')
              .send({ imageUrl })
              .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.results).toBeDefined();
            expect(Array.isArray(response.body.results)).toBe(true);

            const results = response.body.results;

            // Property: Every product in search results must have complete information
            // Required fields: product image (imageUrl), name, category, and similarity score
            results.forEach((result, index) => {
              // Check all required fields are present
              expect(result).toHaveProperty('imageUrl');
              expect(result).toHaveProperty('name');
              expect(result).toHaveProperty('category');
              expect(result).toHaveProperty('similarityScore');

              // Verify fields are not null/undefined/empty
              expect(result.imageUrl).toBeTruthy();
              expect(typeof result.imageUrl).toBe('string');
              expect(result.imageUrl.length).toBeGreaterThan(0);

              expect(result.name).toBeTruthy();
              expect(typeof result.name).toBe('string');
              expect(result.name.length).toBeGreaterThan(0);

              expect(result.category).toBeTruthy();
              expect(typeof result.category).toBe('string');
              expect(result.category.length).toBeGreaterThan(0);

              expect(result.similarityScore).toBeDefined();
              expect(typeof result.similarityScore).toBe('number');
              expect(result.similarityScore).toBeGreaterThanOrEqual(0);
              expect(result.similarityScore).toBeLessThanOrEqual(100);
            });

            // Additional invariant: If there are results, all must be complete
            if (results.length > 0) {
              expect(results.every(r => 
                r.imageUrl && r.name && r.category && 
                typeof r.similarityScore === 'number'
              )).toBe(true);
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // Extended timeout for property-based test
  });
});
