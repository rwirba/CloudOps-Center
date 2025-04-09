import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageAWSResources() {
  const [instances, setInstances] = useState([]);
  const [users, setUsers] = useState([]);
  const [showInstances, setShowInstances] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

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
      <h3
        onClick={() => setShowInstances(!showInstances)}
        style={{ color: '#FF9900', cursor: 'pointer' }}
      >
        EC2 Instances
      </h3>
      {showInstances && (
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
      )}

      <h3
        onClick={() => setShowUsers(!showUsers)}
        style={{ color: '#4C51BF', cursor: 'pointer' }}
      >
        IAM Users
      </h3>
      {showUsers && (
        <ul>
          {users.map(user => (
            <li key={user.UserName}>
              {user.UserName}
              <button onClick={() => axios.post('/api/rotate-access-key', { userName: user.UserName })}>Rotate Key</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManageAWSResources;
