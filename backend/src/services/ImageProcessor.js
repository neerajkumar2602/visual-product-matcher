import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import fetch from 'node-fetch';

// Set up TensorFlow.js backend
tf.setBackend('cpu');

/**
 * ImageProcessor service for image validation, feature extraction, and similarity computation
 */
class ImageProcessor {
  constructor() {
    this.model = null;
    this.modelLoaded = false;
    
    // Configuration
    this.config = {
      maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      minWidth: 50,
      minHeight: 50,
      maxWidth: 4096,
      maxHeight: 4096
    };
  }

  /**
   * Load the MobileNet model
   * @returns {Promise<void>}
   */
  async loadModel() {
    if (this.modelLoaded) {
      return;
    }

    try {
      console.log('Loading MobileNet model...');
      // Use version 1 with alpha 0.25 for faster inference
      this.model = await mobilenet.load({
        version: 1,
        alpha: 0.25
      });
      this.modelLoaded = true;
      console.log('MobileNet model loaded successfully');
    } catch (error) {
      console.error('Failed to load MobileNet model:', error);
      throw new Error('Failed to initialize image processing model');
    }
  }

  /**
   * Validate image buffer
   * @param {Buffer} imageBuffer - Image data buffer
   * @returns {Promise<{valid: boolean, error?: string, metadata?: Object}>}
   */
  async validateImage(imageBuffer) {
    try {
      // Check file size
      if (imageBuffer.length > this.config.maxFileSizeBytes) {
        return {
          valid: false,
          error: `Image size exceeds maximum allowed size of ${this.config.maxFileSizeBytes / (1024 * 1024)}MB`
        };
      }

      // Check minimum size
      if (imageBuffer.length < 100) {
        return {
          valid: false,
          error: 'Image file is too small or corrupted'
        };
      }

      // Use sharp to validate and get metadata
      let metadata;
      try {
        metadata = await sharp(imageBuffer).metadata();
      } catch (error) {
        return {
          valid: false,
          error: 'Invalid or corrupted image file'
        };
      }

      // Check format
      const format = `image/${metadata.format}`;
      if (!this.config.allowedFormats.includes(format)) {
        return {
          valid: false,
          error: `Unsupported image format. Allowed formats: ${this.config.allowedFormats.join(', ')}`
        };
      }

      // Check dimensions
      if (metadata.width < this.config.minWidth || metadata.height < this.config.minHeight) {
        return {
          valid: false,
          error: `Image dimensions too small. Minimum: ${this.config.minWidth}x${this.config.minHeight}px`
        };
      }

      if (metadata.width > this.config.maxWidth || metadata.height > this.config.maxHeight) {
        return {
          valid: false,
          error: `Image dimensions too large. Maximum: ${this.config.maxWidth}x${this.config.maxHeight}px`
        };
      }

      return {
        valid: true,
        metadata: {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          size: imageBuffer.length
        }
      };
    } catch (error) {
      console.error('Image validation error:', error);
      return {
        valid: false,
        error: 'Failed to validate image'
      };
    }
  }

  /**
   * Validate image URL
   * @param {string} url - Image URL
   * @returns {boolean} True if URL format is valid
   */
  validateImageUrl(url) {
    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }

      // Check if URL has a valid extension (optional but helpful)
      const pathname = parsedUrl.pathname.toLowerCase();
      const hasValidExtension = this.config.allowedExtensions.some(ext => 
        pathname.endsWith(ext)
      );

      // Allow URLs without extensions (many CDNs don't use them)
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load image from URL
   * @param {string} imageUrl - Image URL
   * @returns {Promise<Buffer>} Image buffer
   */
  async loadImageFromUrl(imageUrl) {
    try {
      const response = await fetch(imageUrl, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Visual-Product-Matcher/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Image download timeout');
      }
      throw new Error(`Failed to load image from URL: ${error.message}`);
    }
  }

  /**
   * Convert image buffer to tensor
   * @param {Buffer} imageBuffer - Image data buffer
   * @returns {Promise<tf.Tensor3D>} Image tensor
   */
  async bufferToTensor(imageBuffer) {
    try {
      // Resize and convert image to PNG format for canvas compatibility
      const resizedBuffer = await sharp(imageBuffer)
        .resize(224, 224, { fit: 'cover' })
        .png() // Convert to PNG for better canvas compatibility
        .toBuffer();
      
      // Load resized image using canvas
      const img = await loadImage(resizedBuffer);
      
      // Create canvas and draw image
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;
      
      // Create tensor from raw pixel data
      const tensor = tf.browser.fromPixels({ 
        data: new Uint8Array(data), 
        width, 
        height 
      });
      
      return tensor;
    } catch (error) {
      throw new Error(`Failed to convert image to tensor: ${error.message}`);
    }
  }

  /**
   * Extract feature embeddings from image buffer
   * @param {Buffer} imageBuffer - Image data buffer
   * @returns {Promise<Array<number>>} Feature embedding array
   */
  async extractFeatures(imageBuffer) {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    let imageTensor = null;
    let activation = null;

    try {
      // Convert buffer to tensor
      imageTensor = await this.bufferToTensor(imageBuffer);
      
      // Get embeddings from model (internal activation)
      activation = this.model.infer(imageTensor, true);
      
      // Convert to array
      const embeddingArray = await activation.array();
      
      // Flatten the array
      const flattened = embeddingArray.flat(Infinity);
      
      return flattened;
    } catch (error) {
      console.error('Feature extraction error:', error);
      throw new Error(`Failed to extract image features: ${error.message}`);
    } finally {
      // Clean up tensors to prevent memory leaks
      if (imageTensor) {
        imageTensor.dispose();
      }
      if (activation) {
        activation.dispose();
      }
    }
  }

  /**
   * Compute cosine similarity between two embeddings
   * @param {Array<number>} embedding1 - First embedding
   * @param {Array<number>} embedding2 - Second embedding
   * @returns {number} Similarity score (0-1)
   */
  computeSimilarity(embedding1, embedding2) {
    if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
      throw new Error('Embeddings must be arrays');
    }

    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    if (embedding1.length === 0) {
      throw new Error('Embeddings cannot be empty');
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

  /**
   * Process image and extract features (main entry point)
   * @param {Buffer} imageBuffer - Image data buffer
   * @returns {Promise<{success: boolean, embedding?: Array<number>, error?: string}>}
   */
  async processImage(imageBuffer) {
    try {
      // Validate image
      const validation = await this.validateImage(imageBuffer);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Extract features
      const embedding = await this.extractFeatures(imageBuffer);

      return {
        success: true,
        embedding,
        metadata: validation.metadata
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process image'
      };
    }
  }

  /**
   * Process image from URL
   * @param {string} imageUrl - Image URL
   * @returns {Promise<{success: boolean, embedding?: Array<number>, error?: string}>}
   */
  async processImageFromUrl(imageUrl) {
    try {
      // Validate URL format
      if (!this.validateImageUrl(imageUrl)) {
        return {
          success: false,
          error: 'Invalid image URL format'
        };
      }

      // Load image from URL
      const imageBuffer = await this.loadImageFromUrl(imageUrl);

      // Process the loaded image
      return await this.processImage(imageBuffer);
    } catch (error) {
      console.error('URL image processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process image from URL'
      };
    }
  }
}

// Export singleton instance
const imageProcessor = new ImageProcessor();
export default imageProcessor;
