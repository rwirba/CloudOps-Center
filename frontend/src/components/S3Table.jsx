import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function S3Table({ buckets }) {
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
          {buckets.map((bucket, index) => (
            <TableRow key={index}>
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