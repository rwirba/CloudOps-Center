import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Link } from '@mui/material';

function GitHubRepos({ username }) {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    axios.get(`https://api.github.com/users/${username}/repos`) // optional auth header for private
      .then(res => setRepos(res.data));
  }, [username]);

  return (
    <Grid container spacing={2} sx={{ mt: 4 }}>
      {repos.map(repo => (
        <Grid item xs={12} md={4} key={repo.id}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">{repo.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {repo.description}
              </Typography>
              <Link href={repo.html_url} target="_blank" rel="noopener">View on GitHub</Link>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default GitHubRepos;