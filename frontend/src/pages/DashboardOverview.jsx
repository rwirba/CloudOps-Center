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
    <Grid container spacing={3}>
      {stats && (
        <>
          {/* EC2 and IAM merged chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: '#1e1e2f' }}>
              <Typography variant="h6" color="white">EC2 & IAM</Typography>
              <Doughnut data={chartData(
                ['EC2 Running', 'EC2 Stopped', 'IAM (0-30d)', 'IAM (31-60d)', 'IAM (60+d)'],
                [
                  stats.ec2.running,
                  stats.ec2.stopped,
                  stats.iam.active,
                  stats.iam.warning,
                  stats.iam.stale
                ],
                ['#00e676', '#ff3d00', '#00e676', '#ffd700', '#ff0000']
              )} />
            </Paper>
          </Grid>

          {/* Kubernetes Pods chart */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, background: '#1e1e2f' }}>
              <Typography variant="h6" color="white">Kubernetes Pods</Typography>
              <Doughnut data={chartData(
                ['Running', 'Failed'],
                [stats.pods.running, stats.pods.failed],
                ['#00e676', '#ff3d00']
              )} />
            </Paper>
          </Grid>

          {/* Vulnerabilities chart */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, background: '#1e1e2f' }}>
              <Typography variant="h6" color="white">Vulnerabilities</Typography>
              <Doughnut data={chartData(
                ['Critical', 'High', 'Medium'],
                [stats.vuln.critical, stats.vuln.high, stats.vuln.medium],
                ['#b71c1c', '#ff1744', '#ffd600']
              )} />
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default DashboardOverview;
