# Bot-O-Matic Deployment Helper Script
Write-Host "Bot-O-Matic Deployment Helper" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose your deployment method:" -ForegroundColor Yellow
Write-Host "1) Deploy to Vercel (Frontend) + Railway (Backend) - RECOMMENDED"
Write-Host "2) Deploy to Render (Full Stack)"
Write-Host "3) Deploy with Docker locally"
Write-Host "4) View deployment guide"
Write-Host "5) Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Deploying to Vercel + Railway" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 1: Deploy Backend to Railway"
        Write-Host "-----------------------------------"
        Write-Host "1. Go to https://railway.app"
        Write-Host "2. Sign up/Login with GitHub"
        Write-Host "3. Click 'New Project' -> 'Deploy from GitHub repo'"
        Write-Host "4. Select your repository"
        Write-Host "5. Set root directory to 'backend'"
        Write-Host "6. Add all environment variables from .env.production"
        Write-Host ""
        Read-Host "Press Enter when backend is deployed"
        
        $railwayUrl = Read-Host "Enter your Railway backend URL (e.g., https://yourapp.up.railway.app)"
        
        Write-Host ""
        Write-Host "Step 2: Deploy Frontend to Vercel" -ForegroundColor Green
        Write-Host "-----------------------------------"
        
        # Check if Vercel CLI is installed
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        
        if (-not $vercelInstalled) {
            Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "Deploying frontend..." -ForegroundColor Yellow
        Set-Location frontend
        
        # Create production env file
        $envContent = "NEXT_PUBLIC_API_URL=$railwayUrl`r`nNEXT_PUBLIC_DEMO_MODE=false"
        $envContent | Out-File -FilePath .env.production.local -Encoding utf8
        
        Write-Host ""
        Write-Host "Running Vercel deployment..." -ForegroundColor Green
        vercel --prod
        
        Write-Host ""
        Write-Host "Deployment initiated!" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "Deploying to Render" -ForegroundColor Green
        Write-Host "======================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Please follow these manual steps:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Backend:" -ForegroundColor Cyan
        Write-Host "--------"
        Write-Host "1. Go to https://render.com/dashboard"
        Write-Host "2. New -> Web Service"
        Write-Host "3. Connect your repo, set root to 'backend'"
        Write-Host "4. Build Command: npm install"
        Write-Host "5. Start Command: npm start"
        Write-Host "6. Add environment variables from .env.production"
        Write-Host ""
        Write-Host "Frontend:" -ForegroundColor Cyan
        Write-Host "---------"
        Write-Host "1. New -> Static Site"
        Write-Host "2. Root Directory: 'frontend'"
        Write-Host "3. Build Command: npm install && npm run build"
        Write-Host "4. Publish Directory: .next"
        Write-Host "5. Add NEXT_PUBLIC_API_URL with your backend URL"
        Write-Host ""
        
        Write-Host "Opening Render dashboard..." -ForegroundColor Yellow
        Start-Process "https://render.com/dashboard"
    }
    
    "3" {
        Write-Host ""
        Write-Host "Deploying with Docker" -ForegroundColor Green
        Write-Host "========================" -ForegroundColor Green
        Write-Host ""
        
        # Check if Docker is installed
        $dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
        
        if (-not $dockerInstalled) {
            Write-Host "Docker is not installed." -ForegroundColor Red
            Write-Host "Please install Docker Desktop from https://docker.com/get-started"
            Start-Process "https://www.docker.com/products/docker-desktop"
            exit 1
        }
        
        Write-Host "Docker is installed" -ForegroundColor Green
        Write-Host ""
        
        # Check if .env exists
        if (-not (Test-Path ".env")) {
            Write-Host "No .env file found. Creating from template..." -ForegroundColor Yellow
            Copy-Item .env.production .env
            Write-Host "Please edit .env with your actual values" -ForegroundColor Yellow
            Read-Host "Press Enter when ready"
        }
        
        Write-Host "Building and starting containers..." -ForegroundColor Yellow
        docker-compose up --build -d
        
        Write-Host ""
        Write-Host "Deployment complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your application is running at:" -ForegroundColor Cyan
        Write-Host "  Frontend: http://localhost:3000"
        Write-Host "  Backend:  http://localhost:3001"
        Write-Host ""
        Write-Host "To view logs:" -ForegroundColor Yellow
        Write-Host "  docker-compose logs -f"
        Write-Host ""
        Write-Host "To stop:" -ForegroundColor Yellow
        Write-Host "  docker-compose down"
        Write-Host ""
        
        # Open browser
        Start-Sleep -Seconds 5
        Start-Process "http://localhost:3000"
    }
    
    "4" {
        Write-Host ""
        Write-Host "Opening deployment guide..." -ForegroundColor Green
        
        if (Test-Path "DEPLOYMENT.md") {
            Start-Process "DEPLOYMENT.md"
        }
        else {
            Write-Host "DEPLOYMENT.md not found" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to exit"
