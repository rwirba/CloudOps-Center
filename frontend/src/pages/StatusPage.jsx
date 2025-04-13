import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';

function StatusPage() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios.get('/health')
      .then(res => setStatus(res.data))
      .catch(() => setStatus({ status: 'fail', checks: [] }));
  }, []);

  const getColor = (state) => (state === 'ok' ? 'success' : 'error');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>System Status</Typography>

      <Paper sx={{ p: 2, backgroundColor: '#1c1c2e' }}>
        <Typography sx={{ color: '#fff' }} gutterBottom>
          API Status: <Chip label={status?.status || 'Unknown'} color={getColor(status?.status)} />
        </Typography>

        <Divider sx={{ my: 2 }} />

        <List>
          {status?.checks?.map((check, idx) => (
            <ListItem key={idx} sx={{ color: '#fff' }}>
              <ListItemText primary={check.service} />
              <Chip label={check.status} color={getColor(check.status)} />
            </ListItem>
          ))}

          {!status?.checks?.length && (
            <ListItem>
              <ListItemText primary="Fetching status..." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default StatusPage;
