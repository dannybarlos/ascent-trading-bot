"""Trading bot scheduler with strategy execution."""
import logging
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler

from core.clients.alpaca_trading_client import get_recent_bars, submit_market_order, get_account
from services.trading.strategy_manager import get_strategy
from core.database.database_manager import SessionLocal
from core.database.trading_models import ExecutedTrade, StrategyPerformance, BotControl
from core.clients.redis_messaging_client import redis_client

logger = logging.getLogger(__name__)

class TradingBot:
    """Trading bot that executes strategies on a schedule."""
    def __init__(self):
        """Initialize the trading bot."""
        self.running = True  # Default state
        self.strategy = get_strategy("momentum")
        self._load_state()

    def _load_state(self):
        """Load bot running state from database."""
        db = SessionLocal()
        try:
            bot_control = db.query(BotControl).first()
            if bot_control is None:
                # Create initial record if none exists
                bot_control = BotControl(is_running=True)
                db.add(bot_control)
                db.commit()
                self.running = True
            else:
                self.running = bot_control.is_running
            logger.info(
                "🔄 Loaded bot state from database: %s",
                'Running' if self.running else 'Paused'
            )
        except Exception as e:
            logger.error("❌ Failed to load bot state from database: %s", e)
            self.running = True  # Default to running if database fails
        finally:
            db.close()

    def _save_state(self):
        """Save bot running state to database."""
        db = SessionLocal()
        try:
            bot_control = db.query(BotControl).first()
            if bot_control is None:
                bot_control = BotControl(is_running=self.running)
                db.add(bot_control)
            else:
                bot_control.is_running = self.running
            db.commit()
            logger.info(
                "💾 Saved bot state to database: %s",
                'Running' if self.running else 'Paused'
            )
        except Exception as e:
            logger.error("❌ Failed to save bot state to database: %s", e)
        finally:
            db.close()

    def toggle(self):
        """Toggle bot running state."""
        self.running = not self.running
        self._save_state()

    def set_strategy(self, name):
        """Set the trading strategy."""
        self.strategy = get_strategy(name)

    @property
    def status(self):
        """Get the current bot status as a string."""
        return "Running" if self.running else "Paused"

bot = TradingBot()

# Top 10 S&P 500 stocks by market cap (as of 2024)
TOP_SP500_SYMBOLS = [
    "AAPL",  # Apple Inc.
    "MSFT",  # Microsoft Corporation
    "GOOGL", # Alphabet Inc. Class A
    "AMZN",  # Amazon.com Inc.
    "NVDA",  # NVIDIA Corporation
    "TSLA",  # Tesla Inc.
    "META",  # Meta Platforms Inc.
    "BRK.B", # Berkshire Hathaway Inc. Class B
    "UNH",   # UnitedHealth Group Inc.
    "JNJ"    # Johnson & Johnson
]

def run_trading_job():
    """Execute a trading job for multiple symbols."""
    logger.info("🔄 Running trading job - Bot status: %s", bot.status)

    if not bot.running:
        logger.info("⏸️ Bot is paused, skipping trading job")
        return

    db = SessionLocal()
    try:
        strategy_name = bot.strategy.__class__.__name__
        logger.info("🧠 Using strategy: %s", strategy_name)

        # Iterate through all top S&P 500 symbols
        for symbol in TOP_SP500_SYMBOLS:
            try:
                logger.info("📊 Fetching bars for %s", symbol)
                bars = get_recent_bars(symbol)

                logger.info("🧠 Evaluating %s strategy for %s", strategy_name, symbol)
                signal = bot.strategy.evaluate(bars)
                logger.info("📈 %s evaluation result: %s", symbol, signal)

                if signal in ["buy", "sell"]:
                    logger.info("💰 Executing %s order for %s", signal.upper(), symbol)
                    order = submit_market_order(symbol, 1, side=signal)
                    price = float(order.get("filled_avg_price", 0))

                    # Store trade in database
                    trade = ExecutedTrade(
                        symbol=symbol,
                        action=signal,
                        price=price,
                        qty=1,
                        signal=signal,
                        strategy=strategy_name
                    )
                    db.add(trade)

                    logger.info(
                        "✅ Trade executed and stored: %s %s @ $%s", signal.upper(), symbol, price
                    )

                    # Publish trade to Redis for WebSocket service to broadcast
                    redis_client.publish_trade(
                        symbol=symbol,
                        action=signal,
                        price=price,
                        timestamp=datetime.now().isoformat(),
                        strategy=strategy_name
                    )
                else:
                    logger.info("🔍 No trading signal for %s", symbol)

            except Exception as e:
                logger.error("❌ Error processing %s: %s", symbol, e)
                continue  # Continue with next symbol if one fails

        # Update strategy performance after processing all symbols
        try:
            account = get_account()
            performance = StrategyPerformance(
                strategy=strategy_name,
                portfolio_value=float(getattr(account, '_raw', {}).get("cash", 0))
            )
            db.add(performance)
            db.commit()
            logger.info("📊 Updated strategy performance for %s", strategy_name)
        except Exception as e:
            logger.error("❌ Failed to update strategy performance: %s", e)

    except Exception as e:
        logger.exception("❌ Trading job error: %s", e)

    finally:
        db.close()

def start_scheduler():
    """Start the background scheduler."""
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_trading_job, "interval", minutes=5)
    scheduler.start()
