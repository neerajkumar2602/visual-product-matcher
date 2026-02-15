# Visual Product Matcher

A web application that enables users to find visually similar products by uploading images or providing image URLs. The system uses image similarity algorithms to match uploaded images against a product database and returns ranked results based on visual similarity.

## 🚀 Live Demo

**Deployment Status**: 🟢 Ready for deployment

**Live URLs** (update after deployment):
- 🌐 **Frontend**: `https://your-frontend-url.netlify.app`
- 🔧 **Backend API**: `https://your-backend-url.railway.app`

> **To deploy**: Follow the comprehensive guide in [`DEPLOYMENT_INSTRUCTIONS.md`](./DEPLOYMENT_INSTRUCTIONS.md)

**Quick Links**:
- 📖 [Deployment Instructions](./DEPLOYMENT_INSTRUCTIONS.md) - Step-by-step deployment guide
- ✅ [Post-Deployment Validation](./POST_DEPLOYMENT_VALIDATION.md) - Testing checklist
- 🚂 [Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md) - Deploy both services to Railway
- 📋 [Production Checklist](./PRODUCTION_CHECKLIST.md) - Pre-deployment checklist

## Deployment Status

✅ **Application is ready for deployment!**

All configuration files are in place:
- ✅ Backend configuration (`backend/vercel.json`, `backend/railway.json`)
- ✅ Frontend configuration (`frontend/netlify.toml`)
- ✅ Environment variable templates (`.env.example` files)
- ✅ Product embeddings generated
- ✅ All tests passing (77/77 backend tests, all frontend tests)
- ✅ Build process verified

**To deploy**: Follow the step-by-step guide in `DEPLOYMENT_INSTRUCTIONS.md`

**Recommended hosting**:
- **Backend**: Railway (free $5/month credit) - [railway.app](https://railway.app)
- **Frontend**: Netlify (free tier) - [netlify.com](https://netlify.com)

**Estimated deployment time**: 20-30 minutes

## Technology Stack

### Frontend
- **React 18** - UI library for building interactive user interfaces
- **Vite** - Fast build tool and development server with hot module replacement
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Axios** - Promise-based HTTP client for API communication
- **Vitest** - Fast unit testing framework powered by Vite
- **fast-check** - Property-based testing library for comprehensive test coverage
- **@testing-library/react** - Testing utilities for React components

### Backend
- **Node.js 18+** - JavaScript runtime environment
- **Express 4** - Minimal and flexible web application framework
- **TensorFlow.js** - Machine learning library for image feature extraction
- **MobileNet** - Pre-trained image classification model for embeddings
- **Multer** - Middleware for handling multipart/form-data file uploads
- **Sharp** - High-performance image processing library
- **Canvas** - Node.js canvas implementation for image manipulation
- **Winston** - Logging library for error tracking and debugging
- **Jest** - JavaScript testing framework
- **fast-check** - Property-based testing library
- **Supertest** - HTTP assertion library for API testing

## Architecture

The application follows a client-server architecture with clear separation of concerns:

### High-Level Architecture
```
User Browser → Frontend (React) → Backend API (Express) → Image Processor (TensorFlow.js)
                                                        → Product Database (JSON)
```

### Component Overview
- **Frontend**: Handles user interactions, image upload, results display, and filtering
- **Backend API**: Processes images, computes similarity scores, and serves product data
- **Image Processor**: Extracts feature embeddings using MobileNet and calculates cosine similarity
- **Product Database**: JSON-based storage with 50 products and pre-computed embeddings

### Key Design Decisions
1. **Pre-computed Embeddings**: Product image embeddings are generated once during setup and stored in JSON, enabling fast search times (< 10 seconds)
2. **Cosine Similarity**: Used for comparing image embeddings, providing reliable similarity scores between 0-100%
3. **Client-Side Filtering**: Similarity threshold filtering happens in the browser for instant feedback
4. **Responsive Design**: Mobile-first approach using Tailwind CSS breakpoints

## Project Structure

```
visual-product-matcher/
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── UploadInterface.jsx      # Image upload and URL input
│   │   │   ├── SearchResults.jsx        # Product grid display
│   │   │   └── FilterControl.jsx        # Similarity threshold filter
│   │   ├── services/             # API service layer
│   │   │   └── api.js                   # Axios-based API client
│   │   ├── test/                 # Test setup and utilities
│   │   │   └── setup.js                 # Vitest configuration
│   │   ├── App.jsx               # Main application component
│   │   ├── main.jsx              # Application entry point
│   │   └── index.css             # Global styles with Tailwind
│   ├── index.html                # HTML template
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── .env.example              # Environment variable template
├── backend/                       # Node.js backend API
│   ├── src/
│   │   ├── services/             # Business logic services
│   │   │   ├── ImageProcessor.js        # Image processing and similarity
│   │   │   └── ProductDatabase.js       # Product data management
│   │   ├── middleware/           # Express middleware
│   │   │   └── errorHandler.js          # Centralized error handling
│   │   ├── utils/                # Utility functions
│   │   │   └── logger.js                # Winston logging configuration
│   │   ├── data/                 # Product database and embeddings
│   │   │   ├── products.json            # 50 product records
│   │   │   └── embeddings.json          # Pre-computed image embeddings
│   │   └── index.js              # Express server entry point
│   ├── scripts/
│   │   └── generateEmbeddings.js # Script to pre-compute embeddings
│   ├── logs/                     # Application logs (gitignored)
│   ├── package.json              # Backend dependencies
│   ├── jest.config.js            # Jest configuration
│   └── .env.example              # Environment variable template
├── .kiro/specs/                   # Feature specifications
│   └── visual-product-matcher/
│       ├── requirements.md       # Detailed requirements
│       ├── design.md             # Design document with properties
│       └── tasks.md              # Implementation task list
└── README.md                      # This file
```

## Local Development Setup

### Prerequisites
- **Node.js 18+** and npm installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- At least 2GB of free disk space (for dependencies and TensorFlow.js models)

### Quick Start

1. **Clone the repository:**
```bash
git clone <repository-url>
cd visual-product-matcher
```

2. **Set up the backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run generate-embeddings  # Pre-compute product embeddings (takes 2-3 minutes)
npm run dev
```

The backend API will run on `http://localhost:3000`

3. **Set up the frontend (in a new terminal):**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run on `http://localhost:5173`

4. **Open your browser:**
Navigate to `http://localhost:5173` and start searching for similar products!

### Detailed Setup Instructions

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

This will install:
- Express for the web server
- TensorFlow.js and MobileNet for image processing
- Multer for file uploads
- Sharp for image manipulation
- Winston for logging
- Jest and fast-check for testing

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development):
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Generate product embeddings:
```bash
npm run generate-embeddings
```

This script:
- Loads all 50 products from `src/data/products.json`
- Downloads the MobileNet model
- Generates embeddings for each product image
- Saves embeddings to `src/data/embeddings.json`
- Takes approximately 2-3 minutes on first run

5. Start the development server:
```bash
npm run dev
```

The server will start with hot-reload enabled. You should see:
```
Server running on http://localhost:3000
Environment: development
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

This will install:
- React and React DOM
- Vite for fast development
- Tailwind CSS for styling
- Axios for API calls
- Vitest and fast-check for testing

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development):
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start with hot module replacement. You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Running Tests

#### Backend Tests
```bash
cd backend
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
```

Test suites include:
- Unit tests for ImageProcessor and ProductDatabase services
- Property-based tests for data integrity and similarity calculations
- Integration tests for API endpoints
- Error handling tests

#### Frontend Tests
```bash
cd frontend
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
```

Test suites include:
- Component tests for UploadInterface, SearchResults, and FilterControl
- Property-based tests for filtering and responsive behavior
- Integration tests for the complete search flow
- Cross-browser compatibility tests

### Linting

**Backend:**
```bash
cd backend
npm run lint
```

**Frontend:**
```bash
cd frontend
npm run lint
```

### Troubleshooting

**Issue: "Cannot find module '@tensorflow/tfjs'"**
- Solution: Run `npm install` in the backend directory

**Issue: "Port 3000 already in use"**
- Solution: Change `PORT` in `backend/.env` to another port (e.g., 3001)

**Issue: "embeddings.json not found"**
- Solution: Run `npm run generate-embeddings` in the backend directory

**Issue: Frontend can't connect to backend**
- Solution: Ensure backend is running and `VITE_API_URL` in `frontend/.env` matches the backend URL

**Issue: Images not loading**
- Solution: Check that product images in `backend/src/data/products.json` have valid URLs

## API Endpoints

### POST /api/search
Search for visually similar products by uploading an image.

**Request:**
- **Method**: POST
- **Content-Type**: `multipart/form-data` (for file upload) or `application/json` (for URL)
- **Body**:
  - File upload: `image` field with image file
  - URL: `{ "imageUrl": "https://example.com/image.jpg" }`

**Supported Image Formats**: JPEG, PNG, WebP, GIF

**Size Limits**: Maximum 10MB per image

**Example with cURL (file upload):**
```bash
curl -X POST http://localhost:3000/api/search \
  -F "image=@/path/to/image.jpg"
```

**Example with cURL (URL):**
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg"}'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "uploadedImageUrl": "data:image/jpeg;base64,...",
  "results": [
    {
      "id": "prod_001",
      "name": "Wireless Headphones",
      "category": "Electronics",
      "imageUrl": "https://images.unsplash.com/...",
      "similarityScore": 92.5
    },
    {
      "id": "prod_002",
      "name": "Bluetooth Speaker",
      "category": "Electronics",
      "imageUrl": "https://images.unsplash.com/...",
      "similarityScore": 87.3
    }
  ],
  "processingTime": 1234
}
```

**Error Responses:**

*400 Bad Request - Invalid image:*
```json
{
  "success": false,
  "error": "Invalid image format. Supported formats: JPEG, PNG, WebP, GIF",
  "code": "INVALID_IMAGE"
}
```

*413 Payload Too Large:*
```json
{
  "success": false,
  "error": "Image size exceeds maximum limit of 10MB",
  "code": "FILE_TOO_LARGE"
}
```

*500 Internal Server Error:*
```json
{
  "success": false,
  "error": "Failed to process image",
  "code": "PROCESSING_ERROR"
}
```

### GET /api/products
Retrieve all products in the database.

**Request:**
- **Method**: GET
- **No parameters required**

**Example with cURL:**
```bash
curl http://localhost:3000/api/products
```

**Success Response (200 OK):**
```json
{
  "products": [
    {
      "id": "prod_001",
      "name": "Wireless Headphones",
      "category": "Electronics",
      "imageUrl": "https://images.unsplash.com/...",
      "metadata": {
        "brand": "AudioTech",
        "description": "Noise-cancelling wireless headphones"
      }
    }
  ],
  "count": 50
}
```

### GET /health
Health check endpoint for monitoring.

**Request:**
- **Method**: GET

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Approach

This Visual Product Matcher application leverages pre-trained deep learning models to enable fast, accurate visual search without requiring custom model training. The system uses MobileNet, a lightweight convolutional neural network, to extract 1024-dimensional feature embeddings from images. These embeddings capture the visual characteristics of products in a compact numerical representation.

When a user uploads an image, the backend extracts its embedding and compares it against pre-computed embeddings for all 50 products in the database using cosine similarity. This mathematical measure quantifies how similar two images are, producing scores from 0-100%. The top 20 most similar products are returned, ranked by score.

The architecture prioritizes speed and user experience. Pre-computing product embeddings during setup eliminates redundant processing, enabling search results within 10 seconds. The React frontend provides an intuitive interface with drag-and-drop upload, URL input, and real-time filtering by similarity threshold. Responsive design ensures seamless operation across desktop, tablet, and mobile devices.

The technology stack—React with Vite for the frontend and Node.js with Express for the backend—was chosen for rapid development and easy deployment to free hosting services like Vercel or Railway. TensorFlow.js enables running machine learning models directly in Node.js without external API dependencies, reducing latency and costs while maintaining privacy.

## Environment Variables

### Backend Configuration

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Port number for the backend server | `3000` | No |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS configuration | `http://localhost:5173` | Yes (production) |

**Example `.env` file:**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Production configuration:**
```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Configuration

Create a `.env` file in the `frontend/` directory with the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` | Yes |

**Example `.env` file:**
```env
VITE_API_URL=http://localhost:3000
```

**Production configuration:**
```env
VITE_API_URL=https://your-backend-domain.com
```

**Note**: Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client-side code.

## Deployment

### Deployment Options

The application can be deployed to various free hosting services:

**Frontend Options:**
- **Vercel** (Recommended) - Automatic deployments from Git, global CDN, HTTPS included
- **Netlify** - Similar to Vercel with drag-and-drop deployment
- **GitHub Pages** - Free static hosting for public repositories

**Backend Options:**
- **Railway** (Recommended) - Easy Node.js deployment with persistent storage
- **Render** - Free tier with automatic HTTPS
- **Vercel Serverless Functions** - Serverless deployment (requires code adaptation)

## Deployment

### Deployment Options

The application can be deployed to various free hosting services:

**Frontend Options:**
- **Netlify** (Recommended) - Automatic deployments from Git, global CDN, HTTPS included
- **Vercel** - Similar to Netlify with excellent performance
- **GitHub Pages** - Free static hosting for public repositories

**Backend Options:**
- **Railway** (Recommended) - Easy Node.js deployment with persistent storage, $5/month free credit
- **Render** - Free tier with automatic HTTPS
- **Vercel Serverless Functions** - Serverless deployment

### Quick Deployment Guide

**Step 1: Deploy Backend to Railway**
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Configure environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=<your-frontend-url>`
4. Railway automatically builds and deploys
5. Note your backend URL

**Step 2: Deploy Frontend to Netlify**
1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. Set environment variable:
   - `VITE_API_URL=<your-backend-url>`
5. Netlify automatically builds and deploys
6. Note your frontend URL

**Step 3: Update Backend CORS**
1. Update Railway backend environment variable:
   - `FRONTEND_URL=<your-actual-frontend-url>`
2. Railway automatically redeploys

### Detailed Deployment Guides

For comprehensive step-by-step instructions, see:
- **`DEPLOYMENT_INSTRUCTIONS.md`** - Complete deployment guide with all hosting options
- **`RAILWAY_DEPLOYMENT.md`** - Deploy both frontend and backend to Railway
- **`DEPLOYMENT.md`** - Detailed guide with troubleshooting
- **`PRODUCTION_CHECKLIST.md`** - Pre-deployment checklist
- **`POST_DEPLOYMENT_VALIDATION.md`** - Validation checklist after deployment

### Deployment Steps

#### Deploying to Vercel (Frontend + Backend)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy Frontend:**
```bash
cd frontend
vercel --prod
```

Follow the prompts and note the deployment URL.

3. **Deploy Backend:**
```bash
cd backend
vercel --prod
```

Note the backend URL.

4. **Update Environment Variables:**
- In Vercel dashboard, set `FRONTEND_URL` for backend
- Set `VITE_API_URL` for frontend to point to backend URL
- Redeploy both applications

#### Deploying to Railway (Backend)

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Create new project** and connect your Git repository

3. **Configure environment variables** in Railway dashboard:
   - `PORT` (Railway provides this automatically)
   - `NODE_ENV=production`
   - `FRONTEND_URL=<your-frontend-url>`

4. **Deploy** - Railway automatically builds and deploys on Git push

#### Deploying to Netlify (Frontend)

1. **Create Netlify account** at [netlify.com](https://netlify.com)

2. **Connect Git repository** or drag-and-drop the `frontend/dist` folder

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set environment variables** in Netlify dashboard:
   - `VITE_API_URL=<your-backend-url>`

### Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in backend environment variables
- [ ] Configure CORS with production frontend URL
- [ ] Set up HTTPS (automatic with Vercel/Netlify/Railway)
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Test all API endpoints with production URLs
- [ ] Verify image uploads work in production
- [ ] Test on multiple devices and browsers
- [ ] Set up error logging and monitoring
- [ ] Optimize images and assets
- [ ] Enable gzip compression
- [ ] Set appropriate cache headers

### Post-Deployment Validation

After deployment, verify:

1. **Application loads** at the production URL
2. **HTTPS is enabled** (check for padlock icon)
3. **Image upload works** (both file and URL)
4. **Search returns results** within 10 seconds
5. **Filtering works** correctly
6. **Responsive design** works on mobile devices
7. **Error handling** displays user-friendly messages
8. **Cross-browser compatibility** (Chrome, Firefox, Safari, Edge)

## License

MIT
