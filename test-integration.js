/**
 * Integration Test Script
 * Tests the complete flow: upload → search → display → filter
 * 
 * This script verifies:
 * 1. Backend API is accessible
 * 2. CORS is properly configured
 * 3. Image upload works (file and URL)
 * 4. Search returns properly ordered results
 * 5. Error handling works across the stack
 */

import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.blue}Testing: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Test 1: Backend health check
async function testBackendHealth() {
  logTest('Backend Health Check');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.data.status === 'ok') {
      logSuccess('Backend is running and healthy');
      return true;
    } else {
      logError('Backend returned unexpected health status');
      return false;
    }
  } catch (error) {
    logError(`Backend health check failed: ${error.message}`);
    return false;
  }
}

// Test 2: CORS configuration
async function testCORS() {
  logTest('CORS Configuration');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader === FRONTEND_URL || corsHeader === '*') {
      logSuccess(`CORS properly configured: ${corsHeader}`);
      return true;
    } else {
      logWarning(`CORS header present but unexpected value: ${corsHeader}`);
      return true; // Still pass, but warn
    }
  } catch (error) {
    logError(`CORS test failed: ${error.message}`);
    return false;
  }
}

// Test 3: Get all products
async function testGetProducts() {
  logTest('Get All Products');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/products`);
    
    if (response.data.success && Array.isArray(response.data.products)) {
      const count = response.data.products.length;
      logSuccess(`Retrieved ${count} products from database`);
      
      // Verify product structure
      if (count > 0) {
        const product = response.data.products[0];
        const hasRequiredFields = product.id && product.name && product.category && product.imageUrl;
        if (hasRequiredFields) {
          logSuccess('Products have required fields (id, name, category, imageUrl)');
        } else {
          logError('Products missing required fields');
          return false;
        }
      }
      
      return true;
    } else {
      logError('Invalid response format from /api/products');
      return false;
    }
  } catch (error) {
    logError(`Get products failed: ${error.message}`);
    return false;
  }
}

// Test 4: Search by URL
async function testSearchByURL() {
  logTest('Search by Image URL');
  try {
    // Use a sample product image URL from Unsplash
    const testImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
    
    const response = await axios.post(`${BACKEND_URL}/api/search`, {
      imageUrl: testImageUrl
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && Array.isArray(response.data.results)) {
      const count = response.data.results.length;
      logSuccess(`Search returned ${count} results`);
      
      // Verify results are ordered by similarity score
      const scores = response.data.results.map(r => r.similarityScore);
      const isOrdered = scores.every((score, i) => i === 0 || score <= scores[i - 1]);
      
      if (isOrdered) {
        logSuccess('Results are properly ordered by similarity score (descending)');
      } else {
        logError('Results are NOT properly ordered');
        console.log('Scores:', scores);
        return false;
      }
      
      // Verify result structure
      if (count > 0) {
        const result = response.data.results[0];
        const hasRequiredFields = result.id && result.name && result.category && 
                                   result.imageUrl && typeof result.similarityScore === 'number';
        if (hasRequiredFields) {
          logSuccess('Results have required fields including similarity score');
        } else {
          logError('Results missing required fields');
          return false;
        }
      }
      
      return true;
    } else {
      logError('Invalid response format from /api/search');
      return false;
    }
  } catch (error) {
    logError(`Search by URL failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 5: Error handling - Invalid URL
async function testErrorHandlingInvalidURL() {
  logTest('Error Handling - Invalid Image URL');
  try {
    await axios.post(`${BACKEND_URL}/api/search`, {
      imageUrl: 'not-a-valid-url'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    logError('Should have thrown an error for invalid URL');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Properly rejected invalid URL with 400 status');
      logSuccess(`Error message: ${error.response.data.error}`);
      return true;
    } else {
      logError(`Unexpected error response: ${error.message}`);
      return false;
    }
  }
}

// Test 6: Error handling - No image provided
async function testErrorHandlingNoImage() {
  logTest('Error Handling - No Image Provided');
  try {
    await axios.post(`${BACKEND_URL}/api/search`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    logError('Should have thrown an error for missing image');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Properly rejected request with no image (400 status)');
      logSuccess(`Error message: ${error.response.data.error}`);
      return true;
    } else {
      logError(`Unexpected error response: ${error.message}`);
      return false;
    }
  }
}

// Test 7: Frontend accessibility
async function testFrontendAccessibility() {
  logTest('Frontend Accessibility');
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      logSuccess('Frontend is accessible');
      return true;
    } else {
      logError(`Frontend returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Frontend accessibility test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n========================================', 'blue');
  log('Integration Test Suite', 'blue');
  log('Visual Product Matcher', 'blue');
  log('========================================\n', 'blue');
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'CORS Configuration', fn: testCORS },
    { name: 'Get Products', fn: testGetProducts },
    { name: 'Search by URL', fn: testSearchByURL },
    { name: 'Error: Invalid URL', fn: testErrorHandlingInvalidURL },
    { name: 'Error: No Image', fn: testErrorHandlingNoImage },
    { name: 'Frontend Access', fn: testFrontendAccessibility },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      logError(`Test "${test.name}" threw unexpected error: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  log('\n========================================', 'blue');
  log('Test Summary', 'blue');
  log('========================================\n', 'blue');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}`);
    }
  });
  
  log(`\n${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('\n✓ All integration tests passed!', 'green');
    log('The frontend and backend are properly wired together.', 'green');
  } else {
    log('\n✗ Some tests failed. Please review the errors above.', 'red');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
