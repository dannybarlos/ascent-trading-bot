import os
import logging
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from alpaca_trade_api.rest import REST, TimeFrame, APIError

# Load .env from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# Logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')

# Credentials
ALPACA_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET = os.getenv("ALPACA_SECRET_KEY")
BASE_URL = os.getenv("APCA_API_BASE_URL", "https://paper-api.alpaca.markets")

# REST client
try:
    alpaca = REST(ALPACA_KEY, ALPACA_SECRET, BASE_URL)
    logger.info("✅ Alpaca client initialized.")
except Exception as e:
    logger.error("❌ Failed to initialize Alpaca client: %s", e)
    raise

def get_account():
    try:
        return alpaca.get_account()
    except APIError as e:
        logger.error("Error fetching account: %s", e)
        return None

def get_positions():
    try:
        positions = alpaca.list_positions()
        logger.info("Retrieved %d open positions.", len(positions))
        return [p._raw for p in positions]
    except APIError as e:
        logger.error("Error fetching positions: %s", e)
        return []

def get_activities(limit=20):
    try:
        acts = alpaca.get_activities()
        logger.info("Retrieved %d activity records.", len(acts))
        return [a._raw for a in acts[:limit]]
    except APIError as e:
        logger.error("Error fetching activities: %s", e)
        return []

def get_recent_bars(symbol: str, market_type: str = "stock", days: int = 10, limit: int = 5):
    now = datetime.now(timezone.utc)
    past = now - timedelta(days=days)
    start_str = past.isoformat(timespec="seconds").replace("+00:00", "Z")
    end_str = now.isoformat(timespec="seconds").replace("+00:00", "Z")

    try:
        if market_type == "crypto":
            bars = alpaca.get_crypto_bars(symbol, TimeFrame.Day, start=start_str, end=end_str).df
        else:
            bars = alpaca.get_bars(symbol, TimeFrame.Day, start=start_str, end=end_str, feed="iex").df

        if bars.empty:
            logger.warning(f"No {market_type} bar data for {symbol}")
            return []

        logger.info(f"Retrieved {len(bars)} {market_type} bars for {symbol}")
        return bars.tail(limit).to_dict("records")
    except APIError as e:
        logger.error("Error fetching bars for %s (%s): %s", symbol, market_type, e)
        return []

def submit_market_order(symbol: str, qty: float, side: str = "buy", market_type: str = "stock"):
    try:
        logger.info(f"Submitting {side.upper()} {market_type.upper()} order: {qty} {symbol}")
        order = alpaca.submit_order(
            symbol=symbol,
            qty=qty,
            side=side,
            type="market",
            time_in_force="gtc"
        )
        return order._raw
    except APIError as e:
        logger.error("Failed to submit %s order for %s: %s", side, symbol, e)
        return None
    
def validate_connection():
    account = get_account()
    if account:
        return {
            "status": "success",
            "account_id": account.id,
            "buying_power": account.buying_power,
            "crypto_status": account.crypto_status
        }
    return {
        "status": "error",
        "message": "Account not found or API error"
    }