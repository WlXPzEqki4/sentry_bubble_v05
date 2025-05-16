
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface BubbleChartNodeDetailsProps {
  node: {
    id: string;
    data: any;
  };
  onClose: () => void;
}

const BubbleChartNodeDetails: React.FC<BubbleChartNodeDetailsProps> = ({ node, onClose }) => {
  const { data } = node;

  // Function to get human-readable community name
  const getCommunityName = (communityId: string | number | undefined) => {
    if (communityId === undefined) return 'Unknown';
    
    const communities: Record<string, string> = {
      '0': 'Core Group',
      '1': 'Intelligence',
      '2': 'Operations',
      '3': 'Logistics',
      '4': 'Communications',
      '5': 'Command',
      '6': 'Security',
      '7': 'External Relations'
    };
    
    return communities[String(communityId)] || `Group ${communityId}`;
  };

  return (
    <Card className="relative p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{data.label}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Community</p>
          <Badge variant="outline" className="mt-1">
            {getCommunityName(data.community)}
          </Badge>
        </div>
        
        {data.size !== undefined && (
          <div>
            <p className="text-sm text-gray-500">Centrality/Influence</p>
            <p className="font-medium">{parseFloat(data.size.toFixed(2))}</p>
          </div>
        )}
        
        {data.description && (
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm mt-1">{data.description}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-500">ID</p>
          <p className="text-xs font-mono text-gray-500 mt-1">{node.id}</p>
        </div>
        
        {data.originalData && Object.entries(data.originalData).filter(([key]) => 
          !['label', 'size', 'community', 'description', 'color'].includes(key)
        ).map(([key, value]) => (
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
