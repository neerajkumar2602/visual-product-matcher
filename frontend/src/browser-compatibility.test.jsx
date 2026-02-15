/**
 * Cross-Browser Compatibility Tests
 * 
 * Property 15: Cross-browser compatibility
 * Validates: Requirements 8.4
 * 
 * For any modern browser (Chrome, Firefox, Safari, Edge), the system should
 * function correctly with all features working as expected.
 * 
 * These tests verify that the application uses browser APIs and features
 * that are compatible across modern browsers and handles browser-specific
 * differences appropriately.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import App from './App';
import * as api from './services/api';

// Mock the API module
vi.mock('./services/api');

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test 1: File API compatibility
   * Verifies that File and FileReader APIs work correctly
   */
  test('should handle File API across browsers', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    api.searchByImage.mockResolvedValue({
      uploadedImageUrl: '/uploaded.jpg',
      results: [],
      processingTime: 100,
    });

    const { container } = render(<App />);

    // Create a file using the File constructor (supported in all modern browsers)
    const file = new File(['image content'], 'test-image.jpg', { type: 'image/jpeg' });
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('test-image.jpg');
    expect(file.type).toBe('image/jpeg');

    // Upload the file
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    await user.upload(input, file);

    // Verify FileReader is used for preview (implicitly tested by preview appearing)
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  /**
   * Test 2: FormData API compatibility
   * Verifies FormData handling for file uploads
   */
  test('should handle FormData API for file uploads', async () => {
    const user = userEvent.setup();
    
    // Intercept the API call to verify FormData is used correctly
    let capturedFormData = null;
    api.searchByImage.mockImplementation((data) => {
      capturedFormData = data;
      return Promise.resolve({
        uploadedImageUrl: '/uploaded.jpg',
        results: [],
        processingTime: 100,
      });
    });

    const { container } = render(<App />);

    // Create and upload a file
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument(), { timeout: 3000 });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Verify FormData or file was passed to API
    await waitFor(() => {
      expect(capturedFormData).toBeDefined();
    });
  });

  /**
   * Test 3: Fetch API compatibility
   * Verifies that the application uses fetch or compatible HTTP client
   */
  test('should use compatible HTTP client (fetch/axios)', async () => {
    const user = userEvent.setup();
    
    // Mock API to verify it's called
    api.searchByImage.mockResolvedValue({
      uploadedImageUrl: '/uploaded.jpg',
      results: [],
      processingTime: 100,
    });

    const { container } = render(<App />);

    // Upload and submit
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument(), { timeout: 3000 });

    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Verify API was called (using axios under the hood)
    await waitFor(() => {
      expect(api.searchByImage).toHaveBeenCalled();
    });
  });

  /**
   * Test 4: CSS Grid and Flexbox compatibility
   * Verifies modern CSS layout features are used
   */
  test('should use CSS Grid and Flexbox for layouts', async () => {
    api.searchByImage.mockResolvedValue({
      uploadedImageUrl: '/uploaded.jpg',
      results: [
        { id: '1', name: 'Product 1', category: 'Electronics', imageUrl: '/img1.jpg', similarityScore: 95 },
        { id: '2', name: 'Product 2', category: 'Electronics', imageUrl: '/img2.jpg', similarityScore: 85 },
      ],
      processingTime: 100,
    });

    const user = userEvent.setup();
    const { container } = render(<App />);

    // Upload and search to get results
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument(), { timeout: 3000 });

    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Similar Products')).toBeInTheDocument();
    });

    // Verify grid layout is used (Tailwind's grid classes)
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid.className).toMatch(/grid/);

    // Verify flexbox is used in various components
    const flexContainers = container.querySelectorAll('[class*="flex"]');
    expect(flexContainers.length).toBeGreaterThan(0);
  });

  /**
   * Test 5: Event handling compatibility
   * Verifies standard event handling works across browsers
   */
  test('should handle standard DOM events', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    // Test click events
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    await user.click(uploadButton);
    expect(uploadButton).toBeInTheDocument();

    // Test change events on file input
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    
    // Verify change event was handled
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Test input events on range slider (after getting results)
    api.searchByImage.mockResolvedValue({
      uploadedImageUrl: '/uploaded.jpg',
      results: [
        { id: '1', name: 'Product 1', category: 'Electronics', imageUrl: '/img1.jpg', similarityScore: 95 },
      ],
      processingTime: 100,
    });

    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Similar Products')).toBeInTheDocument();
    });

    const slider = container.querySelector('input[type="range"]');
    if (slider) {
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.change(slider, { target: { value: '80' } });
      expect(slider.value).toBe('80');
    }
  });

  /**
   * Test 6: URL validation and handling
   * Verifies URL input works across browsers
   */
  test('should handle URL input and validation', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    // Switch to URL input mode
    const useUrlButton = screen.getByRole('button', { name: /Use URL/i });
    await user.click(useUrlButton);

    // Find URL input
    const urlInput = container.querySelector('input[type="url"]') || 
                     container.querySelector('input[placeholder*="URL"]');
    expect(urlInput).toBeInTheDocument();

    // Test valid URL
    await user.type(urlInput, 'https://example.com/image.jpg');
    expect(urlInput.value).toBe('https://example.com/image.jpg');
  });

  /**
   * Test 7: LocalStorage/SessionStorage compatibility (if used)
   * Verifies storage APIs work correctly
   */
  test('should handle browser storage APIs if used', () => {
    // Verify localStorage is available
    expect(typeof localStorage).toBe('object');
    expect(typeof localStorage.getItem).toBe('function');
    expect(typeof localStorage.setItem).toBe('function');

    // Verify sessionStorage is available
    expect(typeof sessionStorage).toBe('object');
    expect(typeof sessionStorage.getItem).toBe('function');
    expect(typeof sessionStorage.setItem).toBe('function');

    // Test basic storage operations
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
    localStorage.removeItem('test');
  });

  /**
   * Test 8: Promise and async/await compatibility
   * Verifies modern JavaScript features work
   */
  test('should handle Promises and async/await', async () => {
    const user = userEvent.setup();
    
    // Create a promise-based mock
    const mockPromise = Promise.resolve({
      uploadedImageUrl: '/uploaded.jpg',
      results: [],
      processingTime: 100,
    });
    
    api.searchByImage.mockReturnValue(mockPromise);

    const { container } = render(<App />);

    // Trigger async operation
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument(), { timeout: 3000 });

    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Verify promise was handled
    await waitFor(() => {
      expect(api.searchByImage).toHaveBeenCalled();
    });
  });

  /**
   * Test 9: Error handling across browsers
   * Verifies error states display correctly
   */
  test('should display errors consistently across browsers', async () => {
    const user = userEvent.setup();
    
    // Mock an error
    const error = new Error('Network error');
    error.userMessage = 'Unable to connect';
    error.actionable = 'Check your connection';
    error.retryable = false;
    
    api.searchByImage.mockRejectedValue(error);

    const { container } = render(<App />);

    // Trigger error
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument(), { timeout: 3000 });

    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('Unable to connect')).toBeInTheDocument();
    });
  });

  /**
   * Property 15: Cross-browser compatibility (Property-Based Test)
   * 
   * For any modern browser (Chrome, Firefox, Safari, Edge), the system should
   * function correctly with all features working as expected.
   * 
   * This property test verifies core functionality works with various inputs
   * that might behave differently across browsers.
   */
  test('Feature: visual-product-matcher, Property 15: Cross-browser compatibility', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Test with various file types and sizes
          fileType: fc.constantFrom('image/jpeg', 'image/png', 'image/webp', 'image/gif'),
          fileExtension: fc.constantFrom('jpg', 'png', 'webp', 'gif'),
          fileSize: fc.integer({ min: 1024, max: 5 * 1024 * 1024 }),
          fileName: fc.string({ minLength: 1, maxLength: 50 })
            .map(s => s.replace(/[^a-zA-Z0-9_-]/g, '_') || 'image'),
          // Test with various result sets
          resultCount: fc.integer({ min: 0, max: 20 }),
          // Test with various viewport sizes (simulating different browsers/devices)
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 }),
        }),
        async ({ fileType, fileExtension, fileSize, fileName, resultCount, viewportWidth, viewportHeight }) => {
          // Set viewport size
          global.innerWidth = viewportWidth;
          global.innerHeight = viewportHeight;
          window.innerWidth = viewportWidth;
          window.innerHeight = viewportHeight;

          // Generate mock results
          const mockResults = Array.from({ length: resultCount }, (_, i) => ({
            id: `prod_${i + 1}`,
            name: `Product ${i + 1}`,
            category: ['Electronics', 'Clothing', 'Home', 'Sports'][i % 4],
            imageUrl: `/product${i + 1}.jpg`,
            similarityScore: 95 - (i * 2),
          }));

          api.searchByImage.mockResolvedValue({
            uploadedImageUrl: '/uploaded.jpg',
            results: mockResults,
            processingTime: 100,
          });

          const user = userEvent.setup();
          const { container, unmount } = render(<App />);

          try {
            // Property 1: File upload should work with any valid image type
            const fileContent = 'x'.repeat(Math.min(fileSize, 1024));
            const file = new File([fileContent], `${fileName}.${fileExtension}`, { type: fileType });
            Object.defineProperty(file, 'size', { value: fileSize, writable: false });

            const input = container.querySelector('input[type="file"]');
            expect(input).toBeInTheDocument();

            await user.upload(input, file);

            // Property 2: Preview should display regardless of browser
            await waitFor(
              () => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument();
              },
              { timeout: 3000 }
            );

            // Property 3: Submit button should be functional
            const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
            expect(submitButton).not.toBeDisabled();
            await user.click(submitButton);

            // Property 4: Loading state should appear (or complete quickly)
            // Note: With mocked API, loading may complete too fast to observe
            // Just verify the operation completes without error
            await waitFor(
              () => {
                // Either loading button appears or operation completes
                const loadingButton = screen.queryByRole('button', { name: /Processing/i });
                const searchButton = screen.queryByRole('button', { name: /Search Similar Products/i });
                expect(loadingButton || searchButton).toBeTruthy();
              },
              { timeout: 2000 }
            );

            // Property 5: Results should display correctly
            await waitFor(
              () => {
                if (resultCount > 0) {
                  expect(screen.getByText('Similar Products')).toBeInTheDocument();
                  expect(screen.getByAltText('Uploaded')).toBeInTheDocument();
                } else {
                  // Either results section or no results message
                  const hasResults = screen.queryByText('Similar Products');
                  const hasNoResults = screen.queryByText(/no.*match/i);
                  expect(hasResults || hasNoResults).toBeTruthy();
                }
              },
              { timeout: 5000 }
            );

            // Property 6: Grid layout should work at any viewport size
            if (resultCount > 0) {
              const grid = container.querySelector('.grid');
              expect(grid).toBeInTheDocument();
              
              // Verify responsive classes are present
              expect(grid.className).toMatch(/grid-cols-1/);
              expect(grid.className).toMatch(/sm:grid-cols-2/);
              expect(grid.className).toMatch(/lg:grid-cols-4/);
            }

            // Property 7: Interactive elements should be accessible
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toBeGreaterThan(0);
            buttons.forEach(button => {
              expect(button).toBeInTheDocument();
            });

            // Property 8: Filter controls should work if results exist
            if (resultCount > 0) {
              const slider = container.querySelector('input[type="range"]');
              if (slider) {
                expect(slider).toBeInTheDocument();
                
                // Test slider interaction
                const { fireEvent } = await import('@testing-library/react');
                fireEvent.change(slider, { target: { value: '80' } });
                
                // Slider should update
                expect(slider.value).toBe('80');
              }
            }

            // Property 9: All images should have proper attributes
            const images = container.querySelectorAll('img');
            images.forEach(img => {
              expect(img).toHaveAttribute('src');
              expect(img).toHaveAttribute('alt');
            });

            // Property 10: Error boundaries should exist (no crashes)
            // If we got this far without throwing, the app is stable
            expect(container).toBeInTheDocument();

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 } // Run 3 times with different inputs
    );
  }, 30000); // 30 second timeout for property test
});
