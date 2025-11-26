# 🚀 Bot-O-Matic Deployment Guide

This guide covers deploying the Bot-O-Matic application to production using free/low-cost cloud services.

## 📋 Deployment Architecture

**Recommended Setup:**
- **Frontend**: Vercel (optimized for Next.js, free tier)
- **Backend**: Railway or Render (Node.js support, free tier)
- **Database**: SQLite file-based (included with backend) or upgrade to PostgreSQL

## 🎯 Quick Deploy (Recommended)

### Option 1: Vercel + Railway (Easiest)

#### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the `backend` folder as root

3. **Configure Environment Variables**
   ```
   PORT=3001
   JWT_SECRET=your-production-jwt-secret-min-32-chars
   ENCRYPTION_KEY=your-production-32-char-key!
   DATABASE_PATH=./data/botomatic.db
   
   DEFAULT_LLM_PROVIDER=openai
   DEFAULT_OPENAI_API_KEY=sk-your-openai-api-key
   
   STRIPE_SECRET_KEY=sk_live_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
   ```

4. **Get Railway URL**
   - Railway will assign a URL like: `https://bot-o-matic-backend.up.railway.app`
   - Copy this URL for frontend configuration

#### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Framework Preset: Next.js (auto-detected)

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app
   NEXT_PUBLIC_DEMO_MODE=false
   NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be live at: `https://bot-o-matic.vercel.app`

#### Step 3: Update CORS and Webhook URLs

1. **Update Backend CORS**
   - In Railway, add environment variable:
   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

2. **Configure Stripe Webhook**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-railway-backend.up.railway.app/api/payment/webhook`
   - Select events: `checkout.session.completed`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

### Option 2: Render (All-in-One)

#### Deploy Backend

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect repository
   - **Settings:**
     - Name: `bot-o-matic-backend`
     - Region: Choose closest
     - Branch: `main`
     - Root Directory: `backend`
     - Runtime: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Instance Type: Free

3. **Add Environment Variables**
   (Same as Railway above)

4. **Create Disk for Database**
   - In service settings, add Persistent Disk
   - Mount path: `/app/data`
   - Size: 1GB (free tier)

#### Deploy Frontend

1. **Create Static Site**
   - New → Static Site
   - Connect same repository
   - **Settings:**
     - Name: `bot-o-matic-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `.next`

2. **Add Environment Variables**
   (Same as Vercel above)

---

### Option 3: Docker Deployment

#### Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["npm", "start"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - DEFAULT_OPENAI_API_KEY=${DEFAULT_OPENAI_API_KEY}
    volumes:
      - backend-data:/app/data
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NEXT_PUBLIC_DEMO_MODE=false
    depends_on:
      - backend

volumes:
  backend-data:
```

**Deploy to any Docker-compatible host:**
```bash
docker-compose up -d
```

---

## 🔧 Pre-Deployment Checklist

### 1. Fix Database Routes

The auth routes need to be fixed for async sqlite3. Run this command:

```bash
# This will be provided in a separate file
```

### 2. Environment Variables

Create production `.env` files:

**Backend `.env.production`:**
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-strong-secret-32-chars>
ENCRYPTION_KEY=<generate-strong-key-32-chars>

# LLM
DEFAULT_LLM_PROVIDER=openai
DEFAULT_OPENAI_API_KEY=<your-production-api-key>

# Stripe
STRIPE_SECRET_KEY=sk_live_<your-live-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-publishable-key>

# Pricing
PRICE_BASIC=500
PRICE_PREMIUM=1000

# CORS
CORS_ORIGIN=https://your-production-domain.com
```

**Frontend `.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_URL=https://your-frontend-url.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your-key>
```

### 3. Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate encryption key (must be exactly 32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Database Upgrade (Optional but Recommended)

For production, consider upgrading from SQLite to PostgreSQL:

**Install PostgreSQL adapter:**
```bash
npm install pg
```

**Update database connection** (create `backend/database-pg.js`):
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Migration queries...
```

---

## 🔒 Security Checklist

- [ ] Change all default secrets
- [ ] Use production Stripe keys
- [ ] Enable HTTPS (handled by Vercel/Railway)
- [ ] Set secure CORS origins
- [ ] Enable rate limiting (add express-rate-limit)
- [ ] Add input validation (add express-validator)
- [ ] Review API key encryption
- [ ] Set up monitoring (Sentry, LogRocket)

---

## 📊 Post-Deployment

### 1. Test the Full Flow

1. Visit your production URL
2. Create a test bot with demo payment
3. Redeem the QR code
4. Test chat functionality
5. Verify LLM responses

### 2. Set Up Monitoring

**Vercel Analytics** (Free):
- Enable in Vercel dashboard
- Track page views and performance

**Railway Analytics**:
- Built-in resource monitoring
- View logs in real-time

**Stripe Dashboard**:
- Monitor payments
- Test webhooks

### 3. Custom Domain (Optional)

**Vercel:**
- Settings → Domains → Add Domain
- Follow DNS configuration steps

**Railway:**
- Settings → Custom Domain
- Add CNAME record

---

## 🐛 Troubleshooting

### Backend won't start
- Check Railway/Render logs
- Verify all environment variables are set
- Ensure database directory exists

### Frontend can't connect to backend
- Check CORS configuration
- Verify API URL in frontend env vars
- Check backend health: `https://your-backend/health`

### Database errors
- Check file permissions for SQLite
- Verify database directory is writable
- Consider upgrading to PostgreSQL

### Stripe webhooks failing
- Verify webhook URL is correct
- Check webhook secret is set
- Test with Stripe CLI locally first

---

## 💰 Cost Estimate (Free Tier)

- **Vercel**: Free for personal projects
- **Railway**: $5/month free credit (enough for light usage)
- **Render**: Free tier with limitations
- **Total**: $0-5/month for MVP

**Paid tiers when needed:**
- Vercel Pro: $20/month (team features)
- Railway Pro: ~$10-20/month (based on usage)
- Render Standard: $7/month per service

---

## 🚀 One-Click Deploy (Coming Soon)

Click the button below to deploy with one click:

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo&env=NEXT_PUBLIC_API_URL,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally first with production env vars
4. Review the troubleshooting section above

Happy deploying! 🎉
