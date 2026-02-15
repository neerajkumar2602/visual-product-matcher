import { useState, useRef } from 'react';

/**
 * UploadInterface Component
 * Handles image upload via file selection, drag-and-drop, or URL input
 * 
 * @param {Object} props
 * @param {Function} props.onImageSubmit - Callback when image is submitted (receives File or URL string)
 * @param {boolean} props.isLoading - Whether upload/processing is in progress
 */
function UploadInterface({ onImageSubmit, isLoading }) {
  const [inputType, setInputType] = useState('file'); // 'file' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Supported image formats
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate image file
   */
  const validateFile = (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds limit. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
    }
    return null;
  };

  /**
   * Validate image URL
   */
  const validateUrl = (url) => {
    try {
      new URL(url);
      return null;
    } catch {
      return 'Invalid URL format. Please enter a valid image URL.';
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (file) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setPreviewUrl(null);
      setSelectedFile(null);
      return;
    }

    // Store the file
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle URL input change
   */
  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setError(null);
  };

  /**
   * Handle URL load
   */
  const handleUrlLoad = () => {
    setError(null);
    
    const validationError = validateUrl(imageUrl);
    if (validationError) {
      setError(validationError);
      setPreviewUrl(null);
      return;
    }

    // Set preview to the URL
    setPreviewUrl(imageUrl);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputType === 'file') {
      // Use the stored file from drag-drop or file selection
      if (selectedFile && !error) {
        onImageSubmit(selectedFile);
      }
    } else {
      if (imageUrl && !error && previewUrl) {
        onImageSubmit(imageUrl);
      }
    }
  };

  /**
   * Trigger file input click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      {/* Input Type Toggle - Responsive */}
      <div className="flex gap-2 mb-4 sm:mb-6">
        <button
          type="button"
          onClick={() => {
            setInputType('file');
            setError(null);
            setPreviewUrl(null);
            setSelectedFile(null);
            setImageUrl('');
          }}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors touch-manipulation ${
            inputType === 'file'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
          }`}
          disabled={isLoading}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => {
            setInputType('url');
            setError(null);
            setPreviewUrl(null);
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors touch-manipulation ${
            inputType === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
          }`}
          disabled={isLoading}
        >
          Use URL
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* File Upload Section */}
        {inputType === 'file' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_FORMATS.join(',')}
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            
            {/* Drag and Drop Area - Responsive */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={!isLoading ? handleBrowseClick : undefined}
            >
              <svg
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                JPEG, PNG, WebP, or GIF (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
              </p>
            </div>
          </div>
        )}

        {/* URL Input Section - Responsive */}
        {inputType === 'url' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleUrlLoad}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation whitespace-nowrap"
                disabled={isLoading || !imageUrl}
              >
                Load
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Image Preview - Responsive */}
        {previewUrl && !error && (
          <div className="mt-4 sm:mt-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-48 sm:max-h-64 md:max-h-80 object-contain rounded-lg border border-gray-300"
              />
            </div>
          </div>
        )}

        {/* Submit Button - Touch-friendly */}
        <button
          type="submit"
          disabled={isLoading || !previewUrl || error}
          className="mt-4 sm:mt-6 w-full px-6 py-3 sm:py-4 bg-blue-600 text-white font-medium text-base sm:text-lg rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Search Similar Products'
          )}
        </button>
      </form>
    </div>
  );
}

export default UploadInterface;
