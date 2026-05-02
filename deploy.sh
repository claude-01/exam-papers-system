#!/bin/bash

echo "🚀 Deploying Exam Papers System to Render + Netlify"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Preparing backend for Render deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}Error: backend/package.json not found. Please run from project root.${NC}"
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Test database connection
echo "Testing database connection..."
node test-db.js

if [ $? -ne 0 ]; then
    echo -e "${RED}Database connection failed. Please check your DATABASE_URL.${NC}"
    exit 1
fi

echo -e "${GREEN}Backend preparation complete!${NC}"

echo -e "${YELLOW}Step 2: Deploying to Render...${NC}"
echo "Please follow these steps:"
echo "1. Go to https://render.com"
echo "2. Connect your GitHub repository"
echo "3. Create a new Web Service"
echo "4. Select your repository"
echo "5. Configure build settings:"
echo "   - Build Command: cd backend && npm install"
echo "   - Start Command: cd backend && npm start"
echo "6. Add environment variables:"
echo "   - NODE_ENV: production"
echo "   - DATABASE_URL: [Your Render PostgreSQL URL]"
echo "   - JWT_SECRET: [Generate a secure secret]"
echo "7. Deploy!"

echo -e "${YELLOW}Step 3: Deploying frontend to Netlify...${NC}"
echo "Please follow these steps:"
echo "1. Go to https://netlify.com"
echo "2. Connect your GitHub repository"
echo "3. Configure build settings:"
echo "   - Build command: cd frontend && npm run build"
echo "   - Publish directory: frontend/public"
echo "4. Add environment variable:"
echo "   - NODE_ENV: production"
echo "5. Deploy!"

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo ""
echo "After deployment, update frontend/config.js with your Render backend URL"
echo "Then redeploy the frontend."
