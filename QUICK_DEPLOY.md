# Quick Deployment Guide

This guide will help you deploy

## Prerequisites

- [ ] Git repository pushed to GitHub
- [ ] All tests passing locally
- [ ] Product embeddings generated (`npm run generate-embeddings` in backend)

## Step 1: Deploy Backend to Railway (5 minutes)

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your repositories

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `visual-product
4. Railway will detect it's a Node.js project

### 1.3 Configure Backend Service
1. Click on the service that was created
2. Go to **Settings** tab:
   - **Root Directory**: `backend`
   - **Build Command**: Leave default (Railway auto-detects)
   - **Start Command**: `npm start`

3. Go to **Variables** tab and add:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://temporary-placeholder.com
   ```
   (We'll update FRONTEND_URL after deploying the frontend)

### 1.4 Generate Domain
1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy your backend URL (e.g., `https://visual-product-matcher-production.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend

### 1.5 Gen
1. Wait for the initial deployment to complete (2-3 minutes)
2. In Railway dashboard, click on your service
3. Go to the **Deployments** tab
4. Click on the latest deployment
5. Open the **Terminal** (if available) or use the Railway CLI
6. Run: `npm run generate-embeddings`
7. Wait for completion (2-3 minutes)

**Alternative**: The embeddings should already be in your Git repository if you generated them locally. Railway will use those.

## Step 2: Deploy Frontend to Netlify (5 minutes)

### 2.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up" and sign in with GitHub
3. Authorize Netlify to access your repositories

### 2.2 Create New Site
404 on page refresh:**
- Verify `netlify.toml` exists with redirect rules
- Check that `_redirects` file is in `frontend/public/`

## Support

If you encounter issues:
1. Check the detailed guides: `DEPLOYMENT.md` and `RAILWAY_DEPLOYMENT.md`
2. Review hosting provider documentation
3. Check application logs in hosting dashboards
4. Verify all environment variables are set correctly

---

**Estimated Total Time**: 15-20 minutes
**Difficulty**: Easy
**Cost**: Free (within free tier limits)
ng

### Railway Issues

**Build fails:**
- Check logs in Railway dashboard → Deployments → View logs
- Verify `package.json` has all required dependencies
- Check that Node.js version is compatible (18+)

**Service crashes:**
- Check logs for error messages
- Verify environment variables are set correctly
- Ensure embeddings.json exists

### Netlify Issues

**Build fails:**
- Check deploy logs in Netlify dashboard
- Verify build command and publish directory are correct
- Check that `VITE_API_URL` is set

**ment"
git push
```

## Cost Estimate

Both services offer generous free tiers:

- **Railway**: $5 credit/month (enough for this project)
- **Netlify**: 100GB bandwidth/month, unlimited sites

Your project should fit comfortably within free tiers!

## Next Steps

After successful deployment:

1. Test on multiple browsers (Chrome, Firefox, Safari, Edge)
2. Test on mobile devices
3. Share the URL with users
4. Monitor Railway and Netlify dashboards for errors
5. Set up custom domain (optional)

## Troubleshooti Service"
2. Select "GitHub Repo" → Choose same repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
4. Add environment variable:
   - `VITE_API_URL=<your-backend-railway-url>`
5. Generate domain for frontend service

**Note**: You'll need to install `serve` in frontend:
```bash
cd frontend
npm install --save serve
git add package.json package-lock.json
git commit -m "Add serve for Railway deployjson` are accessible

## Step 5: Update README (2 minutes)

Update your README.md with the live URLs:

```markdown
## Live Demo

🚀 **Frontend**: https://your-frontend.netlify.app
🔧 **Backend API**: https://your-backend.up.railway.app
```

Commit and push:
```bash
git add README.md
git commit -m "Add live deployment URLs"
git push
```

## Alternative: Deploy Both to Railway

If you prefer to deploy both frontend and backend to Railway:

### Deploy Frontend to Railway
1. In the same Railway project, click "Newest on mobile device (responsive design)

### Common Issues:

**CORS Error in Console:**
- Check that `FRONTEND_URL` in Railway matches your Netlify URL exactly
- Make sure Railway redeployed after you updated the variable

**"Cannot connect to backend":**
- Check that `VITE_API_URL` in Netlify matches your Railway URL exactly
- Verify Railway backend is running (check Deployments tab)

**Images not loading:**
- Check browser console for specific errors
- Verify product image URLs in `backend/src/data/products.ps://your-actual-frontend.netlify.app
   ```
5. Railway will automatically redeploy (takes 1-2 minutes)

## Step 4: Test Your Deployment (5 minutes)

1. Visit your Netlify frontend URL
2. Open browser DevTools (F12) → Console tab
3. Check for any errors

### Test Checklist:
- [ ] Application loads without errors
- [ ] HTTPS is enabled (padlock icon in address bar)
- [ ] Upload an image (file upload)
- [ ] Verify search results appear
- [ ] Test similarity filter
- [ ] Try URL input with an image URL
- [ ] T

3. Click "Deploy site"

### 2.5 Get Frontend URL
1. Wait for deployment to complete (1-2 minutes)
2. Netlify will show your site URL (e.g., `https://amazing-name-123456.netlify.app`)
3. **Save this URL** - you need to update the backend

## Step 3: Update Backend CORS (2 minutes)

Now that you have the frontend URL, update the backend:

1. Go back to Railway dashboard
2. Click on your backend service
3. Go to **Variables** tab
4. Update `FRONTEND_URL` to your actual Netlify URL:
   ```
   FRONTEND_URL=httHub"
3. Select your `visual-product-matcher` repository
4. Authorize Netlify if prompted

### 2.3 Configure Build Settings
Netlify should auto-detect the settings, but verify:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### 2.4 Set Environment Variables
1. Before deploying, click "Show advanced"
2. Click "New variable" and add:
   ```
   Key: VITE_API_URL
   Value: <your-railway-backend-url>
   ```
   Use the Railway backend URL from Step 1.41. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with Git