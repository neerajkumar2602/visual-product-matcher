import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import UploadInterface from './UploadInterface';

describe('UploadInterface', () => {
  const mockOnImageSubmit = vi.fn();

  it('renders file upload mode by default', () => {
    render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it('switches between file and URL input modes', async () => {
    const user = userEvent.setup();
    render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    // Initially in file mode
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
    
    // Switch to URL mode
    await user.click(screen.getByText('Use URL'));
    expect(screen.getByPlaceholderText(/Enter image URL/i)).toBeInTheDocument();
    
    // Switch back to file mode
    await user.click(screen.getByText('Upload File'));
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
  });

  it('displays error for invalid file type', async () => {
    const user = userEvent.setup();
    const { container } = render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = container.querySelector('input[type="file"]');
    
    // Trigger the change event
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  it('displays error for oversized file', async () => {
    const user = userEvent.setup();
    const { container } = render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, largeFile);
    
    await waitFor(() => {
      expect(screen.getByText(/File size exceeds limit/i)).toBeInTheDocument();
    });
  });

  it('displays error for invalid URL', async () => {
    const user = userEvent.setup();
    render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    // Switch to URL mode
    await user.click(screen.getByText('Use URL'));
    
    // Enter invalid URL
    const urlInput = screen.getByPlaceholderText(/Enter image URL/i);
    await user.type(urlInput, 'not-a-valid-url');
    await user.click(screen.getByText('Load'));
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid URL format/i)).toBeInTheDocument();
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={true} />);
    
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Processing/i })).toBeDisabled();
  });

  it('disables submit button when no image is selected', () => {
    render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    expect(submitButton).toBeDisabled();
  });

  it('accepts valid image file and shows preview', async () => {
    const user = userEvent.setup();
    const { container } = render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
    
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/Preview:/i)).toBeInTheDocument();
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('calls onImageSubmit with file when form is submitted', async () => {
    const user = userEvent.setup();
    const { container } = render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 });
    
    const input = container.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);
    
    expect(mockOnImageSubmit).toHaveBeenCalledWith(file);
  });

  it('loads and displays image from valid URL', async () => {
    const user = userEvent.setup();
    render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    // Switch to URL mode
    await user.click(screen.getByText('Use URL'));
    
    // Enter valid URL
    const urlInput = screen.getByPlaceholderText(/Enter image URL/i);
    await user.type(urlInput, 'https://example.com/image.jpg');
    await user.click(screen.getByText('Load'));
    
    await waitFor(() => {
      expect(screen.getByText(/Preview:/i)).toBeInTheDocument();
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('calls onImageSubmit with URL when form is submitted in URL mode', async () => {
    const user = userEvent.setup();
    render(<UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />);
    
    // Switch to URL mode
    await user.click(screen.getByText('Use URL'));
    
    // Enter and load valid URL
    const urlInput = screen.getByPlaceholderText(/Enter image URL/i);
    const testUrl = 'https://example.com/image.jpg';
    await user.type(urlInput, testUrl);
    await user.click(screen.getByText('Load'));
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
    await user.click(submitButton);
    
    expect(mockOnImageSubmit).toHaveBeenCalledWith(testUrl);
  });

  /**
   * Property 1: Valid image file acceptance and preview
   * Validates: Requirements 1.1, 1.5
   * 
   * For any valid image file (JPEG, PNG, WebP, GIF) within size limits,
   * uploading it should result in the file being accepted and a preview being displayed.
   */
  it('Property 1: Valid image file acceptance and preview', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid image files with different formats and sizes
        fc.record({
          format: fc.constantFrom('image/jpeg', 'image/png', 'image/webp', 'image/gif'),
          extension: fc.constantFrom('jpg', 'png', 'webp', 'gif'),
          size: fc.integer({ min: 1024, max: 10 * 1024 * 1024 }), // 1KB to 10MB
          filename: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '_') || 'image')
        }),
        async ({ format, extension, size, filename }) => {
          const mockOnImageSubmit = vi.fn();
          const { container, unmount } = render(
            <UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />
          );

          // Create a valid image file
          const fileContent = 'x'.repeat(Math.min(size, 1024)); // Limit actual content for performance
          const file = new File([fileContent], `${filename}.${extension}`, { type: format });
          Object.defineProperty(file, 'size', { value: size, writable: false });

          const input = container.querySelector('input[type="file"]');
          
          // Upload the file
          await userEvent.upload(input, file);

          // Wait for preview to appear
          await waitFor(
            () => {
              const preview = screen.queryByAltText('Preview');
              expect(preview).toBeInTheDocument();
            },
            { timeout: 3000 }
          );

          // Verify no error is displayed
          const errorText = screen.queryByText(/Invalid file type|File size exceeds limit/i);
          expect(errorText).not.toBeInTheDocument();

          // Verify submit button is enabled
          const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
          expect(submitButton).not.toBeDisabled();

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 3 }
    );
  }, 10000); // 10 second timeout for property-based test

  /**
   * Property 2: URL-based image loading
   * Validates: Requirements 1.2
   * 
   * For any valid image URL, providing it to the system should result in
   * the image being fetched and displayed.
   */
  it('Property 2: URL-based image loading', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid image URLs with different domains, paths, and extensions
        fc.record({
          protocol: fc.constantFrom('http', 'https'),
          domain: fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'), { minLength: 3, maxLength: 15 }),
          tld: fc.constantFrom('com', 'org', 'net', 'io', 'co'),
          path: fc.array(
            fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5'), { minLength: 1, maxLength: 10 }),
            { minLength: 0, maxLength: 3 }
          ),
          filename: fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3'), { minLength: 3, maxLength: 15 }),
          extension: fc.constantFrom('jpg', 'jpeg', 'png', 'gif', 'webp')
        }),
        async ({ protocol, domain, tld, path, filename, extension }) => {
          const mockOnImageSubmit = vi.fn();
          const user = userEvent.setup();
          const { unmount } = render(
            <UploadInterface onImageSubmit={mockOnImageSubmit} isLoading={false} />
          );

          // Construct a valid URL
          const pathString = path.length > 0 ? '/' + path.join('/') : '';
          const imageUrl = `${protocol}://${domain}.${tld}${pathString}/${filename}.${extension}`;

          // Switch to URL mode
          await user.click(screen.getByText('Use URL'));

          // Enter the URL
          const urlInput = screen.getByPlaceholderText(/Enter image URL/i);
          await user.type(urlInput, imageUrl);

          // Click Load button
          await user.click(screen.getByText('Load'));

          // Wait for preview to appear
          await waitFor(
            () => {
              const preview = screen.queryByAltText('Preview');
              expect(preview).toBeInTheDocument();
              expect(preview).toHaveAttribute('src', imageUrl);
            },
            { timeout: 3000 }
          );

          // Verify no error is displayed
          const errorText = screen.queryByText(/Invalid URL format/i);
          expect(errorText).not.toBeInTheDocument();

          // Verify submit button is enabled
          const submitButton = screen.getByRole('button', { name: /Search Similar Products/i });
          expect(submitButton).not.toBeDisabled();

          // Verify that clicking submit calls onImageSubmit with the URL
          await user.click(submitButton);
          expect(mockOnImageSubmit).toHaveBeenCalledWith(imageUrl);

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 3 }
    );
  }, 10000); // 10 second timeout for property-based test
});
