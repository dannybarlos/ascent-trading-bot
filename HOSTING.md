# Hosting Options Comparison

## Quick Comparison Table

| Platform | Free Tier | Always On? | Redis | Build Time | Best For |
|----------|-----------|------------|-------|------------|----------|
| **Railway** | 500 hrs/mo | ✅ Yes | ✅ Plugin | Fast | Full-stack apps |
| **Render** | 750 hrs/mo | ❌ Sleeps | ✅ Free | Medium | Side projects |
| **Fly.io** | 3 VMs | ✅ Yes | ✅ Paid | Fast | Production apps |
| **Vercel** | Unlimited | ✅ Yes | ❌ External | Instant | Static + API |
| **Google Cloud Run** | 2M req/mo | ⚡️ Auto-scale | ❌ External | Fast | Serverless |
| **Koyeb** | 1 service | ✅ Yes | ❌ External | Medium | Small apps |

---

## Detailed Platform Guides

### 🚂 Railway (Recommended)

**Best for:** This exact app with minimal configuration

**Setup:**
```bash
./deploy-railway.sh
```

**Pros:**
- ✅ One-click deployment
- ✅ Built-in Redis
- ✅ Auto-scaling
- ✅ Great developer experience
- ✅ Automatic HTTPS
- ✅ Zero-downtime deploys

**Cons:**
- ⚠️ Free tier limited to 500 hours/month
- ⚠️ Requires credit card for free tier

**Cost:** $5-10/month for continuous uptime

---

### 🎨 Render.com

**Best for:** Side projects, testing

**Setup:**
1. Connect GitHub repo
2. Create Web Service
3. Add Redis instance
4. Set environment variables
5. Deploy

**Configuration:**
```yaml
# render.yaml
services:
  - type: web
    name: ascent-trading-bot
    env: python
    buildCommand: "chmod +x railway-build.sh && ./railway-build.sh"
    startCommand: "chmod +x railway-start.sh && ./railway-start.sh"
    envVars:
      - key: ALPACA_API_KEY
        sync: false
      - key: ALPACA_SECRET_KEY
        sync: false
      - key: ALPACA_BASE_URL
        value: https://paper-api.alpaca.markets
      - key: REDIS_URL
        fromService:
          type: redis
          name: ascent-redis
          property: connectionString

  - type: redis
    name: ascent-redis
    ipAllowList: []
    plan: free
```

**Pros:**
- ✅ 750 hours free/month
- ✅ Easy GitHub integration
- ✅ Free Redis (90 days)
- ✅ Good documentation

**Cons:**
- ❌ Services sleep after 15 min inactivity
- ❌ 30 second cold start
- ❌ Redis expires after 90 days

**Cost:** $7/month for always-on

---

### ✈️ Fly.io

**Best for:** Production apps with global distribution

**Setup:**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Add Redis
flyctl redis create

# Deploy
flyctl deploy
```

**Configuration:**
```toml
# fly.toml
app = "ascent-trading-bot"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/python"]

[env]
  PORT = "8080"
  ALPACA_BASE_URL = "https://paper-api.alpaca.markets"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80
    force_https = true

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.http_checks]]
    interval = 10000
    grace_period = "5s"
    method = "get"
    path = "/api/health"
    timeout = 2000
```

**Pros:**
- ✅ No cold starts
- ✅ 3 free VMs
- ✅ Global edge network
- ✅ Excellent for WebSocket
- ✅ Built-in Redis

**Cons:**
- ⚠️ Requires credit card
- ⚠️ Learning curve
- ⚠️ Redis costs $1.94/month

**Cost:** Free for small apps, ~$5/month with Redis

---

### ▲ Vercel (Frontend) + Backend Separately

**Best for:** Serving the React frontend with API elsewhere

**Setup:**
1. Push to GitHub
2. Import to Vercel
3. Configure build settings
4. Deploy backend elsewhere (Railway/Render)

**Configuration:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

**Pros:**
- ✅ Lightning-fast CDN
- ✅ Unlimited bandwidth
- ✅ Perfect for React apps
- ✅ Auto-deployments
- ✅ Free forever

**Cons:**
- ❌ Backend needs separate hosting
- ❌ More complex setup
- ❌ Serverless limitations

**Cost:** Free frontend, backend varies

---

### ☁️ Google Cloud Run

**Best for:** Auto-scaling serverless deployment

**Setup:**
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Login
gcloud auth login

# Build and deploy
gcloud run deploy ascent-trading-bot \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Copy files
COPY requirements.txt .
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN pip install -r requirements.txt
RUN cd frontend && npm ci

# Copy application
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Run
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Pros:**
- ✅ 2 million requests free/month
- ✅ Auto-scales to zero
- ✅ Pay per use
- ✅ Fast cold starts

**Cons:**
- ⚠️ Requires GCP account
- ⚠️ Complex pricing
- ⚠️ Redis needs Cloud Memorystore ($$$)

**Cost:** ~$1-5/month for light usage

---

### 🆕 Koyeb

**Best for:** Simple deployment with no configuration

**Setup:**
1. Connect GitHub
2. Select repo
3. Set environment variables
4. Deploy

**Pros:**
- ✅ Free tier doesn't sleep
- ✅ Global edge network
- ✅ Simple Railway-like experience
- ✅ Auto-deployments

**Cons:**
- ⚠️ Newer platform
- ⚠️ Limited free tier
- ⚠️ No built-in Redis

**Cost:** Free tier available, $5/month for more

---

## Recommended Setup by Use Case

### 🧪 **Development/Testing**
→ **Render** (free, easy)
- Free tier is generous
- Easy to set up
- Can sleep when not in use

### 💼 **Personal/Side Project**
→ **Railway** or **Fly.io**
- Always on
- Reliable
- Good developer experience
- ~$5/month

### 🏢 **Production/Business**
→ **Fly.io** or **Google Cloud Run**
- High availability
- Auto-scaling
- Global distribution
- Professional support

### 💰 **Absolute Free Forever**
→ **Frontend on Vercel** + **Backend on Render**
- Frontend always fast
- Backend can sleep (acceptable for low traffic)
- Completely free

---

## Migration Guide

### From Railway to Render

1. Export Railway environment variables
2. Create `render.yaml` (see above)
3. Push to GitHub
4. Import to Render
5. Configure environment variables
6. Deploy

### From Railway to Fly.io

1. Install Fly CLI
2. Run `flyctl launch`
3. Copy environment variables
4. Deploy with `flyctl deploy`

### From Railway to Vercel + Railway

1. Keep backend on Railway
2. Deploy frontend to Vercel
3. Point frontend API calls to Railway URL
4. Update CORS settings

---

## Cost Breakdown (Monthly)

| Usage Pattern | Railway | Render | Fly.io | Vercel+Render |
|---------------|---------|--------|--------|---------------|
| **24/7 Personal Use** | $5-10 | $7 | $5 | $7 |
| **Light Use (<100hrs/mo)** | Free | Free | Free | Free |
| **Business (High Traffic)** | $20+ | $25+ | $15+ | $25+ |

---

## My Recommendation

**For This App:**

1. **Best Overall:** Railway ($5/month)
   - Easiest setup
   - Built-in Redis
   - Great DX

2. **Best Free:** Fly.io (Free tier)
   - No cold starts
   - Always on
   - Professional features

3. **Best Budget:** Frontend on Vercel + Backend on Render ($7/month)
   - Fast frontend
   - Affordable backend
   - Good separation of concerns

**Start with Railway using the one-click script I provided!**
