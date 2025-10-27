#!/bin/bash

# One-Click Railway Deployment Script
# Run this script to deploy to Railway with minimal configuration

set -e

echo "🚂 Ascent Trading Bot - Railway Deployment"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo ""
    echo "📦 Installing Railway CLI..."

    # Install Railway CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install railway
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://railway.app/install.sh | sh
    else
        echo "Please install Railway CLI manually:"
        echo "https://docs.railway.app/develop/cli#installation"
        exit 1
    fi
fi

echo "✅ Railway CLI installed"
echo ""

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize project
echo ""
echo "📦 Initializing Railway project..."
railway init

# Link to project
echo ""
echo "🔗 Linking to Railway project..."
railway link

# Add Redis plugin
echo ""
echo "💾 Adding Redis plugin..."
railway add --plugin redis

# Set environment variables
echo ""
echo "🔧 Setting up environment variables..."
echo ""
echo "Please enter your Alpaca API credentials:"
echo ""

read -p "Alpaca API Key: " ALPACA_API_KEY
read -p "Alpaca Secret Key: " ALPACA_SECRET_KEY

echo ""
echo "Choose trading mode:"
echo "  1) Paper Trading (Recommended for testing)"
echo "  2) Live Trading (Real money - use with caution!)"
read -p "Enter choice (1 or 2): " TRADING_MODE

if [ "$TRADING_MODE" == "2" ]; then
    ALPACA_BASE_URL="https://api.alpaca.markets"
    echo "⚠️  WARNING: You selected LIVE TRADING with real money!"
else
    ALPACA_BASE_URL="https://paper-api.alpaca.markets"
    echo "✅ Using paper trading (safe mode)"
fi

echo ""
echo "📝 Setting environment variables..."

railway variables set ALPACA_API_KEY="$ALPACA_API_KEY"
railway variables set ALPACA_SECRET_KEY="$ALPACA_SECRET_KEY"
railway variables set ALPACA_BASE_URL="$ALPACA_BASE_URL"
railway variables set LOG_LEVEL="INFO"
railway variables set WORKERS="2"

echo "✅ Environment variables configured"

# Deploy
echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 View your deployment:"
railway open
echo ""
echo "📝 View logs:"
echo "   railway logs"
echo ""
echo "🔧 Manage environment variables:"
echo "   railway variables"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://[your-project].up.railway.app"
echo ""
echo "⏳ Note: Initial deployment may take 2-3 minutes to build."
echo ""
