import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import axios from 'axios';

const DashboardOverview = () => {
  const [instances, setInstances] = useState([]);
  const [users, setUsers] = useState([]);
  const [pods, setPods] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);

  const fetchData = () => {
    axios.get('/api/instances').then(res => {
      setInstances(res.data.Reservations.flatMap(r => r.Instances));
    });

    axios.get('/api/iam-users').then(res => {
      setUsers(res.data.Users);
    });

    axios.get('/api/pods').then(res => {
      setPods(res.data);
    });

    axios.get('/api/vulnerabilities').then(res => {
      setVulnerabilities(res.data);
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const ec2Running = instances.filter(i => i.State.Name === 'running').length;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">EC2 Status</Typography>
          <Typography variant="h4">{ec2Running} Running</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">IAM Users</Typography>
          <Typography variant="h4">{users.length}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Active Pods</Typography>
          <Typography variant="h4">{pods.length}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Vulnerabilities</Typography>
          <Typography variant="h4">{vulnerabilities.length}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardOverview;