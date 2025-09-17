# API Service - HTTP routes and static files
FROM node:20-alpine AS frontend-builder

# Build frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/src ./src
COPY frontend/index.html frontend/tsconfig.json frontend/vite.config.js ./
RUN npm run build

# Backend stage
FROM python:3.11-slim

WORKDIR /workspace

# Install Python dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy reorganized code
COPY core/ ./core/
COPY services/ ./services/

# Copy built frontend into backend static directory
COPY --from=frontend-builder /frontend/dist ./static

# Create shared directory and ensure proper permissions
RUN mkdir -p shared static && chmod -R 755 shared static

# Expose port
EXPOSE 8000

# Start the API service (no scheduler, no websocket)
CMD ["uvicorn", "services.api.api_server:app", "--host", "0.0.0.0", "--port", "8000"]