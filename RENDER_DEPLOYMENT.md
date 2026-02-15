# Deploy to Render.com (Recommended for Backend)

## Why Render Instead of Vercel?

Vercel's serverless functions don't support:
- TensorFlow.js with canvas
- Native Node.js modules
- Long-running processes

Render.com provides full Node.js environment support.

## Quick Deployment Steps

### 1. Deploy Backend to Render

1. Go to https://render.com/
2. Sign up / Log in with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository: `neerajkumar2602/visual-product-matcher`
5. Configure:
   - **Name:** `visual-product-matcher-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://frontend-seven-liart-65.vercel.app`
7. Click "Create Web Service"
8. **Copy the backend URL** (e.g., `https://visual-product-matcher-backend.onrender.com`)

### 2. Update Frontend Environment Variable

1. Go to Vercel Dashboard: https://vercel.com/neeraj-kumars-projects-c7e04e90/frontend/settings/environment-variables
2. Update `VITE_API_URL` to your new Render backend URL
3. Redeploy frontend

### 3. Update Backend CORS

1. Go to Render Dashboard → Your backend service → Environment
2. Confirm `FRONTEND_URL` is set to `https://frontend-seven-liart-65.vercel.app`
3. Save (it will auto-redeploy)

## Alternative: Use Railway

Railway also supports native dependencies:

1. Go to https://railway.app/
2. Sign in with GitHub
3. New Project → Deploy from GitHub repo
4. Select `backend` folder
5. Add environment variables
6. Deploy

## Test Your App

After backend is deployed to Render:
- Frontend: https://frontend-seven-liart-65.vercel.app
- Backend: https://your-backend.onrender.com

Upload an image and test the search functionality!

## Note on Render Free Tier

- Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Upgrade to paid tier ($7/month) for always-on service
