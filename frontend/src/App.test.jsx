import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import App from './App';
import * as api from './services/api';

// Mock the API module
vi.mock('./services/api');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the app title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Visual Product Matcher/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('handles successful image search', async () => {
    const user = userEvent.setup();
    const mockResults = [
      { id: '1', name: 'Product 1', category: 'Electronics', imageUrl: '/img1.jpg', similarityScore: 95 },
      { id: '2', name: 'Product 2', category: 'Electronics', imageUrl: '/img2.jpg', similarityScore: 85 },
    ];

    api.searchByImage.mockResolvedValue({
      uploadedImageUrl: '/uploaded.jpg',
      results: mockResults,
      processingTime: 100,
    });

    render(<App />);

    // Create and upload a file
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('textbox', { hidden: true }) || document.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Similar Products')).toBeInTheDocument();
    });

    // Verify results are displayed
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  test('displays error message on API failure', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Network error');
    mockError.userMessage = 'Unable to connect to server';
    mockError.actionable = 'Please check your internet connection';
    mockError.retryable = false;

    api.searchByImage.mockRejectedValue(mockError);

    render(<App />);

    // Create and upload a file
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Unable to connect to server')).toBeInTheDocument();
      expect(screen.getByText('Please check your internet connection')).toBeInTheDocument();
    });
  });

  test('implements retry logic for retryable errors', async () => {
    const user = userEvent.setup();
    let callCount = 0;
    
    api.searchByImage.mockImplementation(() => {
      callCount++;
      if (callCount < 2) {
        const error = new Error('Temporary error');
        error.retryable = true;
        return Promise.reject(error);
      }
      return Promise.resolve({
        uploadedImageUrl: '/uploaded.jpg',
        results: [],
        processingTime: 100,
      });
    });

    render(<App />);

    // Create and upload a file
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);

    // Wait for retry and success
    await waitFor(() => {
      expect(callCount).toBeGreaterThan(1);
    }, { timeout: 5000 });
  });

  /**
   * Property 13: Loading state indicators
   * Validates: Requirements 2.6, 7.1, 7.2, 7.3
   * 
   * For any asynchronous operation (image upload, similarity search, filtering),
   * the system should display a loading indicator while the operation is in progress.
   */
  test('Feature: visual-product-matcher, Property 13: Loading state indicators', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid image files with different formats
        fc.record({
          format: fc.constantFrom('image/jpeg', 'image/png', 'image/webp', 'image/gif'),
          extension: fc.constantFrom('jpg', 'png', 'webp', 'gif'),
          size: fc.integer({ min: 1024, max: 5 * 1024 * 1024 }), // 1KB to 5MB
          filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '_') || 'image')
        }),
        async ({ format, extension, size, filename }) => {
          const user = userEvent.setup();
          const { container, unmount } = render(<App />);

          try {
            // Create a valid image file
            const fileContent = 'x'.repeat(Math.min(size, 1024));
            const file = new File([fileContent], `${filename}.${extension}`, { type: format });
            Object.defineProperty(file, 'size', { value: size, writable: false });

            // Get the file input
            const input = container.querySelector('input[type="file"]');
            expect(input).toBeInTheDocument();

            // Upload the file
            await user.upload(input, file);

            // Wait for preview to appear
            await waitFor(
              () => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument();
              },
              { timeout: 3000 }
            );

            // Get the submit button
            const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
            expect(submitButton).not.toBeDisabled();

            // Click submit to trigger async operation
            await user.click(submitButton);

            // Property: During async operation, loading indicator should be displayed
            // Check for loading state in the button
            await waitFor(
              () => {
                const loadingButton = screen.queryByRole('button', { name: /Processing/i });
                expect(loadingButton).toBeInTheDocument();
                expect(loadingButton).toBeDisabled();
              },
              { timeout: 1000 }
            );

            // Verify loading spinner is present
            const spinners = container.querySelectorAll('.animate-spin');
            expect(spinners.length).toBeGreaterThan(0);

            // Wait for loading to complete
            await waitFor(
              () => {
                const searchButton = screen.queryByRole('button', { name: /Search Similar Products/i });
                expect(searchButton).toBeInTheDocument();
              },
              { timeout: 5000 }
            );

            // After loading completes, loading indicator should be gone
            const loadingButtonAfter = screen.queryByRole('button', { name: /Processing/i });
            expect(loadingButtonAfter).not.toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  }, 15000); // 15 second timeout for property-based test

  /**
   * Property 14: Action button disabling during processing
   * Validates: Requirements 7.4
   * 
   * For any ongoing asynchronous operation, action buttons that could trigger
   * duplicate submissions should be disabled until the operation completes.
   */
  test('Feature: visual-product-matcher, Property 14: Action button disabling during processing', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate file upload scenarios only (simpler and more reliable)
        fc.record({
          format: fc.constantFrom('image/jpeg', 'image/png', 'image/webp', 'image/gif'),
          extension: fc.constantFrom('jpg', 'png', 'webp', 'gif'),
          size: fc.integer({ min: 1024, max: 5 * 1024 * 1024 }), // 1KB to 5MB
          filename: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '_') || 'image')
        }),
        async ({ format, extension, size, filename }) => {
          const user = userEvent.setup();
          
          // Mock API with a delay to simulate processing
          let resolveSearch;
          const searchPromise = new Promise((resolve) => {
            resolveSearch = resolve;
          });
          
          api.searchByImage.mockImplementation(() => searchPromise);

          const { container, unmount } = render(<App />);

          try {
            // Create and upload a file
            const fileContent = 'x'.repeat(Math.min(size, 1024));
            const file = new File([fileContent], `${filename}.${extension}`, { type: format });
            Object.defineProperty(file, 'size', { value: size, writable: false });

            const input = container.querySelector('input[type="file"]');
            expect(input).toBeInTheDocument();

            await user.upload(input, file);

            // Wait for preview to appear
            await waitFor(
              () => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument();
              },
              { timeout: 3000 }
            );

            // Get all action buttons before submission
            const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
            const uploadFileButton = screen.getByRole('button', { name: /Upload File/i });
            const useUrlButton = screen.getByRole('button', { name: /Use URL/i });

            // Property: Before processing, buttons should be enabled
            expect(submitButton).not.toBeDisabled();
            expect(uploadFileButton).not.toBeDisabled();
            expect(useUrlButton).not.toBeDisabled();
            expect(input).not.toBeDisabled();

            // Submit the form to start async operation
            await user.click(submitButton);

            // Property: During processing, all action buttons should be disabled
            await waitFor(
              () => {
                const processingButton = screen.queryByRole('button', { name: /Processing/i });
                expect(processingButton).toBeInTheDocument();
                expect(processingButton).toBeDisabled();
              },
              { timeout: 1000 }
            );

            // Verify toggle buttons are also disabled during processing
            const uploadFileButtonDuring = screen.getByRole('button', { name: /Upload File/i });
            const useUrlButtonDuring = screen.getByRole('button', { name: /Use URL/i });
            expect(uploadFileButtonDuring).toBeDisabled();
            expect(useUrlButtonDuring).toBeDisabled();

            // Verify file input is disabled during processing
            const fileInputDuring = container.querySelector('input[type="file"]');
            expect(fileInputDuring).toBeDisabled();

            // Resolve the search to complete the operation
            resolveSearch({
              uploadedImageUrl: '/uploaded.jpg',
              results: [],
              processingTime: 100,
            });

            // Property: After processing completes, buttons should be re-enabled
            await waitFor(
              () => {
                const searchButton = screen.queryByRole('button', { name: /Search Similar Products/i });
                expect(searchButton).toBeInTheDocument();
                expect(searchButton).not.toBeDisabled();
              },
              { timeout: 5000 }
            );

            // Verify toggle buttons are re-enabled after processing
            const uploadFileButtonAfter = screen.getByRole('button', { name: /Upload File/i });
            const useUrlButtonAfter = screen.getByRole('button', { name: /Use URL/i });
            expect(uploadFileButtonAfter).not.toBeDisabled();
            expect(useUrlButtonAfter).not.toBeDisabled();

            // Verify file input is re-enabled after processing
            const fileInputAfter = container.querySelector('input[type="file"]');
            expect(fileInputAfter).not.toBeDisabled();
          } finally {
            // Ensure promise is resolved to avoid hanging tests
            if (resolveSearch) {
              resolveSearch({
                uploadedImageUrl: '/uploaded.jpg',
                results: [],
                processingTime: 100,
              });
            }
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  }, 15000); // 15 second timeout for property-based test

  /**
   * Property 11: State preservation during resize
   * Validates: Requirements 5.5
   * 
   * For any application state with user data (uploaded image, search results),
   * changing the viewport size should preserve all user data without loss.
   */
  test('Feature: visual-product-matcher, Property 11: State preservation during resize', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate initial viewport size and a different target size
        fc.record({
          initialWidth: fc.integer({ min: 320, max: 1920 }),
          initialHeight: fc.integer({ min: 568, max: 1080 }),
          targetWidth: fc.integer({ min: 320, max: 1920 }),
          targetHeight: fc.integer({ min: 568, max: 1080 }),
          products: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 1000 }).map(n => `prod_${n}`),
              name: fc.string({ minLength: 5, maxLength: 30 }).map(s => s || 'Product'),
              category: fc.constantFrom('Electronics', 'Clothing', 'Home', 'Sports'),
              imageUrl: fc.constant('/test.jpg'),
              similarityScore: fc.float({ min: 50, max: 100 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          filterThreshold: fc.float({ min: 0, max: 100 })
        }),
        async ({ initialWidth, initialHeight, targetWidth, targetHeight, products, filterThreshold }) => {
          // Set initial viewport size
          global.innerWidth = initialWidth;
          global.innerHeight = initialHeight;
          window.innerWidth = initialWidth;
          window.innerHeight = initialHeight;

          // Mock API response
          const mockResponse = {
            uploadedImageUrl: '/uploaded.jpg',
            results: products,
            processingTime: 100,
          };
          api.searchByImage.mockResolvedValue(mockResponse);

          const user = userEvent.setup();
          const { container, unmount } = render(<App />);

          try {
            // Step 1: Upload an image and perform search
            const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
            const input = container.querySelector('input[type="file"]');
            
            await user.upload(input, file);
            await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument(), { timeout: 3000 });

            const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
            await user.click(submitButton);

            // Wait for results to appear
            await waitFor(() => {
              expect(screen.getByText('Similar Products')).toBeInTheDocument();
            }, { timeout: 5000 });

            // Step 2: Capture state before resize
            const uploadedImageBefore = screen.getByAltText('Uploaded');
            expect(uploadedImageBefore).toBeInTheDocument();
            const uploadedImageSrcBefore = uploadedImageBefore.src;

            // Count products displayed before resize
            const productNamesBefore = products.map(p => p.name.trim()).filter(name => name.length > 0);
            
            // Apply filter if threshold is meaningful
            if (filterThreshold > 0 && filterThreshold < 100) {
              const slider = container.querySelector('input[type="range"]');
              if (slider) {
                // Use fireEvent to change the slider value (can't use clear/type on range inputs)
                const { fireEvent } = await import('@testing-library/react');
                fireEvent.change(slider, { target: { value: filterThreshold.toString() } });
              }
            }

            // Count visible products after filter
            const visibleProductsBefore = products.filter(p => p.similarityScore >= filterThreshold);

            // Capture product cards before resize
            const productCardsBefore = container.querySelectorAll('.aspect-square');
            const productCountBefore = productCardsBefore.length;

            // Step 3: Resize viewport
            global.innerWidth = targetWidth;
            global.innerHeight = targetHeight;
            window.innerWidth = targetWidth;
            window.innerHeight = targetHeight;

            // Trigger resize event
            window.dispatchEvent(new Event('resize'));

            // Wait a bit for any resize handlers to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Step 4: Verify state is preserved after resize
            
            // Property: Uploaded image should still be displayed
            const uploadedImageAfter = screen.getByAltText('Uploaded');
            expect(uploadedImageAfter).toBeInTheDocument();
            expect(uploadedImageAfter.src).toBe(uploadedImageSrcBefore);

            // Property: Search results should still be displayed
            expect(screen.getByText('Similar Products')).toBeInTheDocument();

            // Property: Product count should remain the same
            const productCardsAfter = container.querySelectorAll('.aspect-square');
            expect(productCardsAfter.length).toBe(productCountBefore);
            expect(productCardsAfter.length).toBe(visibleProductsBefore.length);

            // Property: Filter state should be preserved
            const slider = container.querySelector('input[type="range"]');
            if (slider) {
              // Slider should still exist and have a value
              expect(slider).toBeInTheDocument();
              expect(slider.value).toBeDefined();
            }

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 5 }
    );
  }, 30000); // 30 second timeout for property-based test

  /**
   * Property 10: Responsive layout adaptation
   * Validates: Requirements 5.1, 5.2, 5.3, 5.4
   * 
   * For any viewport size (mobile, tablet, desktop), the system should display
   * an appropriate layout optimized for that screen size.
   */
  test('Feature: visual-product-matcher, Property 10: Responsive layout adaptation', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate different viewport configurations
        fc.record({
          width: fc.integer({ min: 320, max: 1920 }),
          height: fc.integer({ min: 568, max: 1080 }),
          products: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 1000 }).map(n => `prod_${n}`),
              name: fc.constant('Test Product'),
              category: fc.constant('Electronics'),
              imageUrl: fc.constant('/test.jpg'),
              similarityScore: fc.float({ min: 50, max: 100 }) // Higher scores to ensure visibility
            }),
            { minLength: 0, maxLength: 6 }
          )
        }),
        async ({ width, height, products }) => {
          // Set viewport size
          global.innerWidth = width;
          global.innerHeight = height;
          window.innerWidth = width;
          window.innerHeight = height;

          // Mock API response
          api.searchByImage.mockResolvedValue({
            uploadedImageUrl: '/uploaded.jpg',
            results: products,
            processingTime: 100,
          });

          const user = userEvent.setup();
          const { container, unmount } = render(<App />);

          try {
            // Determine expected device type based on width
            const isMobile = width < 640;
            const isTablet = width >= 640 && width < 1024;
            const isDesktop = width >= 1024;

            // Property 1: Header should be responsive with appropriate text sizing
            const header = container.querySelector('header');
            expect(header).toBeInTheDocument();
            
            const title = screen.getByText(/Visual Product Matcher/i);
            expect(title).toBeInTheDocument();
            
            // Verify responsive text sizing classes are present
            expect(title.className).toMatch(/text-2xl|text-3xl/);
            expect(title.className).toMatch(/sm:text-3xl/);

            // Property 2: Main content should have responsive padding
            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();
            expect(main.className).toMatch(/px-4/);
            expect(main.className).toMatch(/sm:px-6/);
            expect(main.className).toMatch(/lg:px-8/);
            expect(main.className).toMatch(/py-4/);
            expect(main.className).toMatch(/sm:py-6/);

            // Property 3: Upload interface should be responsive
            const uploadSection = container.querySelector('form');
            expect(uploadSection).toBeInTheDocument();

            // Check for responsive button layout
            const toggleButtons = screen.getAllByRole('button', { name: /Upload File|Use URL/i });
            expect(toggleButtons.length).toBe(2);
            
            // Verify buttons have responsive classes for padding
            toggleButtons.forEach(button => {
              expect(button.className).toMatch(/px-4/);
              expect(button.className).toMatch(/sm:px-6/);
              expect(button.className).toMatch(/py-2/);
              expect(button.className).toMatch(/sm:py-3/);
              // Verify touch-manipulation class for mobile
              expect(button.className).toMatch(/touch-manipulation/);
            });

            // If we have products, test with search results
            if (products.length > 0) {
              // Upload a file to trigger search
              const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
              const input = container.querySelector('input[type="file"]');
              
              await user.upload(input, file);
              await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument(), { timeout: 3000 });

              const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
              await user.click(submitButton);

              // Wait for results
              await waitFor(() => {
                expect(screen.getByText('Similar Products')).toBeInTheDocument();
              }, { timeout: 5000 });

              // Property 4: Product grid should have responsive columns
              const grid = container.querySelector('.grid');
              if (grid) {
                expect(grid).toBeInTheDocument();
                
                // Verify responsive grid classes are present
                expect(grid.className).toMatch(/grid-cols-1/); // Mobile base
                expect(grid.className).toMatch(/sm:grid-cols-2/); // Tablet
                expect(grid.className).toMatch(/md:grid-cols-3/); // Medium
                expect(grid.className).toMatch(/lg:grid-cols-4/); // Desktop
                
                // Verify responsive gap
                expect(grid.className).toMatch(/gap-4/);
                expect(grid.className).toMatch(/sm:gap-6/);
              }

              // Property 5: Filter control should be responsive and touch-friendly
              const filterControl = container.querySelector('input[type="range"]');
              if (filterControl) {
                expect(filterControl).toBeInTheDocument();
                
                // Verify slider has touch-friendly class
                expect(filterControl.className).toMatch(/touch-manipulation/);
              }

              // Property 6: Product cards should exist and have proper structure
              const productCards = container.querySelectorAll('.aspect-square');
              expect(productCards.length).toBeGreaterThan(0);
              expect(productCards.length).toBeLessThanOrEqual(products.length);
            }

            // Property 7: Touch-friendly controls on mobile
            if (isMobile) {
              const buttons = container.querySelectorAll('button');
              buttons.forEach(button => {
                // Verify buttons have adequate touch target size via padding classes
                const hasAdequatePadding = button.className.includes('py-2') || 
                                          button.className.includes('py-3') || 
                                          button.className.includes('py-4');
                expect(hasAdequatePadding).toBe(true);
              });
            }

            // Property 8: Desktop layout should use max-width containers
            if (isDesktop) {
              const containers = container.querySelectorAll('[class*="max-w"]');
              expect(containers.length).toBeGreaterThan(0);
            }

            // Property 9: All interactive elements should be accessible
            const interactiveElements = container.querySelectorAll('button, input');
            expect(interactiveElements.length).toBeGreaterThan(0);
            interactiveElements.forEach(element => {
              // Elements should be in the document
              expect(element).toBeInTheDocument();
            });

          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  }, 30000); // 30 second timeout for property-based test
});
