import React, { useEffect, useState } from 'react';

const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchActivities();

    // Refresh every 30 seconds to get fresh activity data from Alpaca
    const interval = setInterval(fetchActivities, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatActivity = (act: any) => {
    if (act.activity_type === 'FILL') {
      return `${act.symbol} - ${act.side?.toUpperCase()} ${act.qty} @ $${parseFloat(act.price).toFixed(2)}`;
    } else if (act.activity_type === 'JNLC') {
      return `${act.description || 'Journal'} - ${act.status?.toUpperCase()} $${parseFloat(act.net_amount).toFixed(2)}`;
    }
    return `${act.activity_type} - ${act.status?.toUpperCase() || 'UNKNOWN'}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <button
          onClick={fetchActivities}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        {activities.slice(0, 5).map((act, i) => (
          <div key={i} className={`p-4 bg-white ${i < activities.slice(0, 5).length - 1 ? 'border-b-2 border-gray-200' : ''} hover:bg-gray-50 transition-colors`}>
            <div className="font-semibold text-gray-900 mb-2">{formatActivity(act)}</div>
            <div className="text-sm text-gray-600">
              {act.transaction_time ? new Date(act.transaction_time).toLocaleString() :
               act.created_at ? new Date(act.created_at).toLocaleString() : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;