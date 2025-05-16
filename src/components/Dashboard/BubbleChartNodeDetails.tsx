
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getFamilyColor } from '@/utils/colors';

interface BubbleChartNodeDetailsProps {
  node: any;
  onClose: () => void;
}

const BubbleChartNodeDetails: React.FC<BubbleChartNodeDetailsProps> = ({ node, onClose }) => {
  const { data } = node;
  const nodeColor = getFamilyColor(data?.family || 'Neutral');

  return (
    <Card className="relative p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{data?.label || 'Unknown Node'}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {data?.family && (
          <div>
            <p className="text-sm text-gray-500">Family/Group</p>
            <Badge 
              variant="outline" 
              className="mt-1" 
              style={{ borderColor: nodeColor, color: nodeColor }}
            >
              {data.family}
            </Badge>
          </div>
        )}
        
        {data?.size !== undefined && (
          <div>
            <p className="text-sm text-gray-500">Size/Importance</p>
            <p className="font-medium">{parseFloat(data.size.toFixed(2))}</p>
          </div>
        )}
        
        {data?.description && (
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm mt-1">{data.description}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-500">ID</p>
          <p className="text-xs font-mono text-gray-500 mt-1">{node.id}</p>
        </div>
        
        {data?.additionalData && Object.entries(data.additionalData).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
            <p className="text-sm mt-1">{String(value)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BubbleChartNodeDetails;
