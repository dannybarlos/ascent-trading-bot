"""Strategy registry for trading bot strategies."""
from services.trading.strategies.momentum_strategy import MomentumStrategy
from services.trading.strategies.rsi_strategy import RSIStrategy
from services.trading.strategies.breakout_strategy import BreakoutStrategy
from services.trading.strategies.sma_crossover_strategy import SmaCrossover


def get_strategy(name: str):
    """Get a strategy instance by name."""
    strategies = {
        "momentum": MomentumStrategy(),
        "rsi": RSIStrategy(),
        "breakout": BreakoutStrategy(),
        "sma_crossover": SmaCrossover(),
    }
    return strategies.get(name, MomentumStrategy())
