"""WebSocket connection manager for broadcasting messages."""
import json
import logging
from typing import List

from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and message broadcasting."""
    def __init__(self):
        """Initialize the connection manager."""
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Connect a new WebSocket."""
        self.active_connections.append(websocket)
        logger.info(
            "📱 WebSocket connected. Active connections: %d", len(self.active_connections)
        )

    def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(
                "📱 WebSocket disconnected. Active connections: %d",
                len(self.active_connections)
            )

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected WebSockets."""
        if not self.active_connections:
            logger.warning("📡 No active WebSocket connections to broadcast to")
            return

        # Validate message is JSON serializable
        try:
            json.dumps(message)
        except (TypeError, ValueError) as e:
            logger.error("❌ Message not JSON serializable: %s", e)
            return

        disconnected = []
        successful_broadcasts = 0

        for conn in self.active_connections:
            try:
                await conn.send_json(message)
                successful_broadcasts += 1
            except Exception as e:
                logger.warning(
                    "⚠️ Failed to send message to WebSocket client: %s", e
                )
                disconnected.append(conn)

        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

        logger.info(
            "📡 Broadcast successful to %d/%d clients",
            successful_broadcasts, len(self.active_connections)
        )

manager = ConnectionManager()
