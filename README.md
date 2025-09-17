# Ascent Trading Bot

A sophisticated microservices-based algorithmic trading bot built with FastAPI, React, and Docker. Features real-time WebSocket communication, multiple trading strategies, and comprehensive monitoring capabilities.

## 🏗️ Architecture

### Microservices Design
- **API Service** (`port 8000`): FastAPI REST endpoints, static file serving, and React SPA hosting
- **WebSocket Service** (`port 8001`): Real-time client communication and trade broadcasting
- **Trading Service**: Background strategy execution with APScheduler (5-minute intervals)
- **Redis** (`port 6379`): Inter-service messaging, pub/sub, and real-time updates
- **SQLite**: Trade history, bot state, and strategy performance persistence

### Service Communication
- **Redis Pub/Sub**: Real-time trade notifications between Trading → WebSocket → Frontend
- **Shared Database**: Persistent state management across container restarts
- **RESTful API**: Frontend ↔ API service communication
- **WebSocket**: Real-time updates for live dashboard experience

### Container Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Service   │    │ WebSocket Svc   │    │ Trading Service │
│   (port 8000)   │    │   (port 8001)   │    │  (background)   │
│                 │    │                 │    │                 │
│ • REST API      │    │ • Real-time     │    │ • Strategy exec │
│ • React SPA     │    │   updates       │    │ • Multi-symbol  │
│ • Static files  │    │ • Trade alerts  │    │ • Scheduling    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │      Redis Pub/Sub      │
                    │     (port 6379)         │
                    │                         │
                    │ • Trade notifications   │
                    │ • Strategy changes      │
                    │ • Status updates        │
                    └─────────────────────────┘
```

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
   cd infrastructure
   docker-compose up --build
   ```

4. **Access the dashboard**
   - Frontend: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - WebSocket: ws://localhost:8001/ws

## 📊 Trading Strategies

The application includes 4 comprehensive built-in strategies that automatically trade across the **top 10 S&P 500 stocks**:

- **RSI Strategy**: Uses 14-period RSI indicator (Buy when RSI < 30, Sell when RSI > 70)
- **Momentum Strategy**: 50-day vs 200-day moving average crossover strategy
- **Breakout Strategy**: 20-period support/resistance breakout detection
- **SMA Crossover**: Short-term (3-day) vs Long-term (5-day) moving average crossover

### Multi-Symbol Trading
The bot automatically monitors and trades:
- **AAPL** (Apple Inc.)
- **MSFT** (Microsoft Corporation)
- **GOOGL** (Alphabet Inc. Class A)
- **AMZN** (Amazon.com Inc.)
- **NVDA** (NVIDIA Corporation)
- **TSLA** (Tesla Inc.)
- **META** (Meta Platforms Inc.)
- **BRK.B** (Berkshire Hathaway Inc. Class B)
- **UNH** (UnitedHealth Group Inc.)
- **JNJ** (Johnson & Johnson)

**Execution Schedule**: Every 5 minutes, the bot evaluates all 10 symbols using the selected strategy and executes trades based on generated signals.

## 🎨 User Interface Features

### Dashboard Components
- **Bot Status**: Real-time bot running/paused status with toggle control
- **Strategy Selection**: Dynamic strategy switching between all 4 strategies
- **Open Positions**: Live portfolio positions with market values and P&L
- **Recent Trades**: Database-stored trade history with timestamps
- **Recent Activity**: Auto-refreshing Alpaca activity feed with manual refresh option

### Real-Time Updates
- **WebSocket Integration**: Live trade notifications and bot status updates
- **Auto-Refresh**: Activity feed refreshes every 30 seconds automatically
- **Manual Controls**: Immediate refresh buttons for positions and activities
- **Responsive Design**: Clean, professional interface with hover effects

### Trading Controls
- **Strategy Switching**: Real-time strategy changes apply to all 10 symbols
- **Bot Toggle**: Start/stop automated trading with persistent state
- **Manual Trading**: Execute test trades for any supported symbol
- **Performance Tracking**: Strategy performance metrics and portfolio monitoring

## 🛠️ Development

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt
cd frontend && npm install

# Run services individually
python -m services.api.api_server                    # API on :8000
python -m services.websocket.websocket_server        # WebSocket on :8001
python -c "from services.trading.trading_engine import start_scheduler; start_scheduler()"

# Frontend development
cd frontend && npm run dev        # Development server
cd frontend && npm run build      # Production build
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

### Core Endpoints
- `GET /api/health` - Health check status
- `GET /api/account` - Alpaca account information and buying power
- `GET /api/positions` - Current portfolio positions with P&L
- `GET /api/activities` - Recent Alpaca trading activities (auto-refreshing)
- `GET /api/trades` - Database trade history with strategy info
- `GET /api/status` - Current bot running status

### Bot Control
- `POST /api/toggle` - Start/stop automated trading bot
- `POST /api/strategy` - Change trading strategy (momentum, rsi, breakout, sma_crossover)
- `POST /api/execute_trade` - Manual trade execution for testing

### WebSocket Endpoint
- `ws://localhost:8001/ws` - Real-time trade notifications and bot status updates

### Example API Usage
```bash
# Check bot status
curl http://localhost:8000/api/status

# Change strategy to RSI
curl -X POST http://localhost:8000/api/strategy \
  -H "Content-Type: application/json" \
  -d '{"strategy": "rsi"}'

# Execute manual test trade
curl -X POST http://localhost:8000/api/execute_trade \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "action": "buy", "qty": 1}'
```

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