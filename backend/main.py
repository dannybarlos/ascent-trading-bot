from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from contextlib import asynccontextmanager
import os

from database import SessionLocal, engine
from models import Base, ExecutedTrade, BotControl, StrategyControl, StrategyPerformance
# Note: WebSocket handling moved to separate websocket_service.py
from strategy_registry import get_strategy
from scheduler import bot
from alpaca_client import validate_connection, get_account, get_positions, get_activities, submit_market_order

import logging

# ---------- Setup ----------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
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
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    # Mount assets directory at root for Vite-generated paths
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        logger.info(f"📁 Serving assets from {assets_dir}")

    # Mount static directory
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"📁 Serving static files from {static_dir}")

# ---------- API Routes ----------

@app.get("/api/health")
def health():
    return {"message": "API is running"}

@app.get("/api/account")
def account():
    acc = get_account()
    if acc:
        return acc
    return JSONResponse(status_code=500, content={"error": "Failed to fetch account info"})

@app.get("/api/positions")
def positions():
    return get_positions()

@app.get("/api/activities")
def activities():
    return get_activities()

@app.get("/api/validate-alpaca")
def validate_alpaca():
    return validate_connection()

@app.get("/api/status")
def get_bot_status():
    return {"status": bot.status}

# ---------- Bot Control Endpoints ----------
@app.post("/api/strategy")
def change_strategy(data: dict):
    strategy_name = data.get("strategy")
    if strategy_name:
        bot.set_strategy(strategy_name)

        # Publish strategy change to Redis
        from redis_client import redis_client
        redis_client.publish_strategy_change(strategy_name)

        return {"success": True, "strategy": strategy_name}
    return {"success": False, "error": "Missing strategy name"}

@app.post("/api/toggle")
def toggle_bot():
    bot.toggle()

    # Publish status change to Redis
    from redis_client import redis_client
    redis_client.publish_status(bot.status)

    return {"success": True, "status": bot.status}

@app.post("/api/execute_trade")
def execute_test_trade(data: dict):
    """Execute a manual test trade"""
    symbol = data.get("symbol", "AAPL")
    action = data.get("action", "buy")
    qty = data.get("qty", 1)

    try:
        from datetime import datetime

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
                from alpaca_client import get_recent_bars
                bars = get_recent_bars(symbol, limit=1)
                price = float(bars[0]["close"]) if bars else 100.0  # Default fallback
            except:
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
            account = get_account()
            performance = StrategyPerformance(
                strategy="Manual Test",
                portfolio_value=float(account._raw.get("cash", 0))
            )
            db.add(performance)
            db.commit()

            # Publish trade to Redis for WebSocket broadcast
            from redis_client import redis_client
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

    except Exception as e:
        logger.error(f"❌ Manual trade execution failed: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/trades")
def get_recent_trades():
    """Get recent trades from database"""
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
    except Exception as e:
        logger.error(f"❌ Failed to fetch trades: {e}")
        return {"error": str(e)}
    finally:
        db.close()

# ---------- SPA Fallback ----------

@app.get("/{path:path}")
async def spa_fallback(request: Request, path: str):
    """Serve the React SPA for all non-API routes"""
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    index_file = os.path.join(static_dir, "index.html")

    # If the static directory and index.html exist, serve the SPA
    if os.path.exists(index_file):
        return FileResponse(index_file)

    # Fallback for development when static files don't exist yet
    return {"message": "Frontend not built yet. Run the build process to generate static files."}
