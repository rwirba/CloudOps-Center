import React from 'react';
import { Box, Drawer, List, ListItem, ListItemText, ListItemIcon, Toolbar, CssBaseline, Typography, AppBar, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import LockIcon from '@mui/icons-material/Lock';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            DevOps Control Tower
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/resources')}>
            <ListItemIcon><StorageIcon /></ListItemIcon>
            <ListItemText primary="AWS Resources" />
          </ListItem>
          <ListItem button onClick={() => navigate('/scan')}>
            <ListItemIcon><LockIcon /></ListItemIcon>
            <ListItemText primary="Vulnerabilities" />
          </ListItem>
          <ListItem button onClick={() => navigate('/repos')}>
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="GitHub" />
          </ListItem>
          <ListItem button onClick={() => navigate('/pods')}>
            <ListItemIcon><LayersIcon /></ListItemIcon>
            <ListItemText primary="K8s Pods" />
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;