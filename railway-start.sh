#!/bin/bash
set -e

echo "🚀 Railway Start Script"
echo "======================"

# Set defaults for Railway environment
export PORT="${PORT:-8000}"
export HOST="${HOST:-0.0.0.0}"
export LOG_LEVEL="${LOG_LEVEL:-info}"

# Railway provides REDIS_URL automatically when Redis plugin is added
if [ -z "$REDIS_URL" ]; then
    echo "⚠️  WARNING: REDIS_URL not set. WebSocket notifications will not work."
    echo "   Add Redis plugin in Railway dashboard: railway add --plugin redis"
fi

# Check required environment variables
if [ -z "$ALPACA_API_KEY" ] || [ -z "$ALPACA_SECRET_KEY" ]; then
    echo "❌ ERROR: Alpaca credentials not set!"
    echo ""
    echo "Please set the following environment variables in Railway:"
    echo "  - ALPACA_API_KEY"
    echo "  - ALPACA_SECRET_KEY"
    echo "  - ALPACA_BASE_URL (optional, defaults to paper trading)"
    echo ""
    echo "Run: railway variables set ALPACA_API_KEY=your_key"
    exit 1
fi

echo ""
echo "✅ Environment variables configured"
echo "📍 Host: $HOST"
echo "🔌 Port: $PORT"
echo "📊 Log Level: $LOG_LEVEL"
echo "🔗 Redis: ${REDIS_URL:+Connected}"
echo "📈 Alpaca: ${ALPACA_BASE_URL:-https://paper-api.alpaca.markets}"
echo ""

# Start the application with multiple workers for better performance
# Railway recommends 2-4 workers for production
WORKERS="${WORKERS:-2}"

echo "🎯 Starting application with $WORKERS workers..."
echo "======================"
echo ""

# Use Uvicorn with multiple workers and the main FastAPI app
exec uvicorn main:app \
    --host "$HOST" \
    --port "$PORT" \
    --workers "$WORKERS" \
    --log-level "$LOG_LEVEL" \
    --access-log \
    --proxy-headers \
    --forwarded-allow-ips='*'
