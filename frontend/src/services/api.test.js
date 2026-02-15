import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { searchByImage, getProducts } from './api';

// Mock axios
vi.mock('axios');

describe('API Service', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    // Create mock axios instance
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };
    
    axios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('searchByImage', () => {
    it('should send file-based search request', async () => {
      const mockFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: {
          uploadedImageUrl: '/uploads/test.jpg',
          results: [],
          processingTime: 100,
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await searchByImage(mockFile);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/search',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should send URL-based search request', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const mockResponse = {
        data: {
          uploadedImageUrl: imageUrl,
          results: [],
          processingTime: 100,
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await searchByImage(imageUrl);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/search',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getProducts', () => {
    it('should fetch all products', async () => {
      const mockResponse = {
        data: {
          products: [
            { id: '1', name: 'Product 1' },
            { id: '2', name: 'Product 2' },
          ],
          count: 2,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getProducts();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/products');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
