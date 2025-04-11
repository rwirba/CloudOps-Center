import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import axios from 'axios';

function S3Table() {
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    axios.get('/api/s3-buckets').then(res => {
      setBuckets(res.data || []);
    }).catch(() => setBuckets([]));
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>S3 Buckets</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Creation Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buckets.map((bucket, idx) => (
            <TableRow key={idx}>
              <TableCell>{bucket.Name}</TableCell>
              <TableCell>{new Date(bucket.CreationDate).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default S3Table;
