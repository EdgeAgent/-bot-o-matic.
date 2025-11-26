# 🤖 Bot-O-Matic - AI Chatbot Vending Machine

A gamified, end-to-end platform for creating and deploying custom AI chatbots through an interactive "vending machine" experience.

## ✨ Features

- 🎨 **Custom Chatbot Creation** - Define personality, knowledge base, and style
- 🔑 **Flexible LLM Integration** - Use your own API key or our default service
- 💳 **Stripe Payment Integration** - Secure checkout with demo mode
- 🥚 **Gamified Experience** - Virtual egg reveal with stunning animations
- 💬 **Real-time Chat Interface** - Instant interaction with your custom bot
- 📱 **QR Code Redemption** - Scan and claim your chatbot
- 🎯 **Bot Collection Dashboard** - Manage all your vended bots

## 🏗️ Architecture

```
bot-o-matic/
├── backend/          # Node.js/Express API server
│   ├── routes/       # API endpoints
│   ├── services/     # LLM orchestration, business logic
│   └── utils/        # Encryption, QR codes, helpers
└── frontend/         # Next.js React application
    ├── app/          # Pages (vending, redemption, dashboard)
    ├── components/   # Reusable UI components
    └── utils/        # API client, helpers
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI/Gemini/Anthropic API key (optional for testing)
- Stripe account for payment testing (optional)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Run the development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

## 🎮 Usage

### Demo Mode (No API Keys Required)

1. Visit http://localhost:3000
2. Customize your chatbot (personality, knowledge base)
3. Click "Simulate Payment" to skip Stripe checkout
4. Get your QR code and redemption link
5. Scan/click to reveal and chat with your bot!

### Production Mode

1. Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env`
2. Configure Stripe keys
3. Add your default LLM API key or let users provide their own
4. Payments will process through Stripe test mode

## 🔑 LLM Provider Options

Users can choose how their chatbot is powered:

- **Bot-O-Matic Default** - Uses your configured default API
- **User's OpenAI Key** - Bring your own OpenAI API key
- **User's Gemini Key** - Bring your own Google Gemini key
- **User's Anthropic Key** - Bring your own Anthropic Claude key

## 💰 Pricing Tiers

Configure pricing in `.env`:
- `PRICE_BASIC=500` ($5.00) - Standard chatbot
- `PRICE_PREMIUM=1000` ($10.00) - Premium LLM model

## 📚 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/verify-token
```

### Bots
```
POST /api/bots/create
POST /api/bots/redeem
GET /api/bots/:id
GET /api/bots/user/:userId
```

### Chat
```
POST /api/chat/:botId
GET /api/chat/:botId/history
```

### Payment
```
POST /api/payment/create-checkout
POST /api/payment/webhook
POST /api/payment/simulate
```

## 🎨 Customization

### Egg Designs
Egg visuals are dynamically generated based on:
- **Personality** → Color scheme
- **Knowledge Base** → Pattern and texture
- **LLM Provider** → Glow effects

### Animations
Built with Framer Motion:
- Egg formation sequence
- Vending machine drop
- Hatching reveal
- Bot entrance

## 🔒 Security

- API keys encrypted with AES-256-CBC
- JWT-based authentication
- Stripe webhook signature verification
- CORS configured for production domains

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📦 Deployment

### Backend
- Deploy to Heroku, Railway, or any Node.js host
- Configure environment variables
- Set up Stripe webhook endpoint

### Frontend
- Deploy to Vercel (recommended for Next.js)
- Configure `NEXT_PUBLIC_API_URL` to backend URL
- Set production Stripe keys

## 🤝 Contributing

This is an MVP project. Future enhancements could include:
- Physical vending machine kiosk integration
- More LLM providers (Llama, Mistral)
- Advanced RAG with vector databases
- Social sharing and bot marketplace
- Voice interface for chatbots

## 📄 License

MIT

## 🙋 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js, Node.js, and the magic of AI**
