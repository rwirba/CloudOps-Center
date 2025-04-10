import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

function CloudWatchChart({ instanceId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`/api/metrics/${instanceId}`).then(res => {
      const points = res.data.Datapoints.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
      setData({
        labels: points.map(p => new Date(p.Timestamp).toLocaleTimeString()),
        datasets: [{
          label: 'CPU Utilization %',
          data: points.map(p => p.Average),
          borderColor: 'rgba(75,192,192,1)',
          fill: false
        }]
      });
    });
  }, [instanceId]);

  return data ? (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2">CPU Utilization</Typography>
      <Line data={data} />
    </Box>
  ) : null;
}

export default CloudWatchChart;