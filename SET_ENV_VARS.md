# ⚠️ IMPORTANT: Set Environment Variables

Your apps are deployed but need environment variables to work together!

## Your Deployment URLs:
- **Backend:** https://backend-jade-pi-67.vercel.app
- **Frontend:** https://frontend-seven-liart-65.vercel.app

## Set Environment Variables Now:

### Method 1: Vercel Dashboard (Recommended)

1. **Backend Environment Variables:**
   - Go to: https://vercel.com/neeraj-kumars-projects-c7e04e90/backend/settings/environment-variables
   - Add these variables:
     - `NODE_ENV` = `production`
     - `FRONTEND_URL` = `https://frontend-seven-liart-65.vercel.app`
   - Click "Save"
   - Go to Deployments tab → Click ⋯ on latest deployment → "Redeploy"

2. **Frontend Environment Variables:**
   - Go to: https://vercel.com/neeraj-kumars-projects-c7e04e90/frontend/settings/environment-variables
   - Add this variable:
     - `VITE_API_URL` = `https://backend-jade-pi-67.vercel.app`
   - Click "Save"
   - Go to Deployments tab → Click ⋯ on latest deployment → "Redeploy"

### Method 2: Vercel CLI (Alternative)

Run these commands:

```bash
# Set backend environment variables
cd backend
vercel env add NODE_ENV production
vercel env add FRONTEND_URL https://frontend-seven-liart-65.vercel.app

# Set frontend environment variables
cd ../frontend
vercel env add VITE_API_URL https://backend-jade-pi-67.vercel.app

# Redeploy both
cd ../backend
vercel --prod

cd ../frontend
vercel --prod
```

## After Setting Environment Variables:

Visit your frontend: https://frontend-seven-liart-65.vercel.app

Test the application:
1. Upload an image
2. See search results
3. Use the similarity filter

## Troubleshooting:

If you see CORS errors:
- Make sure `FRONTEND_URL` is set correctly in backend
- Redeploy the backend after setting environment variables

If API calls fail:
- Make sure `VITE_API_URL` is set correctly in frontend
- Redeploy the frontend after setting environment variables
