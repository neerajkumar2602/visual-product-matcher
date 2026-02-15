# Project Approach: Visual Product Matcher

The Visual Product Matcher is an AI-powered image similarity search application built with a full-stack architecture. The frontend uses React and Vite for a responsive user interface, while the backend leverages Node.js, Express, and TensorFlow.js for image processing and similarity computation.

The core approach uses MobileNet v1, a pre-trained deep learning model, to extract visual features from uploaded images. I pre-computed embeddings for all 50 products during build time and stored them in JSON format for fast retrieval. When users upload an image or provide a URL, the system extracts features, compares them with product embeddings using cosine similarity, and returns the top 20 matches ranked by similarity score.

Key technical decisions included choosing MobileNet for its efficiency, implementing pre-computed embeddings to optimize performance, and using cosine similarity for normalized scoring. The image processing pipeline validates inputs, resizes images to 224x224 pixels, converts them to tensors, and extracts features efficiently using Sharp and Canvas APIs.

Deployment presented a challenge: Vercel's serverless functions don't support TensorFlow.js with native dependencies. I solved this by deploying the backend to Render.com (full Node.js environment) while keeping the frontend on Vercel for optimal CDN delivery. The application includes comprehensive testing with Jest and React Testing Library, ensuring robustness across various inputs and edge cases.
