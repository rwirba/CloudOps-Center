import React from 'react';
import ManageAWSResources from './ManageAWSResources';

function Dashboard() {
  return (
    <div>
      <h2 style={{ color: '#232F3E' }}>CloudOps Center</h2>
      <ManageAWSResources />
    </div>
  );
}

export default Dashboard;