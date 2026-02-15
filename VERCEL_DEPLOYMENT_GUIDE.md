# Vercel Deployment Guide

This guide will walk you through deploying both the backend and frontend of the Visual Product Matcher to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed globally: `npm install -g vercel`
3. Git repository initialized and pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

### Step 1: Deploy Backend to Vercel

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Login to Vercel (if not already logged in):**
   ```bash
   vercel login
   ```

3. **Deploy the backend:**
   ```bash
   vercel
   ```
   
   During the setup, answer the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `visual-product-matcher-backend` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

4. **Note the deployment URL** (e.g., `https://visual-product-matcher-backend.vercel.app`)

5. **Set environment variables on Vercel:**
   
   Go to your Vercel dashboard → Select your backend project → Settings → Environment Variables
   
   Add these variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (leave empty for now, we'll update after frontend deployment)
   - `PORT` = `3000` (optional, Vercel handles this automatically)

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Step 2: Deploy Frontend to Vercel

1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Deploy the frontend:**
   ```bash
   vercel
   ```
   
   During the setup, answer the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `visual-product-matcher-frontend` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

3. **Note the deployment URL** (e.g., `https://visual-product-matcher-frontend.vercel.app`)

4. **Set environment variables on Vercel:**
   
   Go to your Vercel dashboard → Select your frontend project → Settings → Environment Variables
   
   Add this variable:
   - `VITE_API_URL` = `https://your-backend-url.vercel.app` (use the backend URL from Step 1)

5. **Redeploy the frontend with the environment variable:**
   ```bash
   vercel --prod
   ```

### Step 3: Update Backend CORS Configuration

1. **Go back to the backend project on Vercel dashboard**

2. **Update the `FRONTEND_URL` environment variable:**
   - `FRONTEND_URL` = `https://your-frontend-url.vercel.app` (use the frontend URL from Step 2)

3. **Redeploy the backend:**
   ```bash
   cd ../backend
   vercel --prod
   ```

### Step 4: Verify Deployment

1. **Visit your frontend URL** in a browser
2. **Test the upload functionality** with an image
3. **Check that search results appear** correctly
4. **Test filtering** with the similarity threshold slider

## Alternative: Deploy via Vercel Dashboard (GUI Method)

### Backend Deployment:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the `backend` directory as the root directory
4. Framework Preset: **Other**
5. Build Command: `npm run build`
6. Output Directory: Leave empty
7. Install Command: `npm install`
8. Add environment variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (add after frontend deployment)
9. Click **Deploy**

### Frontend Deployment:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the `frontend` directory as the root directory
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Install Command: `npm install`
8. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.vercel.app`
9. Click **Deploy**

## Troubleshooting

### Backend Issues:

**Problem:** 500 Internal Server Error
- **Solution:** Check Vercel logs in the dashboard → Functions tab
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Verify environment variables are set correctly

**Problem:** CORS errors
- **Solution:** Ensure `FRONTEND_URL` environment variable is set correctly
- Check that the frontend URL matches exactly (including https://)

### Frontend Issues:

**Problem:** API calls failing
- **Solution:** Verify `VITE_API_URL` environment variable is set
- Check browser console for the actual API URL being called
- Ensure the backend is deployed and accessible

**Problem:** 404 on page refresh
- **Solution:** The `vercel.json` rewrites configuration should handle this
- Verify `frontend/vercel.json` exists with the correct rewrites

### General Issues:

**Problem:** Build fails
- **Solution:** Run `npm install` and `npm run build` locally first
- Check for any missing dependencies
- Review build logs in Vercel dashboard

**Problem:** Environment variables not working
- **Solution:** After adding/changing environment variables, redeploy:
  ```bash
  vercel --prod
  ```

## Monitoring and Logs

- **View logs:** Vercel Dashboard → Your Project → Deployments → Click on deployment → View Function Logs
- **Analytics:** Vercel Dashboard → Your Project → Analytics
- **Performance:** Vercel Dashboard → Your Project → Speed Insights

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `FRONTEND_URL` environment variable in backend if using custom domain
5. Redeploy both projects

## Automatic Deployments

Vercel automatically deploys when you push to your Git repository:
- **Production:** Pushes to `main` or `master` branch
- **Preview:** Pushes to other branches

## Cost

- Vercel offers a generous free tier
- Both projects should fit within the free tier limits
- Monitor usage in Vercel Dashboard → Account → Usage

## Next Steps

After successful deployment:
1. Test all functionality on the live site
2. Update README.md with live URLs
3. Set up custom domain (optional)
4. Configure automatic deployments from Git
5. Monitor performance and errors

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Project Issues: Check your repository's issues page
