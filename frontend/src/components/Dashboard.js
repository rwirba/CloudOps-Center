import React from 'react';
import { Card, CardContent } from '@mui/material';
import EC2Chart from './charts/EC2Chart';
import IAMChart from './charts/IAMChart';
import PodsChart from './charts/PodsChart';
import VulnerabilitiesChart from './charts/VulnerabilitiesChart';

const Dashboard = () => {
  return (
    <>
      {/* Embedded grid styling */}
      <style>
        {`
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
          }
        `}
      </style>

      <div className="grid p-4">
        <Card className="rounded-2xl shadow-xl">
          <CardContent>
            <h2 className="text-white text-lg font-semibold mb-2">EC2 Instances</h2>
            <EC2Chart />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl">
          <CardContent>
            <h2 className="text-white text-lg font-semibold mb-2">IAM Key Age</h2>
            <IAMChart />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl">
          <CardContent>
            <h2 className="text-white text-lg font-semibold mb-2">Kubernetes Pods</h2>
            <PodsChart />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl">
          <CardContent>
            <h2 className="text-white text-lg font-semibold mb-2">Vulnerabilities</h2>
            <VulnerabilitiesChart />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
