
from datetime import datetime
from pandas import DataFrame

class MomentumStrategy:
    def evaluate(self, bars: list[dict]) -> str:
        df = DataFrame(bars)
        df['ma_fast'] = df['close'].rolling(window=50).mean()
        df['ma_slow'] = df['close'].rolling(window=200).mean()
        if df['ma_fast'].iloc[-1] > df['ma_slow'].iloc[-1]:
            return "buy"
        elif df['ma_fast'].iloc[-1] < df['ma_slow'].iloc[-1]:
            return "sell"
        return "hold"
