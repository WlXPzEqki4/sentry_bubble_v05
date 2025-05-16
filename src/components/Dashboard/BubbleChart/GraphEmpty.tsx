
import React from 'react';

const GraphEmpty: React.FC = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <p className="text-gray-500">No data available for this network.</p>
    </div>
  );
};

export default GraphEmpty;
