#!/bin/bash
set -e

echo "🚂 Railway Build Script Started"
echo "================================"

# Print environment info
echo "📋 Environment: ${RAILWAY_ENVIRONMENT:-development}"
echo "🐍 Python version: $(python --version)"
echo "📦 Node version: $(node --version)"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Build frontend
echo ""
echo "🎨 Building frontend..."
cd frontend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm ci --prefer-offline --no-audit

# Build production bundle
echo "🏗️ Building production bundle..."
npm run build

# Return to root
cd ..

echo ""
echo "✅ Build completed successfully!"
echo "================================"
