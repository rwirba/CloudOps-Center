import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardOverview from '../pages/DashboardOverview';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => {
        console.log('✅ Stats fetched:', res.data); // for debugging
        setStats(res.data);
      })
      .catch(err => {
        console.error('❌ Failed to fetch stats:', err.message);
        setStats(null);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <DashboardOverview stats={stats} />
    </div>
  );
}

export default Dashboard;
