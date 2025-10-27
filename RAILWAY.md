# Ascent Trading Bot - Railway Deployment

## Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YOUR_TEMPLATE_ID)

## Services Architecture

This Railway template deploys:
1. **Backend API** - FastAPI with Uvicorn workers
2. **WebSocket Service** - Dedicated WebSocket server on port 8001
3. **Redis** - For pub/sub messaging between services
4. **Frontend** - Static files served by the backend

## Automatic Setup

Railway will automatically:
- ✅ Build frontend assets
- ✅ Install Python dependencies
- ✅ Set up Redis instance
- ✅ Configure environment variables
- ✅ Start all services
- ✅ Enable health checks
- ✅ Set up custom domain (optional)

## Environment Variables

The following environment variables will be automatically set by Railway:

### Required (Auto-configured by Railway)
- `PORT` - Service port (auto)
- `REDIS_URL` - Redis connection string (auto)
- `RAILWAY_ENVIRONMENT` - Environment name (auto)

### Required (You must set)
- `ALPACA_API_KEY` - Your Alpaca API key
- `ALPACA_SECRET_KEY` - Your Alpaca secret key
- `ALPACA_BASE_URL` - Either:
  - Paper: `https://paper-api.alpaca.markets`
  - Live: `https://api.alpaca.markets`

### Optional
- `LOG_LEVEL` - Set to `INFO` or `DEBUG` (default: `INFO`)
- `FRONTEND_URL` - Frontend URL for CORS (auto-detected)

## Manual Setup

If you prefer manual deployment:

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Add Redis Service**
   ```bash
   railway add --plugin redis
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set ALPACA_API_KEY=your_key_here
   railway variables set ALPACA_SECRET_KEY=your_secret_here
   railway variables set ALPACA_BASE_URL=https://paper-api.alpaca.markets
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Service URLs

After deployment, you'll have:
- **Frontend**: `https://your-service.up.railway.app`
- **API**: `https://your-service.up.railway.app/api`
- **WebSocket**: `wss://your-service.up.railway.app/ws` (proxied through backend)
- **Health Check**: `https://your-service.up.railway.app/api/health`

## Health Monitoring

Railway automatically monitors:
- HTTP health check on `/api/health`
- Service restarts on failures
- Resource usage metrics

## Scaling

To scale your deployment:
- **Vertical**: Upgrade Railway plan for more resources
- **Horizontal**: Use Railway's replica feature (Pro plan)

## Troubleshooting

### Check Logs
```bash
railway logs
```

### Check Environment
```bash
railway variables
```

### Restart Service
```bash
railway restart
```

## Cost Estimate

- **Free Tier**: $0/month (500 hours)
- **Hobby Plan**: $5/month (includes $5 credit)
- **Pro Plan**: $20/month (includes $20 credit)

This app typically uses:
- ~200MB RAM
- ~0.1 vCPU
- Estimated cost: **$2-5/month** on Hobby plan
