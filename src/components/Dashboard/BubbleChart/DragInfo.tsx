
import React from 'react';
import { Move } from 'lucide-react';

const DragInfo: React.FC = () => {
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-md shadow-sm flex items-center">
      <Move className="h-4 w-4 text-gray-500 mr-2" />
      <span className="text-xs text-gray-500">Click and drag nodes to reposition</span>
    </div>
  );
};

export default DragInfo;
