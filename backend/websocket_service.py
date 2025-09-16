"""
Dedicated WebSocket service that subscribes to Redis and broadcasts to connected clients.
This service handles ONLY WebSocket connections and Redis message forwarding.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import logging
from typing import List
import threading
import redis

from redis_client import redis_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"📱 WebSocket connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"📱 WebSocket disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
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
                logger.warning(f"⚠️ Failed to send message to WebSocket client: {e}")
                disconnected.append(connection)

        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

        logger.info(f"📡 Broadcast successful to {successful_broadcasts}/{len(self.active_connections)} clients")

# Global WebSocket manager
manager = WebSocketManager()

def redis_subscriber():
    """Background thread that listens to Redis and forwards messages to WebSocket clients"""
    logger.info("🔊 Starting Redis subscriber thread...")

    try:
        pubsub = redis_client.subscribe_to_events()

        for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    logger.info(f"📨 Received Redis message: {data}")

                    # Schedule the broadcast in the event loop
                    asyncio.run_coroutine_threadsafe(
                        manager.broadcast(data),
                        loop
                    )

                except json.JSONDecodeError as e:
                    logger.error(f"❌ Invalid JSON in Redis message: {e}")
                except Exception as e:
                    logger.error(f"❌ Error processing Redis message: {e}")

    except Exception as e:
        logger.error(f"❌ Redis subscriber error: {e}")

# FastAPI app for WebSocket service
app = FastAPI(title="WebSocket Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    global loop
    loop = asyncio.get_event_loop()

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
    logger.info("📡 Incoming WebSocket connection...")
    await manager.connect(websocket)

    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            logger.info(f"📨 WebSocket message from client: {data}")

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
        logger.exception(f"🔥 Unhandled WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/health")
def health():
    return {"status": "healthy", "connections": len(manager.active_connections)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)