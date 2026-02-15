/**
 * Integration Tests for Search Flow
 * Tests end-to-end image upload to results display
 * 
 * Requirements: 2.1, 6.1
 */

import request from 'supertest';

// Import the app (we'll need to export it from index.js)
let app;

// Setup: Import app before tests
beforeAll(async () => {
  // Dynamically import the app
  const indexModule = await import('./index.js');
  app = indexModule.app;
});

describe('Integration Tests - Search Flow', () => {
  describe('End-to-end image upload to results display', () => {
    test('should accept image URL and return search results', async () => {
      const testImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';

      const response = await request(app)
        .post('/api/search')
        .send({ imageUrl: testImageUrl })
        .set('Content-Type', 'application/json')
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      
      // Verify results contain required fields
      if (response.body.results.length > 0) {
        const result = response.body.results[0];
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('category');
        expect(result).toHaveProperty('imageUrl');
        expect(result).toHaveProperty('similarityScore');
      }
      
      // Verify results are ordered by similarity score (descending)
      const scores = response.body.results.map(r => r.similarityScore);
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    }, 30000);

    test('should return up to 20 results', async () => {
      const testImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';

      const response = await request(app)
        .post('/api/search')
        .send({ imageUrl: testImageUrl })
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(20);
    }, 30000);

    test('should include processing time in response', async () => {
      const testImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';

      const response = await request(app)
        .post('/api/search')
        .send({ imageUrl: testImageUrl })
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body).toHaveProperty('processingTime');
      expect(typeof response.body.processingTime).toBe('number');
      expect(response.body.processingTime).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error scenarios', () => {
    test('should reject invalid image URL', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({ imageUrl: 'not-a-valid-url' })
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('URL');
    });

    test('should reject request with no image', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({})
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should handle network failure gracefully', async () => {
      // Use an invalid URL that will cause a network error
      const response = await request(app)
        .post('/api/search')
        .send({ imageUrl: 'https://invalid-domain-that-does-not-exist-12345.com/image.jpg' })
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Product database integration', () => {
    test('should retrieve all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
      
      // Verify product structure
      const product = response.body.products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('imageUrl');
    });

    test('should have at least 50 products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe('CORS configuration', () => {
    test('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Health check', () => {
    test('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
});
