
from ta.momentum import RSIIndicator
from pandas import DataFrame

class RSIStrategy:
    def evaluate(self, bars: list[dict]) -> str:
        df = DataFrame(bars)
        rsi = RSIIndicator(df['close'], window=14).rsi()
        if rsi.iloc[-1] < 30:
            return "buy"
        elif rsi.iloc[-1] > 70:
            return "sell"
        return "hold"
