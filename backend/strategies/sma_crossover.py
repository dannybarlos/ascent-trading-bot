
class SmaCrossover:
    def __init__(self, short=3, long=5):
        self.short = short
        self.long = long

    def evaluate(self, bars: list[dict]) -> str:
        closes = [bar["close"] for bar in bars]
        if len(closes) < self.long:
            return "hold"
        short_avg = sum(closes[-self.short:]) / self.short
        long_avg = sum(closes[-self.long:]) / self.long
        if short_avg > long_avg:
            return "buy"
        elif short_avg < long_avg:
            return "sell"
        return "hold"
