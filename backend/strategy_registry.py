"""Strategy registry for trading bot strategies."""
from strategies.momentum_strategy import MomentumStrategy
from strategies.rsi_strategy import RSIStrategy
from strategies.breakout_strategy import BreakoutStrategy


def get_strategy(name: str):
    """Get a strategy instance by name."""
    strategies = {
        "momentum": MomentumStrategy(),
        "rsi": RSIStrategy(),
        "breakout": BreakoutStrategy(),
    }
    return strategies.get(name, MomentumStrategy())
