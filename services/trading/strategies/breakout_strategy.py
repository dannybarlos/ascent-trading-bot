"""Breakout trading strategy implementation."""
from typing import List, Dict

from pandas import DataFrame


class BreakoutStrategy:
    """Breakout strategy using support/resistance levels."""

    def evaluate(self, bars: List[Dict]) -> str:
        """Evaluate breakout signal."""
        df = DataFrame(bars)
        high_n = df['high'].rolling(window=20).max()
        low_n = df['low'].rolling(window=20).min()
        if df['high'].iloc[-1] > high_n.iloc[-2]:
            return "buy"
        elif df['low'].iloc[-1] < low_n.iloc[-2]:
            return "sell"
        return "hold"

