import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

function StatusPage() {
  const [status, setStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = () => {
    axios.get('/health')
      .then(res => {
        setStatus(res.data);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => {
        setStatus({ status: 'fail', checks: [] });
        setLastUpdated(new Date().toLocaleTimeString());
      });
  };

  useEffect(() => {
    fetchStatus(); // initial fetch
    const interval = setInterval(fetchStatus, 10000); // every 10s
    return () => clearInterval(interval); // cleanup
  }, []);

  const getColor = (state) => (state === 'ok' ? 'success' : 'error');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff' }}>
          System Health Overview
        </Typography>
        <Button
          onClick={fetchStatus}
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          sx={{ color: '#fff', borderColor: '#fff' }}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body2" sx={{ color: '#bbb', mt: 1 }}>
        Last updated: {lastUpdated || 'Loading...'}
      </Typography>

      <Paper sx={{ p: 2, mt: 2, backgroundColor: '#1c1c2e' }}>
        <Typography sx={{ color: '#fff' }} gutterBottom>
          Global Status:{' '}
          <Chip
            label={status?.status?.toUpperCase() || 'UNKNOWN'}
            color={getColor(status?.status)}
          />
        </Typography>

        <Divider sx={{ my: 2 }} />

        <List>
          {status?.checks?.length > 0 ? (
            status.checks.map((check, idx) => (
              <ListItem key={idx} sx={{ color: '#fff' }} divider>
                <ListItemText
                  primary={check.service}
                  secondary={
                    check.message
                      ? `⚠️ ${check.message}`
                      : check.podCount !== undefined
                      ? `Pods: ${check.podCount}`
                      : null
                  }
                />
                <Tooltip title={check.message || ''}>
                  <Chip
                    label={check.status}
                    color={getColor(check.status)}
                    size="small"
                  />
                </Tooltip>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Fetching status..." sx={{ color: '#ccc' }} />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default StatusPage;
