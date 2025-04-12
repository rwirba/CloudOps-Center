import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00FF88', '#FF6347'];

const PodsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      axios.get('/api/stats')
        .then(res => {
          const pods = res.data.pods;
          setData([
            { name: 'Running', value: pods.running },
            { name: 'Failed', value: pods.failed }
          ]);
        })
        .catch(err => console.error('Pods stats error:', err));
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

export default PodsChart;
