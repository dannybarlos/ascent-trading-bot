# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack trading bot application built with a **microservices architecture** using Docker Compose. The system was evolved from a monolithic structure to provide better separation of concerns, scalability, and reliability.

### Architecture Overview

The application consists of four main services:

- **API Service** (`Dockerfile.api`): FastAPI application handling REST API routes and serving static frontend files
- **WebSocket Service** (`Dockerfile.websocket`): Dedicated WebSocket server for real-time client connections
- **Trading Service** (`Dockerfile.trader`): Background bot executing trading strategies via APScheduler
- **Redis Service**: Pub/sub messaging system enabling communication between services
- **Database**: SQLite for persistent storage of trades, bot state, and strategy performance

### Key Components

**Backend Services**:

*API Service*:
- `main.py`: FastAPI application with REST API routes and static file serving
- Handles account information, positions, activities, and manual trade execution
- Manages bot control (start/stop, strategy changes) via Redis messaging
- Serves the built React frontend as static files

*WebSocket Service*:
- `websocket_service.py`: Dedicated WebSocket server for real-time client connections
- Subscribes to Redis pub/sub for trade notifications and bot status changes
- Broadcasts real-time updates to connected frontend clients
- Isolated from API service for better performance and reliability

*Trading Service*:
- `scheduler.py`: APScheduler-based bot executing trading strategies
- `strategy_registry.py`: Strategy loading and management system
- `strategies/`: Trading strategy implementations (RSI, SMA crossover, momentum, breakout)
- Publishes trade executions and status changes to Redis

*Shared Components*:
- `models.py`: SQLAlchemy database models for trades, bot control, and strategies
- `database.py`: Database connection and session management
- `alpaca_client.py`: Alpaca Markets API integration for live trading
- `redis_client.py`: Redis pub/sub client for inter-service communication

**Frontend (`frontend/src/`)**:
- `pages/Dashboard.tsx`: Main trading dashboard with live data
- `components/`: Reusable UI components (Header, Controls, TradeList, etc.)
- `hooks/useWebSocket.simple.ts`: Simplified WebSocket connection management
- React components communicate with WebSocket service for real-time updates

### Data Flow

**Microservices Communication Flow**:

1. **Trading Service** executes strategies via APScheduler at regular intervals
2. Strategies analyze market data and execute trades via Alpaca API
3. Trade executions are stored in SQLite database
4. Trading service publishes trade events to **Redis** pub/sub channel `trading_events`
5. **WebSocket Service** subscribes to Redis and broadcasts updates to connected clients
6. **Frontend** receives real-time updates via WebSocket connection on port 8001
7. Users interact with **API Service** (port 8000) for bot control and data queries
8. API service publishes control commands (start/stop, strategy changes) to Redis
9. All services maintain shared access to SQLite database via volume mounting

**Message Types** (Redis pub/sub):
- `trade`: Trade execution notifications with symbol, action, price, timestamp
- `status`: Bot status changes (Running/Paused)
- `strategy_change`: Strategy selection updates

## Architecture Evolution

### From Monolith to Microservices

**Previous Architecture (Deprecated)**:
- Single web service handling both HTTP and WebSocket connections
- Single scheduler service for background trading
- PostgreSQL database option (removed for simplicity)
- Monolithic design with tight coupling

**Current Architecture (v2)**:
- **Separation of Concerns**: API, WebSocket, and Trading services isolated
- **Redis Pub/Sub**: Enables loose coupling between services
- **SQLite**: Simplified database choice for development and deployment
- **Shared Volumes**: Database and static files shared via Docker volumes
- **Independent Scaling**: Each service can be scaled independently

### Key Improvements

1. **Reliability**: WebSocket service isolation prevents API issues from affecting real-time updates
2. **Performance**: Dedicated services optimized for their specific functions
3. **Maintainability**: Clear service boundaries and responsibilities
4. **Security**: Removed hardcoded API keys from Docker Compose files
5. **Simplicity**: SQLite reduces infrastructure complexity compared to PostgreSQL

### Cleanup Actions Taken

- Removed deprecated `docker-compose.yml` and `docker-compose.new.yml` with hardcoded secrets
- Consolidated to single `docker-compose.yml` (renamed from v2)
- Removed unused Dockerfiles: `Dockerfile`, `Dockerfile.web`, `Dockerfile.scheduler`
- Removed duplicate backend files: `database_sqlite.py`, `scheduler_main.py`, `test_env.py`
- Removed virtual environment from version control (`backend/venv/`)
- Added comprehensive `.gitignore` for security and cleanliness
- Updated Docker Compose to remove deprecated `version` field

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev        # Start development server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt    # Install dependencies
uvicorn main:app --reload --host 0.0.0.0 --port 8000    # Start development server
```

### Docker Development
```bash
docker-compose up --build    # Start all services
docker-compose down          # Stop all services
```

## Environment Configuration

**SECURITY REQUIREMENT**: This application requires environment variables for Alpaca API integration. API keys must NEVER be hardcoded in source code.

### Required Setup

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Configure your API credentials** in `.env`:
   ```bash
   ALPACA_API_KEY=your_api_key_here
   ALPACA_SECRET_KEY=your_secret_key_here
   APCA_API_BASE_URL=https://paper-api.alpaca.markets
   ```

### Environment Variables

- `ALPACA_API_KEY` / `APCA_API_KEY_ID`: Alpaca API key (from https://alpaca.markets/)
- `ALPACA_SECRET_KEY` / `APCA_API_SECRET_KEY`: Alpaca secret key
- `APCA_API_BASE_URL`: API base URL
  - Paper trading: `https://paper-api.alpaca.markets` (recommended for development)
  - Live trading: `https://api.alpaca.markets` (use with real money)
- `DATABASE_URL`: Database connection string (defaults to SQLite if not specified)
- `REDIS_URL`: Redis connection string (defaults to `redis://localhost:6379`)

### Security Notes

- **Environment files are gitignored** - they will not be committed to version control
- **Never commit API keys** - use environment variables only
- **Start with paper trading** - test thoroughly before using real money
- The `.env.example` file shows the required format without exposing secrets

## Strategy Development

New trading strategies should:
1. Inherit from base strategy class in `strategies/` directory
2. Implement required methods for signal generation and execution
3. Register in `strategy_registry.py` for UI selection
4. Follow existing pattern of RSI, SMA, momentum, and breakout strategies

## WebSocket Communication

The frontend connects to the dedicated WebSocket service (port 8001) at `/ws` endpoint for real-time updates. The WebSocket service acts as a bridge between Redis pub/sub and connected clients.

**Frontend → WebSocket**: Connection only (no messages sent from frontend)
**WebSocket → Frontend**: Real-time broadcasts of:
- `trade`: Trade execution notifications with full trade details
- `status`: Bot status changes (Running/Paused)
- `strategy_change`: Strategy selection updates

**Control Flow**: Frontend sends control commands to API service (port 8000) via HTTP, which publishes to Redis, which the WebSocket service then broadcasts to clients.

## Testing and Manual Operations

The system includes a manual trade execution endpoint for testing:

**POST** `/api/execute_trade`
```json
{
  "symbol": "AAPL",
  "action": "buy",
  "qty": 1
}
```

**GET** `/api/trades` - Retrieve recent trades from database

This allows end-to-end testing of trade execution, database persistence, and real-time WebSocket broadcasting.

## Troubleshooting & Common Issues

### WebSocket Connection Issues

**Problem**: WebSocket connects but disconnects immediately (~300ms)
```
WebSocket connected successfully to ws://localhost:8001/ws
WebSocket disconnected: CloseEvent {code: 1006, reason: '', wasClean: false}
```

**Root Causes & Solutions**:
1. **React useEffect dependency issues**: Missing dependencies or incorrect dependency arrays cause reconnection loops
   - **Fix**: Use `useCallback` for WebSocket handlers and include all dependencies in useEffect arrays
   - **Alternative**: Use the simplified `useWebSocket.simple.ts` hook which handles dependencies correctly

2. **WebSocket service not ready**: API service starts faster than WebSocket service
   - **Fix**: Add health checks and service dependencies in `docker-compose.yml`
   - **Verify**: Check `docker-compose logs websocket` for startup completion

### Frontend Data Issues

**Problem**: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')"
- **Cause**: Optional chaining missing on API response properties
- **Fix**: Add `?.` to all property accesses: `message.action?.toUpperCase()`

**Problem**: NaN values and "UNKNOWN" text in frontend components
- **Cause**: API responses using nested `_raw` objects instead of flat structure
- **Fix**: Access properties via `account._raw.cash` instead of `account.cash`

### API Integration Issues

**Problem**: Manual trade execution fails with "float() argument must be a string or a real number, not 'NoneType'"
- **Cause**: Paper trading orders don't have `filled_avg_price` immediately
- **Fix**: Implement fallback pricing using market data when order price is None

**Problem**: Missing timestamps in Redis messages (`'timestamp': None`)
- **Cause**: Hardcoded None values in publish methods
- **Fix**: Replace with `datetime.now().isoformat()` in all Redis publish calls

### State Persistence Issues

**Problem**: Bot state resets to "Running" on every restart
- **Cause**: Bot initialization not loading from database
- **Fix**: Implement `_load_state()` method using existing `BotControl` model

### Docker & Environment Issues

**Problem**: "Method Not Allowed" on new API endpoints
- **Cause**: Code changes not reflected in running containers
- **Fix**: Use `docker-compose up --build` to rebuild containers with code changes
- **Alternative**: Use `docker-compose restart service-name` for simple changes

**Problem**: Environment variables not working
- **Cause**: Missing `.env` file or incorrect variable names
- **Fix**: Copy `.env.example` to `.env` and configure with actual API credentials

### Database Issues

**Problem**: SQLite database not persisting between container restarts
- **Cause**: Database file stored in container filesystem instead of volume
- **Fix**: Ensure `shared_data` volume is mounted to `/workspace/shared`

**Problem**: Database corruption or permission errors
- **Fix**: Remove volumes and rebuild: `docker-compose down -v && docker-compose up --build`

### Performance & Architecture Issues

**Problem**: Monolithic service causing cascading failures
- **Solution**: Migrated to microservices architecture with dedicated API, WebSocket, and Trading services
- **Benefit**: Service isolation prevents one component failure from affecting others

### Security Issues Encountered

**Problem**: Hardcoded API keys in source code and Docker Compose files
- **Risk**: Credentials exposed in version control
- **Fix**: Environment variable configuration with comprehensive `.gitignore`

### Development Workflow Issues

**Problem**: Frontend build files in version control
- **Issue**: Large `frontend/dist/` directory with compiled code
- **Fix**: Add to `.gitignore` and remove from repository

**Problem**: Virtual environments in version control
- **Issue**: Platform-specific Python environments bloating repository
- **Fix**: Remove `backend/venv/`, `myenv/` and add to `.gitignore`

### Debugging Tips

1. **Check service logs individually**:
   ```bash
   docker-compose logs api
   docker-compose logs websocket
   docker-compose logs trader
   ```

2. **Test WebSocket connection manually**:
   ```bash
   wscat -c ws://localhost:8001/ws
   ```

3. **Verify environment variables**:
   ```bash
   docker-compose exec api env | grep ALPACA
   ```

4. **Test manual trade execution**:
   ```bash
   curl -X POST http://localhost:8000/api/execute_trade \
     -H "Content-Type: application/json" \
     -d '{"symbol": "AAPL", "action": "buy", "qty": 1}'
   ```

5. **Check database contents**:
   ```bash
   curl http://localhost:8000/api/trades
   ```