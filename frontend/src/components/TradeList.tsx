import React from 'react';

interface Trade {
  symbol: string;
  action: string;
  price: number;
  timestamp: string;
}

interface Props {
  trades: Trade[];
}

const TradeList = ({ trades }: Props) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Recent Trades</h2>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#f8fafc',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {trades.map((trade, index) => (
          <li key={index} style={{
            padding: '0.5rem 1rem',
            borderBottom: '1px solid #cbd5e1'
          }}>
            <strong>{trade.symbol}</strong> - {trade.action?.toUpperCase() || 'UNKNOWN'} @ ${trade.price} 
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{trade.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TradeList;
