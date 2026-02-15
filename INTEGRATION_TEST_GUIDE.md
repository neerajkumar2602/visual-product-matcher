# Integration Testing Guide

This guide provides step-by-step instructions for manually testing the complete integration between the frontend and backend of the Visual Product Matcher application.

## Prerequisites

Before testing, ensure both servers are running:

### Start Backend Server
```bash
cd backend
npm start
```
Backend should be running on: http://localhost:3000

### Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend should be running on: http://localhost:5173

## Automated Integration Tests

Run the automated integration test suite:
```bash
node test-integration.js
```

This will verify:
- Backend health and accessibility
- CORS configuration
- Product database access
- Search functionality (URL-based)
- Error handling
- Frontend accessibility

## Manual Testing Checklist

### Test 1: Upload → Search → Display Flow (File Upload)

1. **Open the application** in your browser: http://localhost:5173
2. **Upload an image file**:
   - Click the "Upload Image" button or drag and drop an image
   - Supported formats: JPEG, PNG, WebP, GIF
   - Max size: 10MB
3. **Verify image preview** appears after upload
4. **Click "Search"** button
5. **Verify loading indicator** appears during processing
6. **Verify results display**:
   - Uploaded image is shown at the top
   - Product grid displays with images, names, categories, and similarity scores
   - Results are ordered by similarity score (highest first)
   - At least some results are returned (up to 20)

**Expected Result**: ✓ Complete flow works without errors

### Test 2: Upload → Search → Display Flow (URL Input)

1. **Open the application** in your browser: http://localhost:5173
2. **Enter an image URL**:
   - Use the URL input field
   - Example URL: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400`
3. **Verify image preview** appears after entering URL
4. **Click "Search"** button
5. **Verify loading indicator** appears during processing
6. **Verify results display** as in Test 1

**Expected Result**: ✓ URL-based search works correctly

### Test 3: Filter Results by Similarity Threshold

1. **Complete Test 1 or Test 2** to get search results
2. **Locate the similarity threshold slider** below the uploaded image
3. **Adjust the slider** to different values (e.g., 50%, 70%, 90%)
4. **Verify filtering behavior**:
   - Only products with similarity scores ≥ threshold are shown
   - Result count updates correctly
   - Original sort order is maintained
   - Filtering happens instantly (no loading)

**Expected Result**: ✓ Filtering works correctly and maintains order

### Test 4: Error Handling - Invalid File Type

1. **Open the application**
2. **Try to upload an invalid file** (e.g., .txt, .pdf, .doc)
3. **Verify error message** appears:
   - Clear, user-friendly message
   - Explains what went wrong
   - Provides actionable guidance

**Expected Result**: ✓ Invalid files are rejected with helpful error message

### Test 5: Error Handling - Invalid URL

1. **Open the application**
2. **Enter an invalid URL** (e.g., "not-a-url", "http://invalid")
3. **Click "Search"**
4. **Verify error message** appears with guidance

**Expected Result**: ✓ Invalid URLs are rejected with helpful error message

### Test 6: Error Handling - Oversized File

1. **Open the application**
2. **Try to upload a file larger than 10MB**
3. **Verify error message** appears indicating file size limit

**Expected Result**: ✓ Oversized files are rejected with size limit message

### Test 7: Loading States

1. **Upload an image and click "Search"**
2. **Verify during processing**:
   - Loading indicator is visible
   - Search button is disabled (prevents duplicate submissions)
   - User cannot submit another search while processing
3. **Verify after processing**:
   - Loading indicator disappears
   - Search button is re-enabled
   - Results are displayed

**Expected Result**: ✓ Loading states work correctly

### Test 8: Responsive Design

Test the application on different screen sizes:

#### Mobile (< 640px)
1. **Resize browser** to mobile width or use device emulation
2. **Verify layout**:
   - Single column layout
   - Touch-friendly controls
   - Readable text and buttons
   - Upload interface is usable
   - Product grid shows 1 column

**Expected Result**: ✓ Mobile layout works correctly

#### Tablet (640px - 1024px)
1. **Resize browser** to tablet width
2. **Verify layout**:
   - 2-3 column product grid
   - Appropriate spacing
   - All features accessible

**Expected Result**: ✓ Tablet layout works correctly

#### Desktop (> 1024px)
1. **Resize browser** to desktop width
2. **Verify layout**:
   - 4 column product grid
   - Optimal use of space
   - All features easily accessible

**Expected Result**: ✓ Desktop layout works correctly

### Test 9: State Preservation During Resize

1. **Upload an image and get search results**
2. **Resize the browser window** (mobile → tablet → desktop)
3. **Verify**:
   - Uploaded image remains visible
   - Search results remain visible
   - Filter settings are preserved
   - No data is lost

**Expected Result**: ✓ State is preserved during viewport changes

### Test 10: Network Error Handling

1. **Stop the backend server** (Ctrl+C in backend terminal)
2. **Try to perform a search** in the frontend
3. **Verify error message** appears:
   - Indicates connection problem
   - Provides retry option
   - User-friendly language
4. **Restart backend server**
5. **Click retry** or submit new search
6. **Verify** search works after backend is back online

**Expected Result**: ✓ Network errors are handled gracefully with retry

### Test 11: CORS Verification

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Perform a search**
4. **Check the API request** to `/api/search`
5. **Verify response headers** include:
   - `Access-Control-Allow-Origin: http://localhost:5173`
   - No CORS errors in console

**Expected Result**: ✓ CORS is properly configured

### Test 12: API Endpoint Direct Access

Test backend endpoints directly:

#### Health Check
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","message":"Visual Product Matcher API is running"}`

#### Get Products
```bash
curl http://localhost:3000/api/products
```
Expected: JSON with 50 products

#### Search by URL
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}'
```
Expected: JSON with search results

**Expected Result**: ✓ All endpoints respond correctly

## Test Results Summary

After completing all tests, fill in the results:

- [ ] Test 1: Upload → Search → Display (File)
- [ ] Test 2: Upload → Search → Display (URL)
- [ ] Test 3: Filter Results
- [ ] Test 4: Error - Invalid File Type
- [ ] Test 5: Error - Invalid URL
- [ ] Test 6: Error - Oversized File
- [ ] Test 7: Loading States
- [ ] Test 8: Responsive Design (Mobile/Tablet/Desktop)
- [ ] Test 9: State Preservation During Resize
- [ ] Test 10: Network Error Handling
- [ ] Test 11: CORS Verification
- [ ] Test 12: API Direct Access

## Common Issues and Solutions

### Issue: CORS errors in browser console
**Solution**: Verify backend .env file has `FRONTEND_URL=http://localhost:5173`

### Issue: "Cannot connect to server" error
**Solution**: Ensure backend server is running on port 3000

### Issue: Frontend not loading
**Solution**: Ensure frontend server is running on port 5173

### Issue: Search takes too long
**Solution**: First search initializes the model and may take 10-15 seconds. Subsequent searches should be faster.

### Issue: No results returned
**Solution**: Verify embeddings.json exists in backend/src/data/ and contains embeddings for all products

## Performance Benchmarks

Expected performance metrics:

- **Initial page load**: < 5 seconds
- **Image upload**: < 2 seconds
- **First search** (model initialization): < 15 seconds
- **Subsequent searches**: < 10 seconds
- **Filter application**: < 500ms (instant)

## Requirements Validation

This integration testing validates the following requirements:

- **Requirement 1**: Image Upload (1.1-1.6)
- **Requirement 2**: Visual Search and Results Display (2.1-2.6)
- **Requirement 3**: Result Filtering (3.1-3.4)
- **Requirement 5**: Responsive Design (5.1-5.5)
- **Requirement 6**: Error Handling (6.1-6.5)
- **Requirement 7**: Loading States (7.1-7.4)

## Next Steps

After successful integration testing:

1. ✓ Frontend and backend are properly wired together
2. ✓ All core functionality works end-to-end
3. ✓ Error handling works across the stack
4. → Proceed to deployment preparation (Task 14)
5. → Deploy to production hosting (Task 15)
