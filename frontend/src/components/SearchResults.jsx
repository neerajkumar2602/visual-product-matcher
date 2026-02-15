import { useState, useEffect } from 'react';
import FilterControl from './FilterControl';

/**
 * SearchResults Component
 * Displays uploaded image and grid of similar products with similarity scores
 * 
 * @param {Object} props
 * @param {string} props.uploadedImage - URL or data URL of the uploaded image
 * @param {Array} props.products - Array of product objects with similarity scores
 * @param {Function} props.onFilterChange - Callback when similarity threshold changes
 * @param {boolean} props.isLoading - Whether search is in progress
 */
function SearchResults({ uploadedImage, products = [], onFilterChange, isLoading }) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Filter products based on threshold
  useEffect(() => {
    const filtered = products.filter(
      product => product.similarityScore >= threshold
    );
    setFilteredProducts(filtered);
  }, [products, threshold]);

  const handleThresholdChange = (newThreshold) => {
    setThreshold(newThreshold);
    if (onFilterChange) {
      onFilterChange(newThreshold);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-6 sm:mt-8 px-4 sm:px-0">
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <svg
            className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-600"
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
          <p className="mt-4 text-base sm:text-lg text-gray-600">Searching for similar products...</p>
        </div>
      </div>
    );
  }

  // Return null if no uploaded image
  if (!uploadedImage) {
    return null;
  }

  // Show no results message when products array is empty
  if (products.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-6 sm:mt-8 px-4 sm:px-0">
        <div className="text-center py-12 sm:py-16">
          <svg
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">No similar products found</h3>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Try uploading a different image or adjusting your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 sm:mt-8 px-4 sm:px-0">
      {/* Uploaded Image Section - Responsive */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Your Image</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-full max-w-sm sm:max-w-md mx-auto max-h-48 sm:max-h-64 object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Similar Products
          </h2>
        </div>

        {/* Filter Control */}
        <FilterControl
          minScore={0}
          maxScore={100}
          currentThreshold={threshold}
          onThresholdChange={handleThresholdChange}
          resultCount={filteredProducts.length}
        />

        {/* Product Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols md, 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Similarity Score Badge - Touch-friendly size */}
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                  {Math.round(product.similarityScore)}%
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">{product.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
