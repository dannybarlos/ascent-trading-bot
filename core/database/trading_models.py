"""Database models for the trading bot."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean

from core.database.database_manager import Base

class ExecutedTrade(Base):
    """Model for executed trades."""
    __tablename__ = "executed_trades"
    id = Column(Integer, primary_key=True)
    symbol = Column(String)
    action = Column(String)
    price = Column(Float)
    qty = Column(Integer)
    signal = Column(String)
    strategy = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class BotControl(Base):
    """Model for bot control state."""
    __tablename__ = "bot_control"
    id = Column(Integer, primary_key=True)
    is_running = Column(Boolean, default=True)

class StrategyControl(Base):
    """Model for strategy control."""
    __tablename__ = "strategy_control"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    is_active = Column(Boolean, default=False)

class StrategyPerformance(Base):
    """Model for strategy performance tracking."""
    __tablename__ = "strategy_performance"
    id = Column(Integer, primary_key=True)
    strategy = Column(String)
    portfolio_value = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)
