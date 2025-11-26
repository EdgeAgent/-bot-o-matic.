#!/bin/bash

# Bot-O-Matic Deployment Helper Script
# This script helps you choose and execute a deployment strategy

echo "🤖 Bot-O-Matic Deployment Helper"
echo "=================================="
echo ""
echo "Choose your deployment method:"
echo ""
echo "1) Deploy to Vercel (Frontend) + Railway (Backend) - RECOMMENDED"
echo "2) Deploy to Render (Full Stack)"
echo "3) Deploy with Docker locally"
echo "4) Generate deployment files only"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    echo ""
    echo "📦 Deploying to Vercel + Railway"
    echo "================================"
    echo ""
    echo "Step 1: Deploy Backend to Railway"
    echo "-----------------------------------"
    echo "1. Go to https://railway.app"
    echo "2. Create new project from GitHub"
    echo "3. Select this repository"
    echo "4. Set root directory to 'backend'"
    echo "5. Add environment variables from .env.production"
    echo ""
    read -p "Press Enter when backend is deployed..."
    read -p "Enter your Railway backend URL: " RAILWAY_URL
    
    echo ""
    echo "Step 2: Deploy Frontend to Vercel"
    echo "-----------------------------------"
    echo "1. Installing Vercel CLI..."
    npm install -g vercel
    
    echo "2. Deploying frontend..."
    cd frontend
    echo "NEXT_PUBLIC_API_URL=$RAILWAY_URL" > .env.production.local
    vercel --prod
    
    echo ""
    echo "✅ Deployment initiated!"
    echo "Follow the Vercel prompts to complete deployment."
    ;;
    
  2)
    echo ""
    echo "📦 Deploying to Render"
    echo "======================"
    echo ""
    echo "Please follow these manual steps:"
    echo ""
    echo "Backend:"
    echo "--------"
    echo "1. Go to https://render.com/dashboard"
    echo "2. New → Web Service"
    echo "3. Connect your repo, set root to 'backend'"
    echo "4. Build: npm install"
    echo "5. Start: npm start"
    echo "6. Add environment variables from .env.production"
    echo ""
    echo "Frontend:"
    echo "---------"
    echo "1. New → Static Site"
    echo "2. Root: 'frontend'"
    echo "3. Build: npm install && npm run build"
    echo "4. Publish: .next"
    echo "5. Add NEXT_PUBLIC_API_URL with your backend URL"
    echo ""
    ;;
    
  3)
    echo ""
    echo "🐳 Deploying with Docker"
    echo "========================"
    echo ""
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed."
        echo "Please install Docker Desktop from https://docker.com/get-started"
        exit 1
    fi
    
    echo "✅ Docker is installed"
    echo ""
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo "⚠️  No .env file found. Creating from template..."
        cp .env.production .env
        echo "📝 Please edit .env with your actual values"
        read -p "Press Enter when ready..."
    fi
    
    echo "🏗️  Building and starting containers..."
    docker-compose up --build -d
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "Your application is running at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop:"
    echo "  docker-compose down"
    ;;
    
  4)
    echo ""
    echo "📄 Deployment files are ready!"
    echo "=============================="
    echo ""
    echo "Files created:"
    echo "  ✓ DEPLOYMENT.md - Full deployment guide"
    echo "  ✓ docker-compose.yml - Docker orchestration"
    echo "  ✓ backend/Dockerfile - Backend container"
    echo "  ✓ frontend/Dockerfile - Frontend container"
    echo "  ✓ backend/Procfile - Heroku/Railway config"
    echo "  ✓ backend/railway.json - Railway config"
    echo "  ✓ frontend/vercel.json - Vercel config"
    echo "  ✓ .env.production - Production env template"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT.md for detailed instructions"
    echo "2. Copy .env.production to .env and fill in values"
    echo "3. Choose a deployment platform and follow the guide"
    ;;
    
  5)
    echo "Exiting..."
    exit 0
    ;;
    
  *)
    echo "Invalid choice. Exiting..."
    exit 1
    ;;
esac

echo ""
echo "🎉 Done!"
