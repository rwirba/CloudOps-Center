import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GitHubRepos from './components/GitHubRepos';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repos" element={<GitHubRepos username="rwirba" />} />
      </Routes>
    </Router>
  );
}

export default App;
