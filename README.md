# Visual Product Matcher

An AI-powered visual search application that finds similar products based on image similarity using deep learning.

## 🌐 Live Demo

**Frontend:** https://frontend-seven-liart-65.vercel.app  
**Backend API:** https://visual-product-matcher-backend-zkyj.onrender.com

## ✨ Features

- **Image Upload**: Upload images directly from your device
- **URL Search**: Search using image URLs from the web
- **AI-Powered Matching**: Uses MobileNet deep learning model for visual similarity
- **Smart Filtering**: Adjust similarity threshold to refine results
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Results**: Get instant product matches with similarity scores

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Deployed on:** Vercel

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TensorFlow.js** - Machine learning
- **MobileNet** - Pre-trained image classification model
- **Sharp** - Image processing
- **Canvas** - Image manipulation
- **Deployed on:** Render.com

## 📁 Project Structure

```
visual-product-matcher/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── App.jsx          # Main app component
│   └── package.json
│
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── data/           # Product database & embeddings
│   │   └── index.js        # Server entry point
│   └── package.json
│
└── README.md
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run generate-embeddings  # Generate product embeddings
npm run dev                   # Start development server
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev                   # Start development server
```

Frontend runs on `http://localhost:5173`

### Environment Variables

**Backend** (`.env`):
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Frontend (Vercel)
The frontend is automatically deployed to Vercel on every push to the `main` branch.

### Backend (Render.com)
The backend is deployed on Render.com with the following configuration:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:** `NODE_ENV`, `FRONTEND_URL`, `PORT`

## 🎯 How It Works

1. **Image Upload**: User uploads an image or provides a URL
2. **Feature Extraction**: MobileNet model extracts visual features (embeddings)
3. **Similarity Search**: Compares uploaded image with pre-computed product embeddings
4. **Ranking**: Products are ranked by cosine similarity score
5. **Results Display**: Top 20 similar products are displayed with scores

## 🔧 API Endpoints

### `POST /api/search`
Search for similar products by image.

**Request:**
- `multipart/form-data` with `image` file, OR
- JSON with `imageUrl` field

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "product-1",
      "name": "Product Name",
      "category": "Category",
      "imageUrl": "https://...",
      "similarityScore": 95,
      "rank": 1
    }
  ],
  "count": 20
}
```

### `GET /api/products`
Get all products in the database.

### `GET /health`
Health check endpoint.

## 📊 Product Database

The application includes 50 pre-loaded products across various categories:
- Electronics
- Fashion
- Home & Garden
- Sports & Outdoors
- And more...

Products are stored in `backend/src/data/products.json` with pre-computed embeddings in `backend/src/data/embeddings.json`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- TensorFlow.js team for the amazing ML framework
- MobileNet model for efficient image classification
- Unsplash for product images

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and TensorFlow.js**
