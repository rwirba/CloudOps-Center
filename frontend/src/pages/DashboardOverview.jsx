import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const DashboardOverview = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">EC2 Status</Typography>
          <Typography variant="h4">3 Running</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">IAM Users</Typography>
          <Typography variant="h4">2 Users</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Active Pods</Typography>
          <Typography variant="h4">12</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardOverview;
