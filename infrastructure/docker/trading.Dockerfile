# Trading Bot Service - Strategy execution
FROM python:3.11-slim

WORKDIR /workspace

# Install Python dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy reorganized code
COPY core/ ./core/
COPY services/ ./services/

# Create shared directory
RUN mkdir -p shared && chmod -R 755 shared

# Start the trading service
CMD ["python", "-c", "from services.trading.trading_engine import start_scheduler; start_scheduler(); import time; time.sleep(999999)"]