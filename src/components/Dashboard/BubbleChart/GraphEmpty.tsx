
import React from 'react';
import { Mouse } from 'lucide-react';

const GraphEmpty: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6">
      <div className="mb-4 text-gray-400">
        <Mouse size={32} />
      </div>
      <p className="text-gray-500 text-center mb-2 font-medium">No data available for this network.</p>
      <p className="text-gray-400 text-sm text-center">Please select a different network or check if data is available.</p>
    </div>
  );
};

export default GraphEmpty;
