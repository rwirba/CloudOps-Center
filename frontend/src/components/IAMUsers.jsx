import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

function IAMUsers({ users, onRotateKey }) {
  const [keys, setKeys] = useState({});

  useEffect(() => {
    users.forEach(user => {
      axios.get(`/api/iam-access-keys/${user.UserName}`).then(res => {
        setKeys(prev => ({ ...prev, [user.UserName]: res.data.AccessKeyMetadata }));
      });
    });
  }, [users]);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Access Key ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            keys[user.UserName]?.map((key, i) => (
              <TableRow key={key.AccessKeyId}>
                <TableCell>{user.UserName}</TableCell>
                <TableCell>{key.AccessKeyId}</TableCell>
                <TableCell>{key.Status}</TableCell>
                <TableCell>{new Date(key.CreateDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => onRotateKey(user.UserName)}>Rotate</Button>
                  <Button onClick={() => axios.post('/api/disable-access-key', { userName: user.UserName, accessKeyId: key.AccessKeyId })}>Disable</Button>
                  <Button onClick={() => axios.post('/api/delete-access-key', { userName: user.UserName, accessKeyId: key.AccessKeyId })}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default IAMUsers;
