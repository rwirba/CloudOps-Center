import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

function S3Buckets() {
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    axios.get('/api/s3-buckets')
      .then(res => setBuckets(res.data))
      .catch(() => setBuckets([]));
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bucket Name</TableCell>
            <TableCell>Creation Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buckets.map((b, i) => (
            <TableRow key={i}>
              <TableCell>{b.Name}</TableCell>
              <TableCell>{new Date(b.CreationDate).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default S3Buckets;