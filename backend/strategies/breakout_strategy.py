
from pandas import DataFrame

class BreakoutStrategy:
    def evaluate(self, bars: list[dict]) -> str:
        df = DataFrame(bars)
        high_n = df['high'].rolling(window=20).max()
        low_n = df['low'].rolling(window=20).min()
        if df['high'].iloc[-1] > high_n.iloc[-2]:
            return "buy"
        elif df['low'].iloc[-1] < low_n.iloc[-2]:
            return "sell"
        return "hold"
