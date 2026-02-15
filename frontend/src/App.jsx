import { useState } from 'react';
import UploadInterface from './components/UploadInterface';
import SearchResults from './components/SearchResults';
import { searchByImage } from './services/api';

function App() {
  // Application state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 2;

  /**
   * Handle image submission and search
   */
  const handleImageSubmit = async (imageData) => {
    setIsLoading(true);
    setError(null);
    
    // Set uploaded image immediately for preview
    setUploadedImage(typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData));
    
    try {
      // Call API to search for similar products
      const response = await searchByImage(imageData);
      
      // Update state with results
      setSearchResults(response.results || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Search error:', err);
      
      // Handle retryable errors
      if (err.retryable && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        
        // Retry after a short delay
        setTimeout(() => {
          handleImageSubmit(imageData);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        
        return;
      }
      
      // Set error state for non-retryable or max retries exceeded
      setError({
        message: err.userMessage || 'An error occurred while searching',
        actionable: err.actionable || 'Please try again',
        retryable: err.retryable && retryCount < MAX_RETRIES,
      });
      
      // Reset retry count
      setRetryCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle manual retry
   */
  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
  };

  /**
   * Handle filter change (optional - can be used for analytics)
   */
  const handleFilterChange = (threshold) => {
    // This can be used for analytics or other purposes
    console.log('Filter threshold changed to:', threshold);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Visual Product Matcher
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Description - Responsive */}
        {!uploadedImage && (
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-black font-bold">
              Upload an image to find visually similar products
            </p>
          </div>
        )}

        {/* Error Display - Responsive */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {error.message}
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error.actionable}
                </p>
                {error.retryable && (
                  <button
                    onClick={handleRetry}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Interface */}
        <UploadInterface 
          onImageSubmit={handleImageSubmit}
          isLoading={isLoading}
        />

        {/* Search Results */}
        <SearchResults
          uploadedImage={uploadedImage}
          products={searchResults}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
