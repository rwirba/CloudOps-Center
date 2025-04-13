import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Chip } from '@mui/material';
import CloudWatchChart from './CloudWatchChart';

function EC2Table({ instances, onAction }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'error';
      default: return 'warning';
    }
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
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
              <TableCell>
                <Chip label={instance.State?.Name} color={getStatusColor(instance.State?.Name)} size="small" />
              </TableCell>
              <TableCell>{instance.PublicIpAddress || 'N/A'}</TableCell>
              <TableCell>
                <Button size="small" color="success" onClick={() => onAction('start', instance.InstanceId)}>Start</Button>
                <Button size="small" color="warning" onClick={() => onAction('stop', instance.InstanceId)}>Stop</Button>
                <Button size="small" color="error" onClick={() => onAction('terminate', instance.InstanceId)}>Terminate</Button>
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