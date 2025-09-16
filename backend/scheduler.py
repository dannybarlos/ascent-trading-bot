from apscheduler.schedulers.background import BackgroundScheduler
from alpaca_client import get_recent_bars, submit_market_order, get_account
from strategy_registry import get_strategy
from database import SessionLocal
from models import ExecutedTrade, StrategyPerformance, BotControl
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TradingBot:
    def __init__(self):
        self.strategy = get_strategy("sma_crossover")
        self._load_state()

    def _load_state(self):
        """Load bot running state from database"""
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
            logger.info(f"🔄 Loaded bot state from database: {'Running' if self.running else 'Paused'}")
        except Exception as e:
            logger.error(f"❌ Failed to load bot state from database: {e}")
            self.running = True  # Default to running if database fails
        finally:
            db.close()

    def _save_state(self):
        """Save bot running state to database"""
        db = SessionLocal()
        try:
            bot_control = db.query(BotControl).first()
            if bot_control is None:
                bot_control = BotControl(is_running=self.running)
                db.add(bot_control)
            else:
                bot_control.is_running = self.running
            db.commit()
            logger.info(f"💾 Saved bot state to database: {'Running' if self.running else 'Paused'}")
        except Exception as e:
            logger.error(f"❌ Failed to save bot state to database: {e}")
        finally:
            db.close()

    def toggle(self):
        self.running = not self.running
        self._save_state()

    def set_strategy(self, name):
        self.strategy = get_strategy(name)

    @property
    def status(self):
        return "Running" if self.running else "Paused"

bot = TradingBot()

def run_trading_job():
    logger.info(f"🔄 Running trading job - Bot status: {bot.status}")

    if not bot.running:
        logger.info("⏸️ Bot is paused, skipping trading job")
        return

    db = SessionLocal()
    try:
        symbol = "AAPL"
        logger.info(f"📊 Fetching bars for {symbol}")
        bars = get_recent_bars(symbol)

        logger.info(f"🧠 Evaluating strategy: {bot.strategy.__class__.__name__}")
        signal = bot.strategy.evaluate(bars)
        logger.info(f"📈 Strategy evaluation result: {signal}")

        if signal in ["buy", "sell"]:
            logger.info(f"💰 Executing {signal.upper()} order for {symbol}")
            order = submit_market_order(symbol, 1, side=signal)
            price = float(order.get("filled_avg_price", 0))

            # Store trade in database
            trade = ExecutedTrade(
                symbol=symbol,
                action=signal,
                price=price,
                qty=1,
                signal=signal,
                strategy=bot.strategy.__class__.__name__
            )
            db.add(trade)

            # Update strategy performance
            account = get_account()
            performance = StrategyPerformance(
                strategy=bot.strategy.__class__.__name__,
                portfolio_value=float(account.cash)
            )
            db.add(performance)
            db.commit()

            logger.info(f"✅ Trade executed and stored: {signal.upper()} {symbol} @ ${price}")

            # Publish trade to Redis for WebSocket service to broadcast
            logger.info(f"📡 Publishing trade update to Redis")

            from redis_client import redis_client
            redis_client.publish_trade(
                symbol=symbol,
                action=signal,
                price=price,
                timestamp=datetime.now().isoformat(),
                strategy=bot.strategy.__class__.__name__
            )
        else:
            logger.info("🔍 No trading signal generated")

    except Exception as e:
        logger.exception(f"❌ Trading job error: {e}")

    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_trading_job, "interval", minutes=5)
    scheduler.start()
