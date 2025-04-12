import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardOverview({ stats }) {
  const chartData = (labels, data, colors) => ({
    labels,
    datasets: [{
      label: 'Count',
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
                ['#00C853', '#DD2C00']
              )} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">IAM Access Keys</Typography>
              <Doughnut data={chartData(
                ['Active (0-30d)', 'Warning (31-60d)', 'Stale (60+d)'],
                [stats.iam.active, stats.iam.warning, stats.iam.stale],
                ['#00C853', '#FFD600', '#D50000']
              )} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Kubernetes Pods</Typography>
              <Doughnut data={chartData(
                ['Running', 'Failed'],
                [stats.pods.running, stats.pods.failed],
                ['#00C853', '#D50000']
              )} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Vulnerabilities</Typography>
              <Doughnut data={chartData(
                ['Critical', 'High', 'Medium'],
                [stats.vuln.critical, stats.vuln.high, stats.vuln.medium],
                ['#B71C1C', '#E53935', '#FFD600']
              )} />
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default DashboardOverview;
