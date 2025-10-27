# 🚀 Quick Start Deployment Guide

Choose your deployment method:

## 🏃 Fastest: One-Click Railway Deployment

```bash
# Run the automated deployment script
./deploy-railway.sh
```

**That's it!** The script will:
1. Install Railway CLI (if needed)
2. Login to Railway
3. Create and configure project
4. Add Redis plugin
5. Prompt for your Alpaca credentials
6. Deploy your app

**Time:** ~5 minutes
**Cost:** Free for first 500 hours/month, then $5/month

---

## 🎨 Alternative: Render.com (Free Tier)

### Option A: Blueprint (Recommended)

1. Click the Deploy button:
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/ascent-trading-bot)

2. Set environment variables:
   - `ALPACA_API_KEY`: Your Alpaca API key
   - `ALPACA_SECRET_KEY`: Your Alpaca secret key
   - `ALPACA_BASE_URL`: `https://paper-api.alpaca.markets`

3. Click "Apply"

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name:** ascent-trading-bot
   - **Runtime:** Python 3
   - **Build Command:** `chmod +x railway-build.sh && ./railway-build.sh`
   - **Start Command:** `chmod +x railway-start.sh && ./railway-start.sh`
5. Add Redis service
6. Set environment variables (see above)
7. Deploy

**Time:** ~10 minutes
**Cost:** Free (sleeps after 15 min), $7/month for always-on

---

## ✈️ Fly.io (Production-Ready)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch (interactive setup)
flyctl launch

# Set secrets
flyctl secrets set ALPACA_API_KEY=your_key_here
flyctl secrets set ALPACA_SECRET_KEY=your_secret_here

# Add Redis (optional, $2/month)
flyctl redis create

# Deploy
flyctl deploy
```

**Time:** ~10 minutes
**Cost:** Free for 3 VMs, ~$5/month with Redis

---

## 🐳 Docker (Self-Hosted)

### Using Docker Compose

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   ALPACA_API_KEY=your_key
   ALPACA_SECRET_KEY=your_secret
   ALPACA_BASE_URL=https://paper-api.alpaca.markets
   ```

3. Start services:
   ```bash
   docker-compose up -d
   ```

4. View logs:
   ```bash
   docker-compose logs -f
   ```

5. Stop services:
   ```bash
   docker-compose down
   ```

**Time:** ~5 minutes (after Docker installed)
**Cost:** Free (runs on your server)

---

## 💻 Local Development

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..

# Set environment variables
export ALPACA_API_KEY=your_key
export ALPACA_SECRET_KEY=your_secret
export ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Run the application
python main.py
```

**Time:** ~5 minutes
**Cost:** Free

---

## 📋 Environment Variables Reference

### Required
- `ALPACA_API_KEY` - Your Alpaca API key
- `ALPACA_SECRET_KEY` - Your Alpaca secret key

### Optional
- `ALPACA_BASE_URL` - Default: `https://paper-api.alpaca.markets`
  - Paper: `https://paper-api.alpaca.markets`
  - Live: `https://api.alpaca.markets` ⚠️
- `REDIS_URL` - Auto-configured by Railway/Render
- `PORT` - Auto-configured by platform (default: 8000)
- `LOG_LEVEL` - `INFO` or `DEBUG` (default: `INFO`)
- `WORKERS` - Number of Uvicorn workers (default: 2)

---

## 🔒 Getting Alpaca Credentials

1. Sign up at [Alpaca](https://alpaca.markets)
2. Navigate to "Paper Trading" → "API Keys"
3. Click "Generate New Key"
4. Copy and save both keys (you can't see the secret again!)
5. Use the **Paper Trading** URL for testing

⚠️ **Never commit API keys to Git!**

---

## ✅ Verify Deployment

After deployment, check:

1. **Health endpoint:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```
   Should return: `{"status":"healthy"}`

2. **Alpaca connection:**
   ```bash
   curl https://your-app.railway.app/api/validate-alpaca
   ```
   Should return: `{"valid":true}`

3. **Frontend:**
   Open `https://your-app.railway.app` in browser

---

## 🐛 Troubleshooting

### Build fails
```bash
# Check logs
railway logs
# or
flyctl logs
```

### Alpaca connection fails
- Verify API keys are correct
- Check `ALPACA_BASE_URL` is set correctly
- Ensure API keys have trading permissions

### Redis connection fails
- Railway: Ensure Redis plugin is added
- Render: Check Redis service is running
- Fly.io: Run `flyctl redis create`

### Frontend not loading
- Check build output in logs
- Verify `frontend/dist` directory exists
- Ensure build script ran successfully

---

## 📊 Monitoring

### Railway
```bash
railway status    # Check service status
railway logs      # View logs
railway metrics   # View usage metrics
```

### Render
- View logs in dashboard
- Check metrics tab
- Set up alerts

### Fly.io
```bash
flyctl status     # Check status
flyctl logs       # View logs
flyctl scale      # Scale resources
```

---

## 🎯 Recommended Path

**For quick testing:**
→ Run locally with `python main.py`

**For continuous free hosting:**
→ Deploy to Render with `render.yaml`

**For production:**
→ Deploy to Railway with `./deploy-railway.sh`

**For enterprise:**
→ Deploy to Fly.io or Google Cloud

---

## 💡 Pro Tips

1. **Always start with paper trading** - Test thoroughly before using real money
2. **Monitor your first deployment** - Watch logs for the first hour
3. **Set up alerts** - Configure email notifications for errors
4. **Use version control** - Deploy from Git for easy rollbacks
5. **Regular backups** - Export trade history regularly

---

## 🆘 Need Help?

- Check logs first: `railway logs` or platform equivalent
- Review [HOSTING.md](./HOSTING.md) for detailed guides
- Check platform documentation
- Review Railway/Render/Fly.io status pages

---

## 🎉 Next Steps

After deployment:
1. ✅ Verify health endpoints
2. ✅ Test with small trades
3. ✅ Monitor for 24 hours
4. ✅ Set up alerts
5. ✅ Configure your trading strategy
6. ✅ Start trading!

**Happy Trading! 📈**
