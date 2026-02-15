import axios from 'axios';

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for image processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and adding auth if needed
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Create user-friendly error message
      let message = data?.error || 'An error occurred';
      let actionable = 'Please try again';
      
      switch (status) {
        case 400:
          actionable = 'Please check your input and try again';
          break;
        case 413:
          message = 'Image file is too large';
          actionable = 'Please upload a smaller image (max 10MB)';
          break;
        case 415:
          message = 'Invalid image format';
          actionable = 'Please upload a JPEG, PNG, WebP, or GIF image';
          break;
        case 429:
          message = 'Too many requests';
          actionable = 'Please wait a moment before trying again';
          break;
        case 500:
        case 503:
          message = 'Service temporarily unavailable';
          actionable = 'Please try again in a few moments';
          break;
      }
      
      error.userMessage = message;
      error.actionable = actionable;
      error.retryable = status !== 400 && status !== 413 && status !== 415;
    } else if (error.request) {
      // Request made but no response received
      error.userMessage = 'Unable to connect to server';
      error.actionable = 'Please check your internet connection and try again';
      error.retryable = true;
    } else {
      // Error in request setup
      error.userMessage = 'An unexpected error occurred';
      error.actionable = 'Please try again';
      error.retryable = true;
    }
    
    return Promise.reject(error);
  }
);

/**
 * Search for similar products by image
 * @param {File|string} image - File object or image URL
 * @returns {Promise<{uploadedImageUrl: string, results: Array, processingTime: number}>}
 */
export async function searchByImage(image) {
  const formData = new FormData();
  
  if (typeof image === 'string') {
    // URL-based search
    formData.append('imageUrl', image);
  } else {
    // File-based search
    formData.append('image', image);
  }
  
  const response = await apiClient.post('/api/search', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

/**
 * Get all products from the database
 * @returns {Promise<{products: Array, count: number}>}
 */
export async function getProducts() {
  const response = await apiClient.get('/api/products');
  return response.data;
}

export default apiClient;
