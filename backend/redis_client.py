"""
Redis client for pub/sub messaging between services.
"""

import redis
import json
import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis = redis.from_url(redis_url, decode_responses=True)
        logger.info(f"📡 Redis client initialized: {redis_url}")

    def publish_trade(self, symbol: str, action: str, price: float, timestamp: str, strategy: str) -> bool:
        """Publish a trade message to Redis"""
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
            logger.info(f"📡 Published trade to Redis: {message} (subscribers: {result})")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to publish trade to Redis: {e}")
            return False

    def publish_status(self, status: str) -> bool:
        """Publish a bot status change to Redis"""
        try:
            message = {
                "type": "status",
                "status": status,
                "timestamp": datetime.now().isoformat()
            }

            result = self.redis.publish("trading_events", json.dumps(message))
            logger.info(f"📡 Published status to Redis: {message} (subscribers: {result})")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to publish status to Redis: {e}")
            return False

    def publish_strategy_change(self, strategy: str) -> bool:
        """Publish a strategy change to Redis"""
        try:
            message = {
                "type": "strategy_change",
                "strategy": strategy,
                "timestamp": datetime.now().isoformat()
            }

            result = self.redis.publish("trading_events", json.dumps(message))
            logger.info(f"📡 Published strategy change to Redis: {message} (subscribers: {result})")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to publish strategy change to Redis: {e}")
            return False

    def subscribe_to_events(self):
        """Subscribe to trading events channel"""
        pubsub = self.redis.pubsub()
        pubsub.subscribe("trading_events")
        logger.info("🔊 Subscribed to trading_events channel")
        return pubsub

    def ping(self) -> bool:
        """Test Redis connection"""
        try:
            return self.redis.ping()
        except Exception as e:
            logger.error(f"❌ Redis ping failed: {e}")
            return False

# Global Redis client instance
redis_client = RedisClient()