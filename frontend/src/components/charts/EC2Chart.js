import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00FF88', '#FF4500'];

const EC2Chart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      axios.get('/api/stats')
        .then(res => {
          const ec2 = res.data.ec2;
          setData([
            { name: 'Running', value: ec2.running },
            { name: 'Stopped', value: ec2.stopped }
          ]);
        })
        .catch(err => console.error('EC2 stats error:', err));
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 15000); // Auto refresh every 15s
    return () => clearInterval(interval); // Cleanup on unmount
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

export default EC2Chart;
