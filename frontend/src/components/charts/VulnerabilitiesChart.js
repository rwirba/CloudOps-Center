import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8B0000', '#FF3B3B', '#FFD700'];

const VulnerabilitiesChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      axios.get('/api/stats')
        .then(res => {
          const vuln = res.data.vuln;
          setData([
            { name: 'Critical', value: vuln.critical },
            { name: 'High', value: vuln.high },
            { name: 'Medium', value: vuln.medium }
          ]);
        })
        .catch(err => console.error('Vuln stats error:', err));
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" outerRadius={100} innerRadius={60}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={COLORS[idx]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default VulnerabilitiesChart;
