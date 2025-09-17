"""
Redis client for pub/sub messaging between services.
"""

import json
import logging
import os
from datetime import datetime

import redis

logger = logging.getLogger(__name__)

class RedisClient:
    """Redis client for pub/sub messaging between services."""
    def __init__(self):
        """Initialize Redis client."""
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis = redis.from_url(redis_url, decode_responses=True)
        logger.info("📡 Redis client initialized: %s", redis_url)

    def publish_trade(
        self, symbol: str, action: str, price: float, timestamp: str, strategy: str
    ) -> bool:
        """Publish a trade message to Redis."""
        try:
            message = {
                "type": "trade",
                "symbol": symbol,
                "action": action,
                "price": price,
                "timestamp": timestamp,
                "strategy": strategy
            }

            result = self.redis.publish("trading_events", json.dumps(message))
            logger.info(
                "📡 Published trade to Redis: %s (subscribers: %d)", message, result
            )
            return True

        except Exception as e:
            logger.error("❌ Failed to publish trade to Redis: %s", e)
            return False

    def publish_status(self, status: str) -> bool:
        """Publish a bot status change to Redis."""
        try:
            message = {
                "type": "status",
                "status": status,
                "timestamp": datetime.now().isoformat()
            }

            result = self.redis.publish("trading_events", json.dumps(message))
            logger.info(
                "📡 Published status to Redis: %s (subscribers: %d)", message, result
            )
            return True

        except Exception as e:
            logger.error("❌ Failed to publish status to Redis: %s", e)
            return False

    def publish_strategy_change(self, strategy: str) -> bool:
        """Publish a strategy change to Redis."""
        try:
            message = {
                "type": "strategy_change",
                "strategy": strategy,
                "timestamp": datetime.now().isoformat()
            }

            result = self.redis.publish("trading_events", json.dumps(message))
            logger.info(
                "📡 Published strategy change to Redis: %s (subscribers: %d)", message, result
            )
            return True

        except Exception as e:
            logger.error("❌ Failed to publish strategy change to Redis: %s", e)
            return False

    def subscribe_to_events(self):
        """Subscribe to trading events channel."""
        pubsub = self.redis.pubsub()
        pubsub.subscribe("trading_events")
        logger.info("🔊 Subscribed to trading_events channel")
        return pubsub

    def ping(self) -> bool:
        """Test Redis connection."""
        try:
            return self.redis.ping()
        except Exception as e:
            logger.error("❌ Redis ping failed: %s", e)
            return False

# Global Redis client instance
redis_client = RedisClient()
