import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardOverview({ stats }) {
  const chartBlock = (title, data, labels, colors, footer) => ({
    title,
    chartData: {
      labels,
      datasets: [{
        label: 'Count',
        data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    footer
  });

  const blocks = stats ? [
    chartBlock(
      'EC2 Instances',
      [stats.ec2.running, stats.ec2.stopped],
      ['Running', 'Stopped'],
      ['#4CAF50', '#F44336'],
      `Running: ${stats.ec2.running} | Stopped: ${stats.ec2.stopped}`
    ),
    chartBlock(
      'IAM Access Keys',
      [stats.iam.active, stats.iam.warning, stats.iam.stale],
      ['Active (0-30d)', 'Warning (31-60d)', 'Stale (60+d)'],
      ['#4CAF50', '#FFC107', '#F44336'],
      `Active: ${stats.iam.active} | Warning: ${stats.iam.warning} | Stale: ${stats.iam.stale}`
    ),
    chartBlock(
      'Kubernetes Pods',
      [stats.pods.running, stats.pods.failed],
      ['Running', 'Failed'],
      ['#4CAF50', '#F44336'],
      `Running: ${stats.pods.running} | Failed: ${stats.pods.failed}`
    ),
    chartBlock(
      'Vulnerabilities',
      [stats.vuln.critical, stats.vuln.high, stats.vuln.medium],
      ['Critical', 'High', 'Medium'],
      ['#B71C1C', '#F44336', '#FFEB3B'],
      `Critical: ${stats.vuln.critical} | High: ${stats.vuln.high} | Medium: ${stats.vuln.medium}`
    )
  ] : [];

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {blocks.map((block, idx) => (
        <Grid item xs={12} md={6} lg={3} key={idx}>
          <Paper sx={{ p: 2, backgroundColor: '#1c1c2e', height: '100%' }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              {block.title}
            </Typography>
            <div style={{ height: '180px' }}>
              <Doughnut data={block.chartData} options={{ maintainAspectRatio: false }} />
            </div>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ color: '#fff', mt: 2 }}
            >
              {block.footer}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default DashboardOverview;