import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * ProductDatabase service for loading and querying products
 */
class ProductDatabase {
  constructor() {
    this.products = [];
    this.embeddings = new Map();
    this.loaded = false;
  }

  /**
   * Load products from JSON file
   * @returns {Promise<void>}
   */
  async loadProducts() {
    try {
      const productsPath = join(__dirname, '../data/products.json');
      const data = await readFile(productsPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.products = parsed.products || [];
      this.loaded = true;
      console.log(`Loaded ${this.products.length} products`);
    } catch (error) {
      console.error('Failed to load products:', error);
      throw new Error('Failed to load product database');
    }
  }

  /**
   * Load pre-computed embeddings from JSON file
   * @returns {Promise<void>}
   */
  async loadEmbeddings() {
    try {
      const embeddingsPath = join(__dirname, '../data/embeddings.json');
      const data = await readFile(embeddingsPath, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Convert object to Map for efficient lookups
      this.embeddings = new Map(Object.entries(parsed));
      console.log(`Loaded ${this.embeddings.size} embeddings`);
    } catch (error) {
      console.error('Failed to load embeddings:', error);
      throw new Error('Failed to load embeddings database');
    }
  }

  /**
   * Get all products
   * @returns {Array} Array of products
   */
  getAllProducts() {
    if (!this.loaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }
    return this.products;
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Object|null} Product object or null if not found
   */
  getProductById(productId) {
    if (!this.loaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }
    return this.products.find(p => p.id === productId) || null;
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @returns {Array} Array of products in the category
   */
  getProductsByCategory(category) {
    if (!this.loaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }
    return this.products.filter(p => p.category === category);
  }

  /**
   * Get embedding for a product
   * @param {string} productId - Product ID
   * @returns {Array|null} Embedding array or null if not found
   */
  getEmbedding(productId) {
    return this.embeddings.get(productId) || null;
  }

  /**
   * Get all product embeddings
   * @returns {Map} Map of productId to embedding
   */
  getAllEmbeddings() {
    return this.embeddings;
  }

  /**
   * Search for similar products based on query embedding
   * @param {Array} queryEmbedding - Query image embedding
   * @param {number} topK - Number of results to return
   * @returns {Array} Array of {product, score} objects sorted by similarity
   */
  searchSimilar(queryEmbedding, topK = 20) {
    if (!this.loaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }
    if (this.embeddings.size === 0) {
      throw new Error('Embeddings not loaded. Call loadEmbeddings() first.');
    }

    const results = [];

    for (const product of this.products) {
      const productEmbedding = this.embeddings.get(product.id);
      if (!productEmbedding) {
        console.warn(`No embedding found for product ${product.id}`);
        continue;
      }

      const similarity = this.cosineSimilarity(queryEmbedding, productEmbedding);
      results.push({
        product,
        score: similarity
      });
    }

    // Sort by similarity score in descending order
    results.sort((a, b) => b.score - a.score);

    // Return top K results
    return results.slice(0, topK);
  }

  /**
   * Calculate cosine similarity between two embeddings
   * @param {Array} embedding1 - First embedding
   * @param {Array} embedding2 - Second embedding
   * @returns {number} Similarity score (0-1)
   */
  cosineSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }
}

// Export singleton instance
const productDatabase = new ProductDatabase();
export default productDatabase;
