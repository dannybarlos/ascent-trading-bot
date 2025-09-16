import React, { useEffect, useState } from 'react';

const PositionTable = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      setError(null);
      const response = await fetch("/api/positions");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPositions, 30000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3>Open Positions</h3>
          <button
            onClick={fetchPositions}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
        </div>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3>Open Positions</h3>
        <button
          onClick={fetchPositions}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>
      {loading ? (
        <p>Loading positions...</p>
      ) : positions.length === 0 ? (
        <p>No positions...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>Market Value</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => (
                <tr key={i}>
                  <td>{pos.symbol}</td>
                  <td>{pos.qty}</td>
                  <td>${parseFloat(pos.avg_entry_price).toFixed(2)}</td>
                  <td>${parseFloat(pos.market_value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.8em', color: '#666' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </>
      )}
    </div>
  );
};

export default PositionTable;