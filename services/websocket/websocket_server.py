"""
Dedicated WebSocket service that subscribes to Redis and broadcasts to connected clients.
This service handles ONLY WebSocket connections and Redis message forwarding.
"""

import asyncio
import json
import logging
import threading
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from core.clients.redis_messaging_client import redis_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections and broadcasting."""
    def __init__(self):
        """Initialize the WebSocket manager."""
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            "📱 WebSocket connected. Active connections: %d", len(self.active_connections)
        )

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(
                "📱 WebSocket disconnected. Active connections: %d",
                len(self.active_connections)
            )

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected WebSocket clients."""
        if not self.active_connections:
            logger.warning("📡 No active WebSocket connections to broadcast to")
            return

        disconnected = []
        successful_broadcasts = 0

        for connection in self.active_connections:
            try:
                await connection.send_json(message)
                successful_broadcasts += 1
            except Exception as e:
                logger.warning(
                    "⚠️ Failed to send message to WebSocket client: %s", e
                )
                disconnected.append(connection)

        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

        logger.info(
            "📡 Broadcast successful to %d/%d clients",
            successful_broadcasts, len(self.active_connections) + len(disconnected)
        )

# Global WebSocket manager
manager = WebSocketManager()

def redis_subscriber():
    """Background thread that listens to Redis and forwards messages to WebSocket clients."""
    logger.info("🔊 Starting Redis subscriber thread...")

    try:
        pubsub = redis_client.subscribe_to_events()

        for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    logger.info("📨 Received Redis message: %s", data)

                    # Schedule the broadcast in the event loop
                    asyncio.run_coroutine_threadsafe(
                        manager.broadcast(data),
                        LOOP
                    )

                except json.JSONDecodeError as e:
                    logger.error("❌ Invalid JSON in Redis message: %s", e)
                except Exception as e:
                    logger.error("❌ Error processing Redis message: %s", e)

    except Exception as e:
        logger.error("❌ Redis subscriber error: %s", e)

# FastAPI app for WebSocket service
app = FastAPI(title="WebSocket Service")

# Global event loop variable
LOOP = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Application startup event handler."""
    global LOOP  # pylint: disable=global-statement
    LOOP = asyncio.get_event_loop()

    # Test Redis connection
    if redis_client.ping():
        logger.info("✅ Redis connection successful")
    else:
        logger.error("❌ Redis connection failed")
        return

    # Start Redis subscriber in background thread
    subscriber_thread = threading.Thread(target=redis_subscriber, daemon=True)
    subscriber_thread.start()
    logger.info("🚀 WebSocket service started")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication."""
    logger.info("📡 Incoming WebSocket connection...")
    await manager.connect(websocket)

    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            logger.info("📨 WebSocket message from client: %s", data)

            # Forward client messages to Redis if needed
            try:
                message = json.loads(data)
                message_type = message.get("type")

                if message_type == "strategy_change":
                    strategy = message.get("strategy")
                    if strategy:
                        redis_client.publish_strategy_change(strategy)

                elif message_type == "status_toggle":
                    # This would be handled by the main API service
                    logger.info("Status toggle received - forwarding to main API")

            except json.JSONDecodeError:
                logger.warning("⚠️ Received invalid JSON from WebSocket client")

    except WebSocketDisconnect:
        logger.info("❌ WebSocket disconnected normally")
        manager.disconnect(websocket)
    except Exception as e:
        logger.exception("🔥 Unhandled WebSocket error: %s", e)
        manager.disconnect(websocket)

@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy", "connections": len(manager.active_connections)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
