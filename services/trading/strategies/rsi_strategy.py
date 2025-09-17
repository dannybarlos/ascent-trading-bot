"""RSI trading strategy implementation."""
from typing import List, Dict

from ta.momentum import RSIIndicator
from pandas import DataFrame


class RSIStrategy:
    """RSI strategy using relative strength index."""

    def evaluate(self, bars: List[Dict]) -> str:
        """Evaluate RSI signal."""
        df = DataFrame(bars)
        rsi = RSIIndicator(df['close'], window=14).rsi()
        if rsi.iloc[-1] < 30:
            return "buy"
        elif rsi.iloc[-1] > 70:
            return "sell"
        return "hold"

