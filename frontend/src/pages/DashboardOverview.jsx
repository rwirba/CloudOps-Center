import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardOverview({ stats }) {
  const chartData = (labels, data, colors) => ({
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderWidth: 1
    }]
  });

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {stats && (
        <>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">EC2 Instances</Typography>
              <Doughnut data={chartData(
                ['Running', 'Stopped'],
                [stats.ec2.running, stats.ec2.stopped],
                ['#4caf50', '#f44336']  // green, red
              )} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">IAM Access Keys</Typography>
              <Doughnut data={chartData(
                ['Active (0–30d)', 'Warning (31–60d)', 'Stale (60+d)'],
                [stats.iam.active, stats.iam.warning, stats.iam.stale],
                ['#4caf50', '#ffc107', '#f44336'] // green, yellow, red
              )} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Kubernetes Pods</Typography>
              <Doughnut data={chartData(
                ['Running', 'Failed'],
                [stats.pods.running, stats.pods.failed],
                ['#4caf50', '#f44336']  // green, red
              )} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Vulnerabilities</Typography>
              <Doughnut data={chartData(
                ['Critical', 'High', 'Medium'],
                [stats.vuln.critical, stats.vuln.high, stats.vuln.medium],
                ['#b71c1c', '#e53935', '#ffc107'] // danger red, red, yellow
              )} />
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default DashboardOverview;
