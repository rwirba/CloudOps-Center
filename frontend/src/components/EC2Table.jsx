import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper } from '@mui/material';
import CloudWatchChart from './CloudWatchChart';

function EC2Table({ instances, onAction }) {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Instance ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Public IP</TableCell>
            <TableCell>Actions</TableCell>
            <TableCell>CloudWatch</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instances.map((instance, i) => (
            <TableRow key={i}>
              <TableCell>{instance.Tags?.find(t => t.Key === 'Name')?.Value || 'N/A'}</TableCell>
              <TableCell>{instance.InstanceId}</TableCell>
              <TableCell>{instance.InstanceType}</TableCell>
              <TableCell>{instance.State?.Name}</TableCell>
              <TableCell>{instance.PublicIpAddress || 'N/A'}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => onAction('start', instance.InstanceId)}>Start</Button>
                <Button size="small" onClick={() => onAction('stop', instance.InstanceId)}>Stop</Button>
                <Button size="small" onClick={() => onAction('terminate', instance.InstanceId)}>Terminate</Button>
              </TableCell>
              <TableCell>
                <CloudWatchChart instanceId={instance.InstanceId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default EC2Table;