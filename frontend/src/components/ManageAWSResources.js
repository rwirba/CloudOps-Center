import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageAWSResources() {
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

  return (
    <div>
      <h3 style={{ color: '#FF9900' }}>EC2 Instances</h3>
      <ul>
        {instances.map(instance => (
          <li key={instance.InstanceId}>
            {instance.InstanceId} - {instance.State.Name}
            <button onClick={() => axios.post('/api/start', { instanceId: instance.InstanceId })}>Start</button>
            <button onClick={() => axios.post('/api/stop', { instanceId: instance.InstanceId })}>Stop</button>
            <button onClick={() => axios.post('/api/terminate', { instanceId: instance.InstanceId })}>Terminate</button>
          </li>
        ))}
      </ul>

      <h3 style={{ color: '#4C51BF' }}>IAM Users</h3>
      <ul>
        {users.map(user => (
          <li key={user.UserName}>
            {user.UserName}
            <button onClick={() => axios.post('/api/rotate-access-key', { userName: user.UserName })}>Rotate Key</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageAWSResources;
