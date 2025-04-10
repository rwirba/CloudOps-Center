import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import EC2Table from '../components/EC2Table';
import IAMUsers from '../components/IAMUsers';
import Typography from '@mui/material/Typography';

function AWSResources({ instances, users, onInstanceAction, onRotateKey }) {
  const [tab, setTab] = useState(0);

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
        {tab === 2 && <Typography variant="body1">S3 Bucket view coming soon...</Typography>}
      </Box>
    </Box>
  );
}

export default AWSResources;