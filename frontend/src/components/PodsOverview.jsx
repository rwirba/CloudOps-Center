import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Chip } from '@mui/material';

function PodsOverview() {
  const [pods, setPods] = useState([]);
  const [selectedPod, setSelectedPod] = useState(null);
  const [logs, setLogs] = useState('');

  useEffect(() => {
    axios.get('/api/pods').then(res => setPods(res.data));
  }, []);

  const getStatusColor = (phase) => {
    if (phase === 'Running') return 'success';
    if (phase === 'Failed') return 'error';
    return 'warning';
  };

  const fetchLogs = (podName, namespace = 'dct') => {
    axios.get(`/api/pods/${podName}/logs?namespace=${namespace}`)
      .then(res => {
        setSelectedPod(podName);
        setLogs(res.data);
      });
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Namespace</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pods.map((pod, i) => (
              <TableRow key={i}>
                <TableCell>{pod.metadata.name}</TableCell>
                <TableCell><Chip label={pod.status.phase} color={getStatusColor(pod.status.phase)} size="small" /></TableCell>
                <TableCell>{pod.metadata.namespace}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => fetchLogs(pod.metadata.name, pod.metadata.namespace)}>View Logs</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedPod && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Logs for {selectedPod}</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#0f0', padding: '10px', height: '200px', overflow: 'auto' }}>{logs}</pre>
        </Paper>
      )}
    </>
  );
}

export default PodsOverview;