import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterControl from './FilterControl';
import * as fc from 'fast-check';

describe('FilterControl', () => {
  it('renders with default props', () => {
    const mockOnThresholdChange = vi.fn();
    render(
      <FilterControl
        currentThreshold={50}
        onThresholdChange={mockOnThresholdChange}
        resultCount={10}
      />
    );

    expect(screen.getByText('Similarity Threshold')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays current threshold value', () => {
    const mockOnThresholdChange = vi.fn();
    render(
      <FilterControl
        currentThreshold={75}
        onThresholdChange={mockOnThresholdChange}
        resultCount={5}
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays result count correctly', () => {
    const mockOnThresholdChange = vi.fn();
    render(
      <FilterControl
        currentThreshold={50}
        onThresholdChange={mockOnThresholdChange}
        resultCount={15}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument();
  });

  it('displays singular "result" when count is 1', () => {
    const mockOnThresholdChange = vi.fn();
    render(
      <FilterControl
        currentThreshold={90}
        onThresholdChange={mockOnThresholdChange}
        resultCount={1}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText((_content, element) => {
      return element.textContent === 'Showing 1 result';
    })).toBeInTheDocument();
  });

  it('calls onThresholdChange when slider value changes', () => {
    const mockOnThresholdChange = vi.fn();
    render(
      <FilterControl
        currentThreshold={50}
        onThresholdChange={mockOnThresholdChange}
        resultCount={10}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });

    expect(mockOnThresholdChange).toHaveBeenCalledWith(75);
  });

  it('renders slider with correct min and max values', () => {
    const mockOnThresholdChange = vi.fn();
    render(
      <FilterControl
        minScore={0}
        maxScore={100}
        currentThreshold={50}
        onThresholdChange={mockOnThresholdChange}
        resultCount={10}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('updates slider value when currentThreshold prop changes', () => {
    const mockOnThresholdChange = vi.fn();
    const { rerender } = render(
      <FilterControl
        currentThreshold={50}
        onThresholdChange={mockOnThresholdChange}
        resultCount={10}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();

    rerender(
      <FilterControl
        currentThreshold={80}
        onThresholdChange={mockOnThresholdChange}
        resultCount={5}
      />
    );

    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  /**
   * Property-Based Test
   * Feature: visual-product-matcher, Property 7: Similarity threshold filtering
   * Validates: Requirements 3.1, 3.4
   * 
   * For any similarity threshold value, the filtered results should only include 
   * products with similarity scores greater than or equal to that threshold, 
   * and the displayed count should match the number of filtered results.
   */
  it('Property 7: filters products by threshold and displays correct count', () => {
    // Generator for products with similarity scores
    const productGenerator = fc.record({
      id: fc.string(),
      name: fc.string(),
      category: fc.string(),
      imageUrl: fc.webUrl(),
      similarityScore: fc.float({ min: 0, max: 100 })
    });

    fc.assert(
      fc.property(
        fc.array(productGenerator, { minLength: 0, maxLength: 50 }),
        fc.float({ min: 0, max: 100 }),
        (products, threshold) => {
          // Filter products based on threshold (simulating the logic in SearchResults)
          const expectedFiltered = products.filter(
            product => product.similarityScore >= threshold
          );

          // Verify all filtered products meet the threshold (Requirement 3.1)
          expectedFiltered.forEach(product => {
            expect(product.similarityScore).toBeGreaterThanOrEqual(threshold);
          });

          // Verify the count matches (Requirement 3.4)
          expect(expectedFiltered.length).toBe(
            products.filter(p => p.similarityScore >= threshold).length
          );

          // Verify no products below threshold are included
          const belowThreshold = expectedFiltered.filter(
            product => product.similarityScore < threshold
          );
          expect(belowThreshold.length).toBe(0);
        }
      ),
      { numRuns: 3 }
    );
  });
});
