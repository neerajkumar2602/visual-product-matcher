# Deploy to Vercel - Quick Commands

## Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

## Login to Vercel
```bash
vercel login
```

## Deploy Backend
```bash
cd backend
vercel --prod
```
**Save the backend URL!**

## Deploy Frontend
```bash
cd ../frontend
vercel --prod
```
**Save the frontend URL!**

## Set Environment Variables

After deployment, go to https://vercel.com/dashboard

### Backend Project Settings:
- Environment Variables → Add:
  - `NODE_ENV` = `production`
  - `FRONTEND_URL` = `<your-frontend-url>`
- Redeploy

### Frontend Project Settings:
- Environment Variables → Add:
  - `VITE_API_URL` = `<your-backend-url>`
- Redeploy

## Test Your Live Site!
Visit your frontend URL and test the image search functionality.
