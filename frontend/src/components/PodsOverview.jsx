import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Button, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

function PodsOverview() {
  const [pods, setPods] = useState([]);
  const [selectedLog, setSelectedLog] = useState('');
  const [logOpen, setLogOpen] = useState(false);

  const fetchPods = () => {
    axios.get('/api/pods').then(res => setPods(res.data));
  };

  useEffect(() => {
    fetchPods();
    const interval = setInterval(fetchPods, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = (name) => {
    axios.post(`/api/pods/${name}/restart`).then(fetchPods);
  };

  const handleDelete = (name) => {
    axios.post(`/api/pods/${name}/delete`).then(fetchPods);
  };

  const handleLogs = (name) => {
    axios.get(`/api/pods/${name}/logs`).then(res => {
      setSelectedLog(res.data);
      setLogOpen(true);
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Restarts</TableCell>
            <TableCell>Node</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pods.map(pod => (
            <TableRow key={pod.metadata.name}>
              <TableCell>{pod.metadata.name}</TableCell>
              <TableCell>{pod.metadata.namespace}</TableCell>
              <TableCell>{pod.status.phase}</TableCell>
              <TableCell>{pod.status.containerStatuses?.[0]?.restartCount || 0}</TableCell>
              <TableCell>{pod.spec.nodeName}</TableCell>
              <TableCell>
                <Button onClick={() => handleLogs(pod.metadata.name)}>Logs</Button>
                <Button onClick={() => handleRestart(pod.metadata.name)}>Restart</Button>
                <Button onClick={() => handleDelete(pod.metadata.name)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={logOpen} onClose={() => setLogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Pod Logs</DialogTitle>
        <DialogContent>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>{selectedLog}</Typography>
        </DialogContent>
      </Dialog>
    </TableContainer>
  );
}

export default PodsOverview;