import React, { useEffect, useState } from 'react';

const AccountPanel = () => {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = async () => {
    try {
      setError(null);
      const response = await fetch("/api/account");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setAccount(data);
    } catch (err) {
      console.error("Failed to fetch account:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAccount, 30000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3>Account Info</h3>
          <button
            onClick={fetchAccount}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
        </div>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  if (loading || !account) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3>Account Info</h3>
          <button
            onClick={fetchAccount}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
        <p>Loading account info...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3>Account Info</h3>
        <button
          onClick={fetchAccount}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>
      <p><strong>Status:</strong> {account._raw?.status || 'Unknown'}</p>
      <p><strong>Cash:</strong> ${parseFloat(account._raw?.cash || 0).toFixed(2)}</p>
      <p><strong>Portfolio Value:</strong> ${parseFloat(account._raw?.portfolio_value || 0).toFixed(2)}</p>
      <p style={{ fontSize: '0.8em', color: '#666' }}>
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default AccountPanel;