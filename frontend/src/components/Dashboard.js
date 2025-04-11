import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardOverview from '../pages/DashboardOverview';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#fff', paddingBottom: '10px' }}>DevOps Control Tower</h2>
      <DashboardOverview stats={stats} />
    </div>
  );
}

export default Dashboard;
