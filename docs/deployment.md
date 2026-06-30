# Deployment Guide

The Tech Store application consists of a statically built React frontend and a Node.js API backend.

## Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or self-hosted)

## 1. Backend Deployment (Server)
The backend acts as an API server and can be deployed to services like Render, Heroku, or AWS EC2/ECS.

### Steps
1. Navigate to the `server/` directory.
2. Install dependencies: `npm install --production`.
3. Set Environment Variables:
   - `PORT`: Usually `5000` or provided by host.
   - `MONGODB_URI`: Connection string.
   - `JWT_SECRET`: Secure random string.
   - `JWT_EXPIRES_IN`: e.g., `7d`.
4. Start the server: `npm start`.

## 2. Frontend Deployment (Client)
The frontend is a Vite-powered React SPA and should be deployed to static hosting providers like Vercel, Netlify, or AWS S3 + CloudFront.

### Steps
1. Navigate to the `client/` directory.
2. Install dependencies: `npm install`.
3. Set Environment Variables:
   - `VITE_API_URL`: URL of the deployed backend (e.g., `https://api.techstore.com/api`).
4. Build the application: `npm run build`.
5. Deploy the contents of the `client/dist` directory to your static hosting provider.
6. Ensure your static host is configured to fallback to `index.html` for client-side routing (React Router).
