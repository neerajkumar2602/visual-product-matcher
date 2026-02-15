# Quick Vercel Deployment Commands

## One-Time Setup

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

## Deploy Backend

```bash
# Navigate to backend
cd backend

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Note the URL: https://your-backend-url.vercel.app
```

## Deploy Frontend

```bash
# Navigate to frontend
cd ../frontend

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Note the URL: https://your-frontend-url.vercel.app
```

## Set Environment Variables

### Backend Environment Variables (via Vercel Dashboard):
1. Go to: https://vercel.com/dashboard
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-frontend-url.vercel.app`

### Frontend Environment Variables (via Vercel Dashboard):
1. Go to: https://vercel.com/dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add:
   - `VITE_API_URL` = `https://your-backend-url.vercel.app`

## Redeploy After Setting Environment Variables

```bash
# Redeploy backend
cd backend
vercel --prod

# Redeploy frontend
cd ../frontend
vercel --prod
```

## Verify Deployment

Visit your frontend URL and test:
- ✅ Upload an image
- ✅ View search results
- ✅ Use the similarity filter
- ✅ Test on mobile device

## Your Deployment URLs

After deployment, update these:
- **Backend:** https://_____________________.vercel.app
- **Frontend:** https://_____________________.vercel.app

---

**Need help?** See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions.
