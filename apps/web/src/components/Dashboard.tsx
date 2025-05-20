import React from 'react';
import { trpc } from '../utils/trpc';

const Dashboard: React.FC = () => {
  const { data, isLoading } = trpc.getMetrics.useQuery();

  if (isLoading || !data) {
    return <div className="bg-black text-terminal-green p-4">Loading...</div>;
  }

  return (
    <div className="bg-black text-terminal-green p-4 border" style={{ borderColor: '#00FF00' }}>
      <h2 className="text-xl mb-2">Dream Metrics</h2>
      <div>Total Dreams Logged: {data.dreamsLoggedTotal}</div>
      <div>Recent Dream Gifts: {data.dreamGiftsRecent}</div>
    </div>
  );
};

export default Dashboard;
