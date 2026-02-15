# Production Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

### Code Quality
- [ ] All tests passing locally (`npm test` in both frontend and backend)
- [ ] No linting errors (`npm run lint` in both frontend and backend)
- [ ] Code reviewed and approved
- [ ] Git repository is clean (no uncommitted changes)
- [ ] All changes pushed to main/master branch

### Environment Configuration
- [ ] Backend `.env.production` created with production values
- [ ] Frontend `.env.production` created with production values
- [ ] Environment variables documented in README
- [ ] Sensitive data not committed to Git (check `.gitignore`)

### Data Preparation
- [ ] Product embeddings generated (`npm run generate-embeddings`)
- [ ] `embeddings.json` file exists in `backend/src/data/`
- [ ] All product images accessible and loading correctly
- [ ] Product data validated (50 products with complete metadata)

### Build Testing
- [ ] Frontend builds successfully (`npm run build` in frontend/)
- [ ] Backend starts without errors (`npm start` in backend/)
- [ ] Production build tested locally
- [ ] No console errors in production build

## Deployment Configuration

### Backend Deployment
- [ ] Hosting provider selected (Railway, Render, Vercel)
- [ ] Account created and verified
- [ ] Repository connected to hosting service
- [ ] Build command configured: `npm install && npm run generate-embeddings`
- [ ] Start command configured: `npm start`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL=<actual-frontend-url>`
  - [ ] `PORT` (if required by hosting service)
- [ ] Backend deployed successfully
- [ ] Backend URL noted and accessible

### Frontend Deployment
- [ ] Hosting provider selected (Vercel, Netlify)
- [ ] Account created and verified
- [ ] Repository connected to hosting service
- [ ] Build command configured: `npm run build`
- [ ] Publish directory configured: `dist`
- [ ] Environment variables set:
  - [ ] `VITE_API_URL=<actual-backend-url>`
- [ ] Frontend deployed successfully
- [ ] Frontend URL noted and accessible

### Cross-Configuration
- [ ] Backend `FRONTEND_URL` updated with actual frontend URL
- [ ] Frontend `VITE_API_URL` updated with actual backend URL
- [ ] Both services redeployed after URL updates
- [ ] CORS configured correctly (no CORS errors in browser console)

## Post-Deployment Testing

### Basic Functionality
- [ ] Application loads at production URL
- [ ] HTTPS enabled (padlock icon visible)
- [ ] No console errors on page load
- [ ] All assets loading correctly (images, CSS, JS)

### Image Upload
- [ ] File upload works (drag and drop)
- [ ] File upload works (click to select)
- [ ] Image preview displays correctly
- [ ] Supported formats work (JPEG, PNG, WebP, GIF)
- [ ] Invalid formats rejected with error message
- [ ] File size limit enforced (10MB)

### URL Input
- [ ] URL input field accepts valid image URLs
- [ ] Image loads from URL
- [ ] Invalid URLs show error message
- [ ] URL validation works correctly

### Search Functionality
- [ ] Search returns results within 10 seconds
- [ ] Results display correctly (image, name, category, score)
- [ ] Results ordered by similarity score (descending)
- [ ] Top 20 results returned
- [ ] Uploaded image displayed with results
- [ ] Loading indicator shows during search

### Filtering
- [ ] Similarity threshold slider works
- [ ] Results filter correctly based on threshold
- [ ] Filtered result count displays correctly
- [ ] Filter maintains result order
- [ ] Filter updates in real-time

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Invalid image errors display correctly
- [ ] Processing errors handled gracefully
- [ ] Error messages provide actionable guidance
- [ ] Retry functionality works

### Responsive Design
- [ ] Desktop layout displays correctly (1920x1080)
- [ ] Tablet layout displays correctly (768x1024)
- [ ] Mobile layout displays correctly (375x667)
- [ ] Touch controls work on mobile devices
- [ ] Images scale appropriately
- [ ] Text readable on all screen sizes
- [ ] No horizontal scrolling on mobile

### Cross-Browser Testing
- [ ] Chrome (desktop) - all features work
- [ ] Chrome (mobile) - all features work
- [ ] Firefox (desktop) - all features work
- [ ] Safari (desktop) - all features work
- [ ] Safari (iOS) - all features work
- [ ] Edge (desktop) - all features work

### Performance
- [ ] Initial page load < 5 seconds
- [ ] Search response time < 10 seconds
- [ ] Images load quickly
- [ ] No performance warnings in console
- [ ] Lighthouse score > 80 (run in Chrome DevTools)

### API Testing
- [ ] `GET /health` returns 200 OK
- [ ] `POST /api/search` works with file upload
- [ ] `POST /api/search` works with URL
- [ ] `GET /api/products` returns all products
- [ ] API error responses formatted correctly
- [ ] API logs errors appropriately

## Documentation

### README Updates
- [ ] Live application URL added to README
- [ ] Deployment instructions verified
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting section complete
- [ ] Screenshots or demo GIF added (optional)

### Repository
- [ ] Repository is public (if required)
- [ ] `.gitignore` configured correctly
- [ ] No sensitive data in repository
- [ ] All deployment configuration files committed
- [ ] README badges updated (if applicable)

## Monitoring and Maintenance

### Logging
- [ ] Backend logs accessible in hosting dashboard
- [ ] Error logs being captured
- [ ] Performance metrics logged
- [ ] Log level set appropriately (info for production)

### Monitoring
- [ ] Uptime monitoring configured (optional)
- [ ] Error tracking configured (optional)
- [ ] Performance monitoring enabled (optional)
- [ ] Hosting provider alerts configured

### Security
- [ ] HTTPS enforced (no HTTP access)
- [ ] CORS configured to allow only frontend domain
- [ ] File upload size limits enforced
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] Environment variables stored securely

### Backup and Recovery
- [ ] Product data backed up
- [ ] Embeddings backed up
- [ ] Deployment configuration documented
- [ ] Rollback plan documented

## Final Verification

### User Journey Testing
Complete a full user journey:
1. [ ] Visit production URL
2. [ ] Upload an image (file)
3. [ ] View search results
4. [ ] Apply similarity filter
5. [ ] Clear and try URL input
6. [ ] View results again
7. [ ] Test on mobile device
8. [ ] Test on different browser

### Stakeholder Review
- [ ] Demo application to stakeholders
- [ ] Collect feedback
- [ ] Address critical issues
- [ ] Document known limitations

### Launch Preparation
- [ ] Deployment announcement prepared
- [ ] Support documentation ready
- [ ] Known issues documented
- [ ] Monitoring in place
- [ ] Team notified of launch

## Post-Launch

### Immediate (First 24 Hours)
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify uptime
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately

### Short-Term (First Week)
- [ ] Analyze usage patterns
- [ ] Identify performance bottlenecks
- [ ] Collect user feedback
- [ ] Plan improvements
- [ ] Update documentation based on issues

### Long-Term (First Month)
- [ ] Review hosting costs
- [ ] Optimize performance
- [ ] Implement user-requested features
- [ ] Improve error handling
- [ ] Update dependencies

## Rollback Plan

If critical issues occur:

1. **Identify the issue**
   - Check error logs
   - Reproduce the issue
   - Assess severity

2. **Immediate mitigation**
   - Display maintenance message (if needed)
   - Revert to previous deployment
   - Notify users of downtime

3. **Fix and redeploy**
   - Fix the issue locally
   - Test thoroughly
   - Deploy fix
   - Verify fix in production

4. **Post-mortem**
   - Document what went wrong
   - Update checklist to prevent recurrence
   - Improve testing procedures

## Notes

- This checklist should be completed for every production deployment
- Check off items as you complete them
- Document any issues or deviations
- Update this checklist based on lessons learned
- Keep a copy of completed checklists for reference
