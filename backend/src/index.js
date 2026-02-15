import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import imageProcessor from './services/ImageProcessor.js';
import productDatabase from './services/ProductDatabase.js';
import { errorHandler, asyncHandler, APIError, ErrorCodes } from './middleware/errorHandler.js';
import logger, { requestLogger, logPerformance, createLogger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const apiLogger = createLogger('API');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Visual Product Matcher API is running' });
});

// Initialize database on startup
let dbInitialized = false;
const initializeDatabase = async () => {
  if (dbInitialized) return;
  try {
    apiLogger.info('Initializing database and model...');
    await productDatabase.loadProducts();
    await productDatabase.loadEmbeddings();
    await imageProcessor.loadModel();
    dbInitialized = true;
    apiLogger.info('Database and model initialized successfully');
  } catch (error) {
    apiLogger.error('Failed to initialize database', { error: error.message, stack: error.stack });
    throw error;
  }
};

// POST /api/search - Search for similar products by image
app.post('/api/search', upload.single('image'), asyncHandler(async (req, res) => {
  // Ensure database is initialized
  if (!dbInitialized) {
    await initializeDatabase();
  }

  const startTime = Date.now();
  let imageBuffer;
  let uploadedImageUrl = null;

  // Check if image was uploaded as file or URL
  if (req.file) {
    // Image uploaded as file (multipart/form-data)
    imageBuffer = req.file.buffer;
    uploadedImageUrl = 'uploaded-file'; // Placeholder for uploaded file
    apiLogger.info('Image uploaded as file', { 
      requestId: req.requestId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });
  } else if (req.body.imageUrl) {
    // Image provided as URL
    const imageUrl = req.body.imageUrl;
    
    // Validate URL format
    if (!imageProcessor.validateImageUrl(imageUrl)) {
      throw new APIError(
        ErrorCodes.INVALID_IMAGE,
        'Invalid image URL format',
        400
      );
    }

    // Load image from URL
    try {
      imageBuffer = await imageProcessor.loadImageFromUrl(imageUrl);
      uploadedImageUrl = imageUrl;
      apiLogger.info('Image loaded from URL', { 
        requestId: req.requestId,
        imageUrl
      });
    } catch (error) {
      throw new APIError(
        ErrorCodes.INVALID_IMAGE,
        error.message,
        400
      );
    }
  } else {
    throw new APIError(
      ErrorCodes.VALIDATION_ERROR,
      'No image provided. Please upload an image file or provide an imageUrl',
      400
    );
  }

  // Validate and process the image
  const validation = await imageProcessor.validateImage(imageBuffer);
  if (!validation.valid) {
    throw new APIError(
      ErrorCodes.INVALID_IMAGE,
      validation.error,
      400
    );
  }

  // Extract features from uploaded image
  let embedding;
  const extractionStart = Date.now();
  try {
    const result = await imageProcessor.extractFeatures(imageBuffer);
    embedding = result;
    const extractionTime = Date.now() - extractionStart;
    logPerformance('ImageProcessor', 'extractFeatures', extractionTime, { 
      requestId: req.requestId 
    });
  } catch (error) {
    apiLogger.error('Feature extraction failed', { 
      requestId: req.requestId,
      error: error.message 
    });
    throw new APIError(
      ErrorCodes.PROCESSING_ERROR,
      'Failed to process image',
      500
    );
  }

  // Search for similar products
  let results;
  const searchStart = Date.now();
  try {
    results = productDatabase.searchSimilar(embedding, 20);
    const searchTime = Date.now() - searchStart;
    logPerformance('ProductDatabase', 'searchSimilar', searchTime, { 
      requestId: req.requestId,
      resultCount: results.length
    });
  } catch (error) {
    apiLogger.error('Search failed', { 
      requestId: req.requestId,
      error: error.message 
    });
    throw new APIError(
      ErrorCodes.DATABASE_ERROR,
      'Failed to search for similar products',
      500
    );
  }

  // Format results with similarity scores as percentages
  const formattedResults = results.map((result, index) => ({
    ...result.product,
    similarityScore: Math.round(result.score * 100), // Convert to percentage
    rank: index + 1
  }));

  const processingTime = Date.now() - startTime;
  logPerformance('API', 'searchEndpoint', processingTime, { 
    requestId: req.requestId,
    resultCount: formattedResults.length
  });

  res.json({
    success: true,
    uploadedImageUrl,
    results: formattedResults,
    processingTime,
    count: formattedResults.length
  });
}));

// GET /api/products - Get all products
app.get('/api/products', asyncHandler(async (req, res) => {
  // Ensure database is initialized
  if (!dbInitialized) {
    await initializeDatabase();
  }

  const products = productDatabase.getAllProducts();

  res.json({
    success: true,
    products,
    count: products.length
  });
}));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    apiLogger.info(`Server running on port ${PORT}`);
  });
}

export { app };
export default app;
