import fc from 'fast-check';
import productDatabase from './ProductDatabase.js';

describe('ProductDatabase', () => {
  beforeAll(async () => {
    await productDatabase.loadProducts();
  });

  /**
   * Feature: visual-product-matcher, Property 9: Product data integrity
   * Validates: Requirements 4.2
   * 
   * For any product in the database, it should contain all required metadata fields:
   * id, name, category, and imageUrl.
   */
  test('Property 9: Product data integrity - all products have required fields', () => {
    const products = productDatabase.getAllProducts();
    
    // Ensure we have products to test
    expect(products.length).toBeGreaterThan(0);
    
    // Property: Every product must have all required fields
    fc.assert(
      fc.property(
        fc.constantFrom(...products),
        (product) => {
          // Check that all required fields exist
          expect(product).toHaveProperty('id');
          expect(product).toHaveProperty('name');
          expect(product).toHaveProperty('category');
          expect(product).toHaveProperty('imageUrl');
          
          // Check that required fields are non-empty strings
          expect(typeof product.id).toBe('string');
          expect(product.id.length).toBeGreaterThan(0);
          
          expect(typeof product.name).toBe('string');
          expect(product.name.length).toBeGreaterThan(0);
          
          expect(typeof product.category).toBe('string');
          expect(product.category.length).toBeGreaterThan(0);
          
          expect(typeof product.imageUrl).toBe('string');
          expect(product.imageUrl.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 10 }
    );
  });
});
