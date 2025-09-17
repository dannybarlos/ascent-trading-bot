# Ascent Trading Bot - Technical Architecture

## Overview
This document outlines the technical architecture and implementation details of the Ascent Trading Bot, including recent refactoring and feature additions.

## Microservices Architecture

### Service Breakdown

#### 1. API Service (`infrastructure/docker/api.Dockerfile`)
**Purpose**: Main HTTP server hosting both REST API and React frontend

**Responsibilities**:
- REST API endpoints for bot control and data access
- Static file serving for React SPA
- Manual trade execution
- Database operations for trades and bot state

**Key Files**:
- `services/api/api_server.py` - Main FastAPI application
- Frontend built into `/workspace/static` during container build
- Shared SQLite database at `/workspace/shared/trading.db`

**Endpoints**:
- `GET /api/health` - Health check
- `GET /api/account` - Alpaca account information
- `GET /api/positions` - Current positions
- `GET /api/activities` - Recent Alpaca activities
- `GET /api/trades` - Database trade history
- `GET /api/status` - Bot running status
- `POST /api/toggle` - Start/stop bot
- `POST /api/strategy` - Change trading strategy
- `POST /api/execute_trade` - Manual trade execution

#### 2. WebSocket Service (`infrastructure/docker/websocket.Dockerfile`)
**Purpose**: Real-time communication hub for live updates

**Responsibilities**:
- WebSocket connections to frontend clients
- Redis subscription for trade notifications
- Broadcasting live updates to connected clients

**Key Files**:
- `services/websocket/websocket_server.py` - FastAPI WebSocket server
- Real-time message broadcasting via Redis pub/sub

**Message Types**:
- Trade executions with symbol, action, price, timestamp
- Bot status changes (running/paused)
- Strategy selection updates

#### 3. Trading Service (`infrastructure/docker/trading.Dockerfile`)
**Purpose**: Autonomous trading engine with strategy execution

**Responsibilities**:
- Multi-symbol trading across top 10 S&P 500 stocks
- Strategy evaluation and signal generation
- Automated trade execution via Alpaca API
- Database persistence for trades and performance

**Key Files**:
- `services/trading/trading_engine.py` - Main trading bot implementation
- `services/trading/strategy_manager.py` - Strategy registry
- `services/trading/strategies/` - Individual strategy implementations

**Execution Flow**:
1. **Schedule**: APScheduler runs every 5 minutes
2. **Symbol Iteration**: Processes all 10 symbols individually
3. **Strategy Evaluation**: Applies current strategy to recent price data
4. **Signal Processing**: Executes buy/sell orders based on signals
5. **Persistence**: Stores trades in database
6. **Broadcasting**: Publishes trade notifications via Redis

### Data Flow Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React SPA)   │
└─────────┬───────┘
          │ HTTP REST API
          │ WebSocket Connection
          ▼
┌─────────────────┐    ┌─────────────────┐
│   API Service   │◄──►│ WebSocket Svc   │
│   (port 8000)   │    │   (port 8001)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          │ Database             │ Redis Pub/Sub
          │ Operations           │ Subscription
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   SQLite DB     │    │   Redis Server  │
│   (shared vol)  │    │   (port 6379)   │
└─────────────────┘    └─────────┬───────┘
                                 │ Redis Pub/Sub
                                 │ Publishing
                                 ▼
                       ┌─────────────────┐
                       │ Trading Service │
                       │  (background)   │
                       └─────────────────┘
                                 │
                                 │ Alpaca API
                                 ▼
                       ┌─────────────────┐
                       │  Alpaca Markets │
                       │  (Paper Trading)│
                       └─────────────────┘
```

## Multi-Symbol Trading Implementation

### Symbol Selection
**Top 10 S&P 500 Stocks** (by market cap):
```python
TOP_SP500_SYMBOLS = [
    "AAPL",  # Apple Inc.
    "MSFT",  # Microsoft Corporation
    "GOOGL", # Alphabet Inc. Class A
    "AMZN",  # Amazon.com Inc.
    "NVDA",  # NVIDIA Corporation
    "TSLA",  # Tesla Inc.
    "META",  # Meta Platforms Inc.
    "BRK.B", # Berkshire Hathaway Inc. Class B
    "UNH",   # UnitedHealth Group Inc.
    "JNJ"    # Johnson & Johnson
]
```

### Trading Logic
**Per-Symbol Processing**:
1. Fetch recent price bars for symbol
2. Evaluate current strategy for signal generation
3. Execute trade if buy/sell signal generated
4. Continue to next symbol if error occurs (fault tolerance)
5. Update strategy performance after all symbols processed

**Error Handling**: Individual symbol failures don't stop the entire trading cycle

## Strategy System

### Strategy Registry (`services/trading/strategy_manager.py`)
Centralized registry mapping strategy names to implementations:
```python
strategies = {
    "momentum": MomentumStrategy(),
    "rsi": RSIStrategy(),
    "breakout": BreakoutStrategy(),
    "sma_crossover": SmaCrossover(),
}
```

### Strategy Implementations

#### 1. RSI Strategy (`strategies/rsi_strategy.py`)
- **Technical Indicator**: 14-period Relative Strength Index
- **Buy Signal**: RSI < 30 (oversold)
- **Sell Signal**: RSI > 70 (overbought)
- **Dependencies**: `ta.momentum.RSIIndicator`, pandas

#### 2. Momentum Strategy (`strategies/momentum_strategy.py`)
- **Technical Indicator**: Moving average crossover
- **Fast MA**: 50-period
- **Slow MA**: 200-period
- **Buy Signal**: Fast MA > Slow MA
- **Sell Signal**: Fast MA < Slow MA

#### 3. Breakout Strategy (`strategies/breakout_strategy.py`)
- **Technical Indicator**: Support/resistance levels
- **Lookback Period**: 20 bars
- **Buy Signal**: High breaks above 20-period high
- **Sell Signal**: Low breaks below 20-period low

#### 4. SMA Crossover Strategy (`strategies/sma_crossover_strategy.py`)
- **Technical Indicator**: Simple moving average crossover
- **Short MA**: 3-period
- **Long MA**: 5-period
- **Buy Signal**: Short MA > Long MA
- **Sell Signal**: Short MA < Long MA

### Dynamic Strategy Switching
- **Runtime Changes**: Strategies can be changed without restart
- **Persistent State**: Current strategy survives container restarts
- **Multi-Symbol Application**: Strategy changes apply to all 10 symbols

## Database Schema

### Tables

#### `executed_trades`
- `id` - Primary key
- `symbol` - Stock symbol
- `action` - buy/sell
- `price` - Execution price
- `qty` - Quantity
- `signal` - Strategy signal
- `strategy` - Strategy name
- `created_at` - Timestamp

#### `bot_control`
- `id` - Primary key
- `is_running` - Boolean running state

#### `strategy_performance`
- `id` - Primary key
- `strategy` - Strategy name
- `portfolio_value` - Portfolio value at time
- `date` - Performance timestamp

## Real-Time Communication

### Redis Pub/Sub Channels
- **`trading_events`**: Trade executions and notifications
- **`bot_status`**: Bot state changes (running/paused)
- **`strategy_changes`**: Strategy selection updates

### WebSocket Messages
Message format for frontend updates:
```javascript
{
  type: "trade",
  symbol: "AAPL",
  action: "buy",
  price: 238.14,
  timestamp: "2025-09-17T01:38:00.357436",
  strategy: "MomentumStrategy"
}
```

## Frontend Architecture

### React Components
- **`Dashboard.tsx`**: Main dashboard with all components
- **`Controls.tsx`**: Bot controls and strategy selection
- **`ActivityFeed.tsx`**: Auto-refreshing activity display
- **`PositionTable.tsx`**: Live positions with refresh
- **`TradeList.tsx`**: Historical trade display

### State Management
- **Local State**: React useState for component data
- **WebSocket Updates**: Real-time data via custom hooks
- **API Integration**: REST calls for manual actions
- **Auto-Refresh**: 30-second intervals for activity feed

## Deployment & DevOps

### Docker Compose Services
```yaml
services:
  redis:      # Message broker
  api:        # REST API + Frontend
  websocket:  # Real-time updates
  trader:     # Background trading
```

### Volume Management
- **`shared_data`**: Persistent SQLite database
- **Container isolation**: Each service in separate container
- **Shared database**: Common data access across services

### Environment Configuration
- **Alpaca API keys**: Paper trading credentials
- **Redis URLs**: Inter-service communication
- **Database paths**: Shared volume mounting

## Recent Refactoring Summary

### Major Changes
1. **Microservices Split**: Separated monolithic app into 4 services
2. **Multi-Symbol Trading**: Expanded from AAPL-only to top 10 S&P 500
3. **Strategy Registry**: Centralized strategy management
4. **Real-Time Updates**: WebSocket + Redis pub/sub implementation
5. **UI/UX Improvements**: Enhanced dashboard with auto-refresh

### Performance Improvements
- **Fault Tolerance**: Individual symbol failures don't break trading
- **Scalability**: Microservices can be scaled independently
- **Real-Time**: WebSocket for immediate frontend updates
- **Persistence**: State survives container restarts

### Code Quality
- **Linting**: 10.00/10 pylint rating maintained
- **Error Handling**: Comprehensive exception handling
- **Logging**: Detailed logging for debugging and monitoring
- **Documentation**: Updated architecture and implementation docs