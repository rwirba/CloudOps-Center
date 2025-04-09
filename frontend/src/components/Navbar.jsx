import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CloudOps Center
        </Typography>
        <Button color="inherit" href="/dashboard">Dashboard</Button>
        <Button color="inherit" href="/repos">GitHub</Button>
        <Button color="inherit" href="/alarms">CloudWatch</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;