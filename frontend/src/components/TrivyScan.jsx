import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableCell, TableRow, TableBody, TableHead, TableContainer, Paper, Typography } from '@mui/material';

function TrivyScan() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get('/api/vulnerabilities').then(res => setResults(res.data));
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Vulnerability Scan Results</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Target</TableCell>
            <TableCell>Package</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{item.Target}</TableCell>
              <TableCell>{item.PkgName}</TableCell>
              <TableCell>{item.Severity}</TableCell>
              <TableCell>{item.Title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TrivyScan;