import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import GitHubRepos from './components/GitHubRepos';
import AWSResources from './pages/AWSResources';
import TrivyScan from './components/TrivyScan';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  const [instances, setInstances] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/instances').then(res => {
      setInstances(res.data.Reservations.flatMap(r => r.Instances));
    });
    axios.get('/api/iam-users').then(res => {
      setUsers(res.data.Users);
    });
  }, []);

  const handleInstanceAction = (action, instanceId) => {
    axios.post(`/api/${action}`, { instanceId });
  };

  const handleRotateKey = (userName) => {
    axios.post('/api/rotate-access-key', { userName });
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/resources" element={<AWSResources instances={instances} users={users} onInstanceAction={handleInstanceAction} onRotateKey={handleRotateKey} />} />
            <Route path="/repos" element={<GitHubRepos username="rwirba" />} />
            <Route path="/scan" element={<TrivyScan />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
