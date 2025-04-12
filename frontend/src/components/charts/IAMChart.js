import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00FF88', '#FFD700', '#FF0000'];

const IAMChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      axios.get('/api/stats')
        .then(res => {
          const iam = res.data.iam;
          setData([
            { name: '0–30d', value: iam.green },
            { name: '31–60d', value: iam.yellow },
            { name: '60+d', value: iam.red }
          ]);
        })
        .catch(err => console.error('IAM stats error:', err));
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

export default IAMChart;
