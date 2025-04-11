import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import EC2Table from '../components/EC2Table';
import IAMUsers from '../components/IAMUsers';
import S3Table from '../components/S3Table';
import Typography from '@mui/material/Typography';
import axios from 'axios';

function AWSResources({ instances, users, onInstanceAction, onRotateKey }) {
  const [tab, setTab] = useState(0);
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    axios.get('/api/s3-buckets')
      .then(res => setBuckets(res.data))
      .catch(() => setBuckets([]));
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
        <Tab label="EC2" />
        <Tab label="IAM" />
        <Tab label="S3" />
      </Tabs>
      <Box sx={{ p: 3 }}>
        {tab === 0 && <EC2Table instances={instances} onAction={onInstanceAction} />}
        {tab === 1 && <IAMUsers users={users} onRotateKey={onRotateKey} />}
        {tab === 2 && <S3Table buckets={buckets} />}
      </Box>
    </Box>
  );
}

export default AWSResources;