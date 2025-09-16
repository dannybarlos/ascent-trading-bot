# Ascent Trading Bot

A full-stack algorithmic trading application built with React, FastAPI, and Docker. Features real-time WebSocket updates, multiple trading strategies, and a microservices architecture.

## 🏗️ Architecture

- **API Service**: FastAPI REST endpoints and static file serving
- **WebSocket Service**: Real-time client communication
- **Trading Service**: Background strategy execution with APScheduler
- **Redis**: Inter-service messaging and pub/sub
- **SQLite**: Trade and bot state persistence

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Alpaca Trading Account (free paper trading available)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ascent-trading
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Alpaca API credentials:
   ```bash
   # Get these from https://alpaca.markets/
   ALPACA_API_KEY=your_api_key_here
   ALPACA_SECRET_KEY=your_secret_key_here
   APCA_API_BASE_URL=https://paper-api.alpaca.markets
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the dashboard**
   - Frontend: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - WebSocket: ws://localhost:8001/ws

## 📊 Trading Strategies

The application includes several built-in strategies:

- **RSI Strategy**: Relative Strength Index based trading
- **SMA Crossover**: Simple Moving Average crossover signals
- **Momentum Strategy**: Price momentum detection
- **Breakout Strategy**: Support/resistance level breakouts

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing

Manual trade execution for testing:
```bash
curl -X POST http://localhost:8000/api/execute_trade \\
  -H "Content-Type: application/json" \\
  -d '{"symbol": "AAPL", "action": "buy", "qty": 1}'
```

## 🔒 Security

- **Never commit API keys**: Use environment variables only
- **Paper trading**: Start with paper trading before using real money
- **Environment isolation**: Keep production and development environments separate

## 📚 API Endpoints

- `GET /api/account` - Account information
- `GET /api/positions` - Current positions
- `GET /api/activities` - Recent activities
- `POST /api/toggle` - Start/stop bot
- `POST /api/strategy` - Change strategy
- `POST /api/execute_trade` - Manual trade execution
- `GET /api/trades` - Recent trades from database

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Disconnections**: If WebSocket connects then disconnects immediately (~300ms)
   ```bash
   # Check WebSocket service logs
   docker-compose logs websocket
   # Restart with rebuild
   docker-compose up --build
   ```

2. **API Key Issues**: Verify credentials in `.env` file
   ```bash
   # Check environment variables are loaded
   docker-compose exec api env | grep ALPACA
   ```

3. **"Method Not Allowed" on API calls**: Code changes not reflected in containers
   ```bash
   docker-compose up --build  # Rebuild containers
   ```

4. **Frontend shows NaN/UNKNOWN values**: API response parsing issues
   - Check that components access `account._raw.property` instead of `account.property`

5. **Port Conflicts**: Ensure ports 8000, 8001, 6379 are available
   ```bash
   netstat -an | findstr "8000\|8001\|6379"  # Windows
   lsof -i :8000,:8001,:6379                 # macOS/Linux
   ```

6. **Database issues**: Reset database and volumes
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### Quick Diagnosis

```bash
# Check all service logs
docker-compose logs

# Test API connectivity
curl http://localhost:8000/api/health

# Test WebSocket (requires wscat: npm install -g wscat)
wscat -c ws://localhost:8001/ws

# Test manual trade
curl -X POST http://localhost:8000/api/execute_trade \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "action": "buy", "qty": 1}'
```

### Service-Specific Logs
```bash
docker-compose logs api        # API service logs
docker-compose logs websocket  # WebSocket service logs
docker-compose logs trader     # Trading service logs
docker-compose logs redis      # Redis service logs
```

## 📄 License

This project is for educational purposes. Use at your own risk when trading with real money.

## ⚠️ Disclaimer

This software is provided as-is for educational and research purposes only. Trading involves significant financial risk. The authors are not responsible for any financial losses incurred through the use of this software.