import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Chip, Tabs, Tab } from '@mui/material';

function K8sMonitoring() {
  const [pods, setPods] = useState([]);
  const [logs, setLogs] = useState('');
  const [selectedPod, setSelectedPod] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    axios.get('/api/pods').then(res => setPods(res.data));
    axios.get('/api/nodes/metrics').then(res => setMetrics(res.data));
  }, []);

  const fetchLogs = (podName, namespace = 'dct') => {
    axios.get(`/api/pods/${podName}/logs?namespace=${namespace}`).then(res => {
      setSelectedPod(podName);
      setLogs(res.data);
    });
  };

  const cleanupDocker = () => {
    axios.post('/api/cleanup-docker').then(() => alert('Cleanup triggered.')).catch(err => alert(err.message));
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Pods" />
        <Tab label="Nodes" />
      </Tabs>

      {tab === 0 && (
        <Box>
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
                    <TableCell><Chip label={pod.status.phase} color={pod.status.phase === 'Running' ? 'success' : 'error'} size="small" /></TableCell>
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
              <pre style={{ background: '#111', color: '#0f0', padding: '10px', maxHeight: '300px', overflow: 'auto' }}>{logs}</pre>
            </Paper>
          )}
        </Box>
      )}

      {tab === 1 && metrics && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Control Node Resource Usage</Typography>
          <Typography>CPU: {metrics.cpu}%</Typography>
          <Typography>RAM: {metrics.ram}%</Typography>
          <Typography>Pods Used: {metrics.pods}%</Typography>
          <Button onClick={cleanupDocker} variant="contained" color="error" sx={{ mt: 2 }}>Cleanup Docker</Button>
        </Box>
      )}
    </Box>
  );
}

export default K8sMonitoring;