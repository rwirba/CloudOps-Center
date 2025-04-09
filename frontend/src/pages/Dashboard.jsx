import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EC2Table from '../components/EC2Table';
import IAMTable from '../components/IAMTable';

function Dashboard() {
  const [instances, setInstances] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/instances').then(res => {
      setInstances(res.data.Reservations.flatMap(r => r.Instances));
    });
    axios.get('/api/iam-users').then(res => {
      setUsers(res.data.Users);
    });
  }, []);

  const handleInstanceAction = (action, instanceId) => {
    axios.post(`/api/${action}`, { instanceId });
  };

  const handleRotateKey = (userName) => {
    axios.post('/api/rotate-access-key', { userName });
  };

  return (
    <>
      <EC2Table instances={instances} onAction={handleInstanceAction} />
      <IAMTable users={users} onRotateKey={handleRotateKey} />
    </>
  );
}

export default Dashboard;
