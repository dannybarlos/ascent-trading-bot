import React from "react";

const SimpleDashboard: React.FC = () => {
  return (
    <div className="font-sans bg-gray-100 min-h-screen">
      <header style={{
        backgroundColor: '#1e293b',
        padding: '1rem',
        color: 'white',
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        borderBottom: '2px solid #334155'
      }}>
        Ascent Trading Bot
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-lg font-bold mb-2">Bot Status</div>
          <div className="text-gray-700">Running</div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3>Controls</h3>
          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="strategy" style={{ marginRight: "1rem" }}>
                Strategy:
            </label>
            <select
                id="strategy"
                style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginRight: "1rem"
                }}
            >
                <option value="momentum">Momentum</option>
                <option value="rsi">RSI</option>
                <option value="breakout">Breakout</option>
            </select>

            <button
                style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Start Bot
            </button>
        </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3>Recent Trades</h3>
          <p>No trades yet...</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h3>Account Info</h3>
            <p>Loading account info...</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 lg:col-span-2">
            <h3>Positions</h3>
            <p>No positions...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;