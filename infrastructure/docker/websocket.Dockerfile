# WebSocket Service - Real-time connections
FROM python:3.11-slim

WORKDIR /workspace

# Install Python dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy reorganized code
COPY core/ ./core/
COPY services/ ./services/

# Expose port
EXPOSE 8001

# Start the WebSocket service
CMD ["python", "-m", "services.websocket.websocket_server"]