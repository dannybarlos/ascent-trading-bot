"""Momentum trading strategy implementation."""
from datetime import datetime
from typing import List, Dict

from pandas import DataFrame


class MomentumStrategy:
    """Momentum strategy using moving averages."""

    def evaluate(self, bars: List[Dict]) -> str:
        """Evaluate momentum signal based on moving averages."""
        df = DataFrame(bars)
        df['ma_fast'] = df['close'].rolling(window=50).mean()
        df['ma_slow'] = df['close'].rolling(window=200).mean()
        if df['ma_fast'].iloc[-1] > df['ma_slow'].iloc[-1]:
            return "buy"
        elif df['ma_fast'].iloc[-1] < df['ma_slow'].iloc[-1]:
            return "sell"
        return "hold"

