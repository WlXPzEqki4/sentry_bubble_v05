
import React from 'react';

interface GraphLegendProps {
  legends: Array<{color: string, label: string}>;
}

const GraphLegend: React.FC<GraphLegendProps> = ({ legends }) => {
  return (
    <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
      {legends.map((item, index) => (
        <div key={index} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: item.color }}
          ></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default GraphLegend;
