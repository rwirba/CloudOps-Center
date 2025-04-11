import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

function IAMUsers({ users, onRotateKey }) {
  const getKeyColor = (days) => {
    if (days <= 30) return 'success';
    if (days <= 60) return 'warning';
    return 'error';
  };

  const calcAge = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>User Name</TableCell>
            <TableCell>Key Age</TableCell>
            <TableCell>Key Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, i) => (
            user.AccessKeys?.map((key, idx) => (
              <TableRow key={`${i}-${idx}`}>
                <TableCell>{user.UserName}</TableCell>
                <TableCell>
                  <Chip label={`${calcAge(key.CreateDate)} days`} color={getKeyColor(calcAge(key.CreateDate))} size="small" />
                </TableCell>
                <TableCell>{key.Status}</TableCell>
                <TableCell>
                  <button onClick={() => onRotateKey(user.UserName)}>Rotate Key</button>
                </TableCell>
              </TableRow>
            )) || null
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default IAMUsers;