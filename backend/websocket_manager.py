from fastapi import WebSocket
from typing import List
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
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

        # Validate message is JSON serializable
        try:
            json.dumps(message)
        except (TypeError, ValueError) as e:
            logger.error(f"❌ Message not JSON serializable: {e}")
            return

        disconnected = []
        successful_broadcasts = 0

        for conn in self.active_connections:
            try:
                await conn.send_json(message)
                successful_broadcasts += 1
            except Exception as e:
                logger.warning(f"⚠️ Failed to send message to WebSocket client: {e}")
                disconnected.append(conn)

        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

        logger.info(f"📡 Broadcast successful to {successful_broadcasts}/{len(self.active_connections)} clients")

manager = ConnectionManager()
