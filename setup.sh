#!/bin/bash

# KingsMove Development Setup Script

echo "🚀 Setting up KingsMove development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Create example environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating example backend .env file..."
    cat > backend/.env << EOL
# MongoDB
MONGODB_URI=mongodb://localhost:27017/kingsmove

# JWT Secrets (change these in production!)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary (get these from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=4000
NODE_ENV=development
EOL
    echo "⚠️  Please update backend/.env with your actual values"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating example frontend .env file..."
    cat > frontend/.env << EOL
VITE_BACKEND_URL=http://localhost:4000
SOCKET_URL=http://localhost:4001
EOL
fi

echo "✅ Environment files created"

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update backend/.env with your MongoDB URI and Cloudinary credentials"
echo "2. Start MongoDB (locally or use Docker: docker run -d -p 27017:27017 mongo)"
echo "3. Run the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose: docker-compose -f docker-compose.dev.yml up"
echo ""
echo "Happy coding! 🚀"