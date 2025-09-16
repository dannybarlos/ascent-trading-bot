import React, { useEffect, useState } from 'react';

const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/activities")
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h3>Recent Fills</h3>
      <ul>
        {activities.map((act, i) => (
          <li key={i}>
            {act.description || act.activity_type || 'Activity'} - {act.status?.toUpperCase() || 'UNKNOWN'} ${act.net_amount || '0'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;