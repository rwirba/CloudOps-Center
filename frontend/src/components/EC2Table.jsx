import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

function EC2Table({ instances, onAction }) {
  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Instance ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Public IP</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instances.map((instance) => {
            const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
            return (
              <TableRow key={instance.InstanceId}>
                <TableCell>{nameTag?.Value || 'Unnamed'}</TableCell>
                <TableCell>{instance.InstanceId}</TableCell>
                <TableCell>{instance.InstanceType}</TableCell>
                <TableCell>{instance.State.Name}</TableCell>
                <TableCell>{instance.PublicIpAddress || 'N/A'}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => onAction('start', instance.InstanceId)}>Start</Button>
                  <Button onClick={() => onAction('stop', instance.InstanceId)}>Stop</Button>
                  <Button onClick={() => onAction('terminate', instance.InstanceId)}>Terminate</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default EC2Table;