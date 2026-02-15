# Deployment Instructions for Visual Product Matcher

## Overview

This document provides step-by-step instructions to deploy the Visual Product Matcher application to production hosting services.

**Recommended Setup:**
- **Backend**: Railway (free $5/month credit)
- **Frontend**: Netlify (free tier with 100GB bandwidth)

**Estimated Time**: 20-30 minutes
**Cost**: Free (within free tier limits)

---

## Pre-Deployment Checklist

Before starting deployment, verify:

- [x] Git repository exists and is pushed to GitHub
- [x] All configuration files are in place:
  - [x] `backend/vercel.json` - Vercel backend config
  - [x] `backend/railway.json` - Railway backend config
  - [x] `frontend/netlify.toml` - Netlify frontend config
  - [x] `frontend/public/_redirects` - SPA routing config
- [x] Product embeddings generated (`backend/src/data/embeddings.json` exists)
- [x] Environment example files exist (`.env.example` files)
- [x] `serve` package installed in frontend for static serving

**Status**: ✓ All prerequisites met - ready for deployment!

---

## Deployment Option 1: Railway + Netlify (Recommended)

### Part A: Deploy Backend to Railway

#### Step 1: Create Railway Account
1. Visit [railway.app](https://railway.app)
2. Click "Login" and sign in with your GitHub account
3. Authorize Railway to access your GitHub repositories

#### Step 2: Create New Project
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Choose your `visual-product-matcher` repository
4. Railway will automatically detect it's a Node.js project

#### Step 3: Configure Backend Service
1. Click on the service that Railway created
2. Navigate to **Settings** tab
3. Configure the following:
   - **Root Directory**: `backend`
   - **Build Command**: (leave default - Railway auto-detects from package.json)
   - **Start Command**: `npm start`
   - **Watch Paths**: (leave default)

#### Step 4: Set Environment Variables
1. Navigate to **Variables** tab
2. Click "New Variable" and add the following:

```
NODE_ENV=production
FRONTEND_URL=https://temporary-placeholder.com
```

**Note**: We'll update `FRONTEND_URL` after deploying the frontend.

#### Step 5: Generate Public Domain
1. Go to **Settings** → **Networking** section
2. Click **"Generate Domain"** button
3. Railway will create a public URL like: `https://visual-product-matcher-production-xxxx.up.railway.app`
4. **IMPORTANT**: Copy and save this URL - you'll need it for the frontend configuration

#### Step 6: Wait for Deployment
1. Railway will automatically start building and deploying
2. Monitor the **Deployments** tab to see progress
3. First deployment takes 2-4 minutes
4. Look for "Success" status

#### Step 7: Verify Backend is Running
1. Once deployed, click on the deployment
2. Check the logs for "Server running on" message
3. Test the health endpoint: `https://your-backend-url.up.railway.app/health`
4. You should see: `{"status":"ok","timestamp":"..."}`

**Note**: The embeddings file should already be in your repository from local development, so Railway will use it automatically.

---

### Part B: Deploy Frontend to Netlify

#### Step 1: Create Netlify Account
1. Visit [netlify.com](https://netlify.com)
2. Click "Sign up" and sign in with your GitHub account
3. Authorize Netlify to access your GitHub repositories

#### Step 2: Create New Site
1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Select your `visual-product-matcher` repository
4. Authorize Netlify if prompted

#### Step 3: Configure Build Settings
Netlify should auto-detect settings from `netlify.toml`, but verify:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: 18 (set in netlify.toml)

#### Step 4: Set Environment Variables
**BEFORE clicking "Deploy site":**

1. Click "Show advanced" button
2. Click "New variable" and add:

```
Key: VITE_API_URL
Value: <your-railway-backend-url-from-part-a-step-5>
```

**Example**: `https://visual-product-matcher-production-xxxx.up.railway.app`

**IMPORTANT**: Use the exact Railway URL without trailing slash.

#### Step 5: Deploy
1. Click "Deploy site" button
2. Netlify will start building and deploying
3. Monitor the deploy log for any errors
4. First deployment takes 1-3 minutes

#### Step 6: Get Frontend URL
1. Once deployed, Netlify shows your site URL
2. It will be something like: `https://amazing-name-123456.netlify.app`
3. **IMPORTANT**: Copy and save this URL - you need to update the backend

#### Step 7: Test Frontend (Initial)
1. Click on the site URL to visit your frontend
2. The page should load, but API calls will fail (CORS error)
3. This is expected - we need to update the backend CORS configuration

---

### Part C: Update Backend CORS Configuration

Now that you have the frontend URL, update the backend to allow requests from it:

#### Step 1: Update Railway Environment Variables
1. Go back to Railway dashboard
2. Click on your backend service
3. Navigate to **Variables** tab
4. Find the `FRONTEND_URL` variable
5. Update its value to your actual Netlify URL:

```
FRONTEND_URL=https://your-actual-frontend.netlify.app
```

**IMPORTANT**: Use the exact Netlify URL without trailing slash.

#### Step 2: Trigger Redeploy
1. Railway will automatically detect the variable change
2. It will redeploy the backend (takes 1-2 minutes)
3. Monitor the **Deployments** tab
4. Wait for "Success" status

---

### Part D: Final Testing

#### Step 1: Test Complete Application
1. Visit your Netlify frontend URL
2. Open browser DevTools (F12) → Console tab
3. Check for errors (there should be none now)

#### Step 2: Test Core Functionality
- [ ] Application loads without errors
- [ ] HTTPS is enabled (padlock icon in address bar)
- [ ] Upload an image using file upload
- [ ] Verify search results appear within 10 seconds
- [ ] Check that results show product images, names, categories, and scores
- [ ] Test similarity threshold filter
- [ ] Try URL input with an image URL (e.g., from Unsplash)
- [ ] Verify error handling (try invalid file type)

#### Step 3: Test Responsive Design
- [ ] Resize browser window to mobile size (375px width)
- [ ] Test on actual mobile device if available
- [ ] Verify layout adapts correctly
- [ ] Check that touch controls work

#### Step 4: Test Cross-Browser
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop, if on Mac)
- [ ] Edge (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile, if on iOS)

---

## Deployment Option 2: Both on Railway

If you prefer to deploy both frontend and backend to Railway:

### Deploy Frontend Service
1. In the same Railway project, click "New Service"
2. Select "GitHub Repo" → Choose the same repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (uses serve from package.json)
4. Add environment variable:
   - `VITE_API_URL=<your-backend-railway-url>`
   - `PORT=<leave-empty-railway-sets-this>`
5. Generate domain for frontend service
6. Update backend `FRONTEND_URL` with new frontend Railway URL

**Note**: The `serve` package is already installed in frontend/package.json.

---

## Deployment Option 3: Vercel (Both Services)

### Deploy Backend to Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to backend: `cd backend`
3. Run: `vercel --prod`
4. Follow prompts, note the deployment URL
5. In Vercel dashboard, set environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=<your-frontend-url>`

### Deploy Frontend to Vercel
1. Navigate to frontend: `cd frontend`
2. Run: `vercel --prod`
3. Follow prompts, note the deployment URL
4. In Vercel dashboard, set environment variable:
   - `VITE_API_URL=<your-backend-url>`
5. Redeploy: `vercel --prod`

### Update Backend
1. Update backend `FRONTEND_URL` in Vercel dashboard
2. Redeploy backend: `cd backend && vercel --prod`

---

## Common Issues and Solutions

### Issue: CORS Error in Browser Console

**Symptom**: Console shows "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solution**:
1. Verify `FRONTEND_URL` in Railway backend matches your Netlify URL exactly
2. Check for trailing slashes (should not have one)
3. Ensure Railway redeployed after updating the variable
4. Check Railway logs for CORS configuration messages

### Issue: "Cannot connect to backend"

**Symptom**: Frontend shows error message about connection failure

**Solution**:
1. Verify `VITE_API_URL` in Netlify matches your Railway backend URL exactly
2. Check that Railway backend is running (green status in dashboard)
3. Test backend health endpoint directly: `https://your-backend-url/health`
4. Check Netlify deploy logs for build errors

### Issue: Images Not Loading

**Symptom**: Product images show broken image icons

**Solution**:
1. Open browser console and check for specific image errors
2. Verify product image URLs in `backend/src/data/products.json` are accessible
3. Test image URLs directly in browser
4. Check if Unsplash or image hosting service is reachable

### Issue: Build Fails on Railway

**Symptom**: Railway deployment fails during build

**Solution**:
1. Check Railway logs for specific error message
2. Verify `package.json` has all required dependencies
3. Ensure Node.js version is 18+ (Railway uses latest by default)
4. Check that `backend` directory structure is correct

### Issue: Build Fails on Netlify

**Symptom**: Netlify deployment fails during build

**Solution**:
1. Check Netlify deploy logs for specific error
2. Verify build command and publish directory are correct
3. Ensure `VITE_API_URL` environment variable is set
4. Check that `frontend` directory structure is correct

### Issue: 404 on Page Refresh

**Symptom**: Refreshing the page shows 404 error

**Solution**:
1. Verify `netlify.toml` exists with redirect rules (it does)
2. Check that `_redirects` file is in `frontend/public/` (it is)
3. Ensure Netlify is using the correct publish directory (`frontend/dist`)

### Issue: Slow Search Performance

**Symptom**: Search takes longer than 10 seconds

**Solution**:
1. Verify `embeddings.json` exists in backend deployment
2. Check Railway logs for performance warnings
3. Consider upgrading Railway plan if on free tier limits
4. Monitor Railway resource usage in dashboard

---

## Post-Deployment Monitoring

### Railway Monitoring
1. Go to Railway dashboard → Your project
2. Click on backend service
3. Monitor:
   - **Deployments**: Check deployment history and status
   - **Metrics**: View CPU, memory, and network usage
   - **Logs**: Real-time application logs
   - **Usage**: Track monthly credit usage

### Netlify Monitoring
1. Go to Netlify dashboard → Your site
2. Monitor:
   - **Deploys**: Check deployment history
   - **Functions**: (not used in this project)
   - **Analytics**: View site traffic (requires upgrade)
   - **Logs**: Deployment and function logs

### Application Logs
- Backend logs are available in Railway dashboard
- Frontend errors appear in browser console
- Winston logger outputs to Railway logs

---

## Updating Your Deployment

### Automatic Deployments
Both Railway and Netlify support automatic deployments:

1. Make changes to your code locally
2. Commit changes: `git add . && git commit -m "Your message"`
3. Push to GitHub: `git push`
4. Railway and Netlify automatically detect the push
5. Both services rebuild and redeploy automatically
6. Monitor deployment progress in dashboards

### Manual Redeployment
If needed, you can manually trigger redeployment:

**Railway**:
1. Go to Deployments tab
2. Click "Deploy" button
3. Select branch to deploy

**Netlify**:
1. Go to Deploys tab
2. Click "Trigger deploy" → "Deploy site"

---

## Cost Monitoring

### Railway Costs
- **Free tier**: $5 credit per month
- **Typical usage for this project**: $3-5/month
- **Monitor**: Railway dashboard → Usage tab
- **Upgrade**: If you exceed free tier, Railway will prompt you

### Netlify Costs
- **Free tier**: 100GB bandwidth/month, unlimited sites
- **Typical usage for this project**: < 5GB/month
- **Monitor**: Netlify dashboard → Usage tab
- **Upgrade**: Rarely needed for small projects

**Total estimated cost**: $0/month (within free tiers)

---

## Security Checklist

- [x] HTTPS enabled (automatic with Railway and Netlify)
- [x] Environment variables stored securely (not in Git)
- [x] CORS configured to allow only frontend domain
- [x] File upload size limits enforced (10MB in code)
- [x] Input validation on all API endpoints
- [x] Error messages don't expose sensitive information
- [x] `.gitignore` configured to exclude sensitive files

---

## Next Steps After Deployment

1. **Update README**: Add live URLs to README.md (Task 15.3)
2. **Test thoroughly**: Complete all items in testing checklist
3. **Share with users**: Provide the Netlify URL to users
4. **Monitor performance**: Check Railway and Netlify dashboards regularly
5. **Set up custom domain** (optional): Configure custom domain in hosting dashboards
6. **Enable monitoring** (optional): Set up uptime monitoring with services like UptimeRobot

---

## Support Resources

- **Railway Documentation**: https://docs.railway.app
- **Netlify Documentation**: https://docs.netlify.com
- **Project Documentation**: See `DEPLOYMENT.md` and `RAILWAY_DEPLOYMENT.md`
- **Troubleshooting**: See `PRODUCTION_CHECKLIST.md`

---

**Deployment Status**: Ready to deploy
**Configuration Status**: All files in place
**Prerequisites Status**: All requirements met

You can now proceed with deployment following the steps above!
