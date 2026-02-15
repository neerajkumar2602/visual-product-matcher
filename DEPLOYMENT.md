# Deployment Guide

This guide provides step-by-step instructions for deploying the Visual Product Matcher application to production.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Tested the application locally
- [ ] All tests passing (`npm test` in both frontend and backend)
- [ ] Environment variables configured for production
- [ ] Product embeddings generated (`npm run generate-embeddings` in backend)
- [ ] Git repository pushed to GitHub/GitLab
- [ ] Chosen hosting providers for frontend and backend

## Environment Configuration

### Backend Production Environment

Create a `.env.production` file in the `backend/` directory:

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
LOG_LEVEL=info
```

**Important**: Replace `your-frontend-domain.com` with your actual frontend domain.

### Frontend Production Environment

Create a `.env.production` file in the `frontend/` directory:

```env
VITE_API_URL=https://your-backend-domain.com
```

**Important**: Replace `your-backend-domain.com` with your actual backend domain.

## Deployment Options

### Option 1: Vercel (Recommended for Quick Deployment)

#### Deploy Frontend to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to frontend directory:
```bash
cd frontend
```

3. Deploy:
```bash
vercel --prod
```

4. Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No
   - Project name: visual-product-matcher-frontend
   - Directory: ./
   - Override settings: No

5. Note the deployment URL (e.g., `https://visual-product-matcher-frontend.vercel.app`)

6. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_URL` with your backend URL
   - Redeploy: `vercel --prod`

#### Deploy Backend to Vercel

1. Navigate to backend directory:
```bash
cd backend
```

2. Create `vercel.json` configuration:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

3. Deploy:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard:
   - `NODE_ENV=production`
   - `FRONTEND_URL=<your-frontend-url>`

5. Note the deployment URL

### Option 2: Railway (Recommended for Backend)

Railway provides excellent support for Node.js applications with persistent storage.

#### Deploy Backend to Railway

1. Create account at [railway.app](https://railway.app)

2. Create new project:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the repository

3. Configure build settings:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`

4. Set environment variables:
   - Go to Variables tab
   - Add:
     - `NODE_ENV=production`
     - `FRONTEND_URL=<your-frontend-url>`
     - `PORT` (Railway sets this automatically)

5. Deploy:
   - Railway automatically deploys on Git push
   - Note the deployment URL from the Settings tab

6. Generate embeddings (one-time setup):
   - Go to the project in Railway
   - Open the terminal
   - Run: `npm run generate-embeddings`

### Option 3: Netlify (Alternative for Frontend)

1. Create account at [netlify.com](https://netlify.com)

2. Connect Git repository:
   - Click "Add new site" → "Import an existing project"
   - Connect to Git provider
   - Select repository

3. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. Set environment variables:
   - Go to Site settings → Environment variables
   - Add `VITE_API_URL=<your-backend-url>`

5. Deploy:
   - Netlify automatically deploys on Git push

### Option 4: Render (Alternative for Backend)

1. Create account at [render.com](https://render.com)

2. Create new Web Service:
   - Click "New" → "Web Service"
   - Connect repository
   - Select repository

3. Configure service:
   - Name: visual-product-matcher-backend
   - Root directory: `backend`
   - Environment: Node
   - Build command: `npm install && npm run generate-embeddings`
   - Start command: `npm start`

4. Set environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=<your-frontend-url>`

5. Deploy:
   - Click "Create Web Service"

## Post-Deployment Steps

### 1. Update Environment Variables

After both frontend and backend are deployed:

1. Update backend `FRONTEND_URL` with the actual frontend URL
2. Update frontend `VITE_API_URL` with the actual backend URL
3. Redeploy both applications

### 2. Test the Deployment

Visit your frontend URL and test:

- [ ] Application loads successfully
- [ ] HTTPS is enabled (padlock icon in browser)
- [ ] Image upload works (file upload)
- [ ] Image URL input works
- [ ] Search returns results within 10 seconds
- [ ] Similarity filtering works
- [ ] Responsive design works on mobile
- [ ] Error messages display correctly

### 3. Test on Multiple Browsers

Test on:
- [ ] Chrome (desktop and mobile)
- [ ] Firefox
- [ ] Safari (desktop and mobile)
- [ ] Edge

### 4. Performance Testing

Check performance:
- [ ] Page load time < 5 seconds
- [ ] Search response time < 10 seconds
- [ ] Images load quickly
- [ ] No console errors

### 5. Update README

Update the README.md with:
- Live application URL
- Any deployment-specific notes
- Screenshots or demo GIF (optional)

## Troubleshooting

### CORS Errors

**Symptom**: Frontend can't connect to backend, CORS errors in console

**Solution**:
1. Verify `FRONTEND_URL` in backend environment variables matches your frontend domain exactly
2. Include both `https://domain.com` and `https://www.domain.com` if needed (comma-separated)
3. Redeploy backend after updating environment variables

### 404 Errors on Frontend Routes

**Symptom**: Refreshing the page shows 404 error

**Solution** (for Vercel/Netlify):
1. Create `frontend/public/_redirects` (Netlify) or `vercel.json` (Vercel)
2. Add redirect rule for SPA routing

For Netlify (`_redirects`):
```
/*    /index.html   200
```

For Vercel (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend Crashes on Startup

**Symptom**: Backend fails to start, "embeddings.json not found" error

**Solution**:
1. Run `npm run generate-embeddings` in the backend environment
2. For Railway: Use the terminal in the Railway dashboard
3. For Render: Add to build command: `npm install && npm run generate-embeddings`

### Images Not Loading

**Symptom**: Product images show broken image icons

**Solution**:
1. Verify product image URLs in `backend/src/data/products.json` are accessible
2. Check if image hosting service (Unsplash) is reachable
3. Ensure CORS is configured on image hosting service

### Slow Performance

**Symptom**: Search takes longer than 10 seconds

**Solution**:
1. Verify embeddings are pre-computed (check `embeddings.json` exists)
2. Check hosting service resources (upgrade if needed)
3. Monitor backend logs for performance bottlenecks
4. Consider using a CDN for product images

## Monitoring and Maintenance

### Logging

Backend logs are available in:
- **Railway**: Project → Deployments → View logs
- **Render**: Dashboard → Logs tab
- **Vercel**: Project → Deployments → Function logs

### Error Tracking

Monitor errors in:
- Backend logs (Winston logger outputs to console)
- Browser console (for frontend errors)
- Hosting provider dashboards

### Updates and Redeployment

To deploy updates:

1. Push changes to Git repository
2. Hosting services auto-deploy on push (if configured)
3. Or manually redeploy using CLI:
   - Vercel: `vercel --prod`
   - Railway/Render/Netlify: Automatic on Git push

## Security Considerations

- [ ] HTTPS enabled (automatic with Vercel/Netlify/Railway/Render)
- [ ] Environment variables stored securely (not in Git)
- [ ] CORS configured to allow only your frontend domain
- [ ] File upload size limits enforced (10MB)
- [ ] Input validation on all API endpoints
- [ ] Error messages don't expose sensitive information

## Cost Considerations

All recommended hosting services offer free tiers:

- **Vercel**: Free for personal projects, 100GB bandwidth/month
- **Netlify**: Free for personal projects, 100GB bandwidth/month
- **Railway**: $5 credit/month (enough for small projects)
- **Render**: Free tier with 750 hours/month

Monitor usage to stay within free tier limits.

## Support

For deployment issues:
- Check hosting provider documentation
- Review application logs
- Test locally first to isolate deployment-specific issues
- Verify environment variables are set correctly
