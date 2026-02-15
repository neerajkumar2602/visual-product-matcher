import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { createCanvas, loadImage } from 'canvas';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up TensorFlow.js backend
tf.setBackend('cpu');

/**
 * Load an image from URL and convert to tensor
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<tf.Tensor3D>} Image tensor
 */
async function loadImageAsTensor(imageUrl) {
  try {
    // Fetch image from URL
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    // Load image using canvas - resize to 224x224 for faster processing
    const img = await loadImage(Buffer.from(buffer));
    
    // Create canvas with fixed size (MobileNet input size)
    const canvas = createCanvas(224, 224);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 224, 224);
    
    // Get image data and convert to tensor manually
    const imageData = ctx.getImageData(0, 0, 224, 224);
    const { data, width, height } = imageData;
    
    // Create tensor from raw pixel data
    const tensor = tf.browser.fromPixels({ data: new Uint8Array(data), width, height });
    
    return tensor;
  } catch (error) {
    console.error(`Failed to load image from ${imageUrl}:`, error.message);
    throw error;
  }
}

/**
 * Extract embeddings from an image using MobileNet
 * @param {tf.Tensor3D} imageTensor - Image tensor
 * @param {Object} model - MobileNet model
 * @returns {Promise<Array>} Embedding array
 */
async function extractEmbedding(imageTensor, model) {
  // Get the internal activation (embeddings) from the model
  // MobileNet's second-to-last layer provides good embeddings
  const activation = model.infer(imageTensor, true);
  
  // Convert to array
  const embeddingArray = await activation.array();
  
  // Flatten if needed
  const flattened = embeddingArray.flat(Infinity);
  
  // Clean up tensors
  activation.dispose();
  
  return flattened;
}

/**
 * Generate embeddings for all products
 */
async function generateAllEmbeddings() {
  console.log('Loading MobileNet model...');
  // Use version 1 with alpha 0.25 for faster inference
  const model = await mobilenet.load({
    version: 1,
    alpha: 0.25
  });
  console.log('Model loaded successfully!');
  
  // Load products
  const productsPath = join(__dirname, '../src/data/products.json');
  const productsData = await readFile(productsPath, 'utf-8');
  const { products } = JSON.parse(productsData);
  
  console.log(`Processing ${products.length} products...`);
  
  const embeddings = {};
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i + 1}/${products.length}] Processing ${product.id}: ${product.name}`);
    
    try {
      // Load image as tensor
      const imageTensor = await loadImageAsTensor(product.imageUrl);
      
      // Extract embedding
      const embedding = await extractEmbedding(imageTensor, model);
      
      // Store embedding
      embeddings[product.id] = embedding;
      
      // Clean up
      imageTensor.dispose();
      
      successCount++;
      console.log(`  ✓ Success (embedding size: ${embedding.length})`);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      failCount++;
    }
  }
  
  // Save embeddings to file
  const embeddingsPath = join(__dirname, '../src/data/embeddings.json');
  await writeFile(embeddingsPath, JSON.stringify(embeddings, null, 2));
  
  console.log('\n=== Summary ===');
  console.log(`Total products: ${products.length}`);
  console.log(`Successfully processed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Embeddings saved to: ${embeddingsPath}`);
  
  // Verify all products have embeddings
  const missingEmbeddings = products.filter(p => !embeddings[p.id]);
  if (missingEmbeddings.length > 0) {
    console.warn('\n⚠ Warning: The following products are missing embeddings:');
    missingEmbeddings.forEach(p => console.warn(`  - ${p.id}: ${p.name}`));
  } else {
    console.log('\n✓ All products have corresponding embeddings!');
  }
}

// Run the script
console.log('Starting embedding generation...\n');
generateAllEmbeddings()
  .then(() => {
    console.log('\nEmbedding generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
