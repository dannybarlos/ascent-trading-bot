"""Main FastAPI application for the trading bot API service."""
import os
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from core.database.database_manager import SessionLocal, engine
from core.clients.alpaca_trading_client import (
    validate_connection, get_account, get_positions, get_activities,
    submit_market_order, get_recent_bars
)
from core.clients.redis_messaging_client import redis_client
from core.database.trading_models import Base, ExecutedTrade, StrategyPerformance
from services.trading.trading_engine import bot

# ---------- Setup ----------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(_: FastAPI):
    """Application lifespan management."""
    logger.info("🚀 Starting web services...")
    # Note: Scheduler runs in separate service
    yield
    logger.info("🧹 Shutting down web services...")

app = FastAPI(lifespan=lifespan)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Static Files ----------

# Check if static directory exists
STATIC_DIR = "/workspace/static"
if os.path.exists(STATIC_DIR):
    # Mount assets directory at root for Vite-generated paths
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        logger.info("📁 Serving assets from %s", assets_dir)

    # Mount static directory
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    logger.info("📁 Serving static files from %s", STATIC_DIR)

# ---------- API Routes ----------

@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {"message": "API is running"}

@app.get("/api/account")
def account():
    """Get account information."""
    acc = get_account()
    if acc:
        return acc
    return JSONResponse(status_code=500, content={"error": "Failed to fetch account info"})

@app.get("/api/positions")
def positions():
    """Get current positions."""
    return get_positions()

@app.get("/api/activities")
def activities():
    """Get recent activities."""
    return get_activities()

@app.get("/api/validate-alpaca")
def validate_alpaca():
    """Validate Alpaca connection."""
    return validate_connection()

@app.get("/api/status")
def get_bot_status():
    """Get bot status."""
    return {"status": bot.status}

# ---------- Bot Control Endpoints ----------
@app.post("/api/strategy")
def change_strategy(data: dict):
    """Change trading strategy."""
    strategy_name = data.get("strategy")
    if strategy_name:
        bot.set_strategy(strategy_name)

        # Publish strategy change to Redis
        redis_client.publish_strategy_change(strategy_name)

        return {"success": True, "strategy": strategy_name}
    return {"success": False, "error": "Missing strategy name"}

@app.post("/api/toggle")
def toggle_bot():
    """Toggle bot running state."""
    bot.toggle()

    # Publish status change to Redis
    redis_client.publish_status(bot.status)

    return {"success": True, "status": bot.status}

@app.post("/api/execute_trade")
def execute_test_trade(data: dict):
    """Execute a manual test trade"""
    symbol = data.get("symbol", "AAPL")
    action = data.get("action", "buy")
    qty = data.get("qty", 1)

    try:
        # Execute trade via Alpaca
        order = submit_market_order(symbol, qty, side=action)

        # Handle unfilled orders in paper trading
        if order and order.get("filled_avg_price"):
            price = float(order.get("filled_avg_price"))
        elif order and order.get("limit_price"):
            price = float(order.get("limit_price"))
        else:
            # Fallback to current market price if order not filled yet
            try:
                bars = get_recent_bars(symbol, limit=1)
                price = float(bars[0]["close"]) if bars else 100.0  # Default fallback
            except (KeyError, ValueError, IndexError):  # More specific exceptions
                price = 100.0  # Final fallback price

        # Store trade in database
        db = SessionLocal()
        try:
            trade = ExecutedTrade(
                symbol=symbol,
                action=action,
                price=price,
                qty=qty,
                signal=action,
                strategy="Manual Test"
            )
            db.add(trade)

            # Update strategy performance
            acc = get_account()
            if acc:
                portfolio_value = float(getattr(acc, '_raw', {}).get("cash", 0))
            else:
                portfolio_value = 0.0
            performance = StrategyPerformance(
                strategy="Manual Test",
                portfolio_value=portfolio_value
            )
            db.add(performance)
            db.commit()

            # Publish trade to Redis for WebSocket broadcast
            redis_client.publish_trade(
                symbol=symbol,
                action=action,
                price=price,
                timestamp=datetime.now().isoformat(),
                strategy="Manual Test"
            )

            return {
                "success": True,
                "trade": {
                    "symbol": symbol,
                    "action": action,
                    "price": price,
                    "qty": qty,
                    "strategy": "Manual Test"
                }
            }

        finally:
            db.close()

    except (ValueError, KeyError, ConnectionError) as e:
        logger.error("❌ Manual trade execution failed: %s", e)
        return {"success": False, "error": str(e)}

@app.get("/api/trades")
def get_recent_trades():
    """Get recent trades from database."""
    db = SessionLocal()
    try:
        trades = db.query(ExecutedTrade).order_by(ExecutedTrade.created_at.desc()).limit(10).all()
        return [
            {
                "id": trade.id,
                "symbol": trade.symbol,
                "action": trade.action,
                "price": trade.price,
                "qty": trade.qty,
                "strategy": trade.strategy,
                "created_at": trade.created_at.isoformat() if trade.created_at else None
            }
            for trade in trades
        ]
    except (ValueError, AttributeError) as e:
        logger.error("❌ Failed to fetch trades: %s", e)
        return {"error": str(e)}
    finally:
        db.close()

# ---------- SPA Fallback ----------

@app.get("/")
async def root():
    """Serve the React SPA for root route."""
    # Static files are mounted at /workspace/static in container
    index_file = os.path.join(STATIC_DIR, "index.html")

    # If the static directory and index.html exist, serve the SPA
    if os.path.exists(index_file):
        return FileResponse(index_file)

    # Fallback for development when static files don't exist yet
    return {
        "message": "Frontend not built yet. Run the build process to generate static files."
    }

@app.get("/{path:path}")
async def spa_fallback():
    """Serve the React SPA for all non-API routes."""
    # Static files are mounted at /workspace/static in container
    index_file = os.path.join(STATIC_DIR, "index.html")

    # If the static directory and index.html exist, serve the SPA
    if os.path.exists(index_file):
        return FileResponse(index_file)

    # Fallback for development when static files don't exist yet
    return {
        "message": "Frontend not built yet. Run the build process to generate static files."
    }
