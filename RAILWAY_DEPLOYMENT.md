# Deploy Both Frontend and Backend on Railway

This guide shows how to deploy both the frontend and backend on Railway using a single GitHub repository.

## Prerequisites

- GitHub account with your code pushed to a repository
- Railway account (sign up at [railway.app](https://railway.app))
- $5/month Railway credit (they give you $5 free credit to start)

## Overview

You'll create **two separate Railway services**:
1. **Backend Service** - Node.js API server
2. **Frontend Service** - Static site built with Vite

## Step 1: Deploy Backend

### 1.1 Create Backend Service

1. Go to [railway.app](https://railway.app) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository
6. Railway will detect it's a Node.js project

### 1.2 Configure Backend Service

1. Click on the service that was created
2. Go to **Settings** tab
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install && npm run generate-embeddings`
5. Set **Start Command**: `npm start`

### 1.3 Set Backend Environment Variables

1. Go to **Variables** tab
2. Add these variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (leave empty for now, we'll update this after frontend is deployed)
   - `PORT` = (Railway sets this automatically, don't add it)

### 1.4 Deploy Backend

1. Click **"Deploy"** or push to GitHub (auto-deploys)
2. Wait for deployment to complete (2-3 minutes for first deploy due to embeddings generation)
3. Go to **Settings** → **Networking** → **Generate Domain**
4. Copy your backend URL (e.g., `https://your-backend.up.railway.app`)

## Step 2: Deploy Frontend

### 2.1 Create Frontend Service

1. In the same Railway project, click **"New Service"**
2. Select **"GitHub Repo"**
3. Select the **same repository**
4. Railway will create a second service

### 2.2 Configure Frontend Service

1. Click on the new service
2. Go to **Settings** tab
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npx serve -s dist -l $PORT`

### 2.3 Install Serve Package

Railway needs a static file server for the frontend. Add `serve` to frontend dependencies:

1. In your local project, run:
```bash
cd frontend
npm install --save serve
```

2. Update `frontend/package.json` to add a start script:
```json
"scripts": {
  "start": "serve -s dist -l $PORT",
  "dev": "vite",
  "build": "vite build",
  ...
}
```

3. Commit and push:
```bash
git add .
git commit -m "Add serve for Railway deployment"
git push
```

### 2.4 Set Frontend Environment Variables

1. Go to **Variables** tab
2. Add this variable:
   - `VITE_API_URL` = `https://your-backend.up.railway.app` (use the backend URL from Step 1.4)

### 2.5 Deploy Frontend

1. Railway will auto-deploy after you push
2. Wait for deployment to complete (1-2 minutes)
3. Go to **Settings** → **Networking** → **Generate Domain**
4. Copy your frontend URL (e.g., `https://your-frontend.up.railway.app`)

## Step 3: Update Backend CORS

Now that you have the frontend URL, update the backend:

1. Go to your **Backend Service** in Railway
2. Go to **Variables** tab
3. Update `FRONTEND_URL` = `https://your-frontend.up.railway.app` (use your actual frontend URL)
4. Railway will automatically redeploy the backend

## Step 4: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.up.railway.app`
2. Test uploading an image
3. Verify search results appear
4. Check browser console for any errors

## Project Structure in Railway

Your Railway project will look like this:

```
My Project
├── Backend Service
│   ├── Root Directory: backend
│   ├── URL: https://your-backend.up.railway.app
│   └── Variables: NODE_ENV, FRONTEND_URL
└── Frontend Service
    ├── Root Directory: frontend
    ├── URL: https://your-frontend.up.railway.app
    └── Variables: VITE_API_URL
```

## Cost Considerations

Railway pricing:
- **Free**: $5 credit per month (enough for small projects)
- **Pro**: $20/month for more resources
- Both services will share the $5 credit
- Monitor usage in Railway dashboard

Typical usage for this project:
- Backend: ~$3-4/month (runs continuously)
- Frontend: ~$1/month (static files, minimal resources)
- Total: ~$4-5/month (fits in free tier!)

## Troubleshooting

### Frontend shows "Cannot connect to backend"

**Solution**: 
1. Check `VITE_API_URL` in frontend variables matches backend URL exactly
2. Check `FRONTEND_URL` in backend variables matches frontend URL exactly
3. Redeploy both services

### Backend fails to start

**Solution**:
1. Check logs in Railway dashboard
2. Verify `npm run generate-embeddings` completed successfully
3. Check that `backend/src/data/embeddings.json` exists
4. If embeddings failed, manually run in Railway terminal:
   - Click on Backend Service → **Terminal** tab
   - Run: `npm run generate-embeddings`

### "Module not found" errors

**Solution**:
1. Verify Root Directory is set correctly (`backend` or `frontend`)
2. Check that `package.json` exists in the root directory
3. Redeploy the service

### Frontend shows 404 on refresh

**Solution**:
1. Verify `serve` is installed in frontend
2. Check Start Command is: `npx serve -s dist -l $PORT`
3. The `-s` flag enables SPA routing

### Images not loading

**Solution**:
1. Check product image URLs in `backend/src/data/products.json`
2. Verify images are accessible from Railway servers
3. Check browser console for CORS errors

## Updating Your Deployment

To deploy updates:

1. Make changes locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Your update message"
git push
```
3. Railway automatically detects the push and redeploys both services

## Viewing Logs

To debug issues:

1. Go to Railway dashboard
2. Click on the service (Backend or Frontend)
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. View logs in real-time

## Custom Domain (Optional)

To use your own domain:

1. Go to service **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com` for backend)
4. Update DNS records as instructed by Railway
5. Update environment variables with new URLs
6. Redeploy both services

## Summary

✅ Two Railway services in one project
✅ Backend: Node.js API with TensorFlow.js
✅ Frontend: Static React site served with `serve`
✅ Automatic deployments on Git push
✅ HTTPS enabled by default
✅ Fits in Railway's free $5/month credit

Your app is now live! 🚀
