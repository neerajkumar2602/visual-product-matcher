/**
 * FilterControl Component
 * Provides a slider to filter search results by similarity threshold
 * 
 * @param {Object} props
 * @param {number} props.minScore - Minimum possible score (default: 0)
 * @param {number} props.maxScore - Maximum possible score (default: 100)
 * @param {number} props.currentThreshold - Current threshold value
 * @param {Function} props.onThresholdChange - Callback when threshold changes
 * @param {number} props.resultCount - Number of results matching the threshold
 */
function FilterControl({ 
  minScore = 0, 
  maxScore = 100, 
  currentThreshold, 
  onThresholdChange, 
  resultCount 
}) {
  const handleSliderChange = (event) => {
    const newThreshold = parseFloat(event.target.value);
    onThresholdChange(newThreshold);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 mb-4 sm:mb-6">
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {/* Header - Responsive */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-medium text-gray-900">
            Similarity Threshold
          </h3>
          <span className="text-base sm:text-lg font-semibold text-blue-600">
            {Math.round(currentThreshold)}%
          </span>
        </div>

        {/* Slider - Touch-friendly */}
        <div className="relative">
          <input
            type="range"
            min={minScore}
            max={maxScore}
            step="1"
            value={currentThreshold}
            onChange={handleSliderChange}
            className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
            aria-label="Similarity threshold slider"
          />
          <style>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 24px;
              height: 24px;
              background: #2563eb;
              border-radius: 50%;
              cursor: pointer;
              transition: transform 0.2s;
            }
            .slider::-webkit-slider-thumb:active {
              transform: scale(1.2);
            }
            .slider::-moz-range-thumb {
              width: 24px;
              height: 24px;
              background: #2563eb;
              border-radius: 50%;
              cursor: pointer;
              border: none;
              transition: transform 0.2s;
            }
            .slider::-moz-range-thumb:active {
              transform: scale(1.2);
            }
            @media (min-width: 640px) {
              .slider::-webkit-slider-thumb {
                width: 20px;
                height: 20px;
              }
              .slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
              }
            }
          `}</style>
        </div>

        {/* Result Count - Responsive */}
        <div className="text-sm sm:text-base text-gray-600">
          Showing <span className="font-semibold text-gray-900">{resultCount}</span> {resultCount === 1 ? 'result' : 'results'}
        </div>
      </div>
    </div>
  );
}

export default FilterControl;
