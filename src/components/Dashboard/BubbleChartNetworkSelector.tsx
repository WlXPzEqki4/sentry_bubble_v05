
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NetworkOption } from '@/hooks/use-bubble-chart-networks';

interface BubbleChartNetworkSelectorProps {
  networkOptions: NetworkOption[];
  selectedNetwork: string;
  setSelectedNetwork: (networkId: string) => void;
  isLoading: boolean;
}

const BubbleChartNetworkSelector: React.FC<BubbleChartNetworkSelectorProps> = ({
  networkOptions,
  selectedNetwork,
  setSelectedNetwork,
  isLoading
}) => {
  if (isLoading) {
    return <Skeleton className="h-9 w-[180px]" />;
  }

  // Function to normalize classification strings for consistent handling
  const normalizeClassification = (classification: string): string => {
    if (!classification) return '';
    return classification
      .toLowerCase()
      .replace(/[_\s-]+/g, '') // Remove all underscores, spaces, and hyphens
      .trim();
  };

  // Function to render the classification icon
  const renderClassificationIcon = (classification: string) => {
    const normalizedClass = normalizeClassification(classification);
    
    if (normalizedClass === 'topsecret') {
      return <Lock className="h-4 w-4 text-red-500" />;
    } else if (normalizedClass === 'secret') {
      return <Shield className="h-4 w-4 text-amber-500" />;
    } else {
      return <Globe className="h-4 w-4 text-green-500" />;
    }
  };

  // Function to render the classification badge
  const renderClassificationBadge = (classification: string) => {
    const normalizedClass = normalizeClassification(classification);
    
    if (normalizedClass === 'topsecret') {
      return (
        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-300">
          Top Secret
        </Badge>
      );
    } else if (normalizedClass === 'secret') {
      return (
        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
          Secret
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
          Unclassified
        </Badge>
      );
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Select Network:</span>
      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {networkOptions.length > 0 ? (
            networkOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <div className="flex items-center">
                  <span className="mr-2">{renderClassificationIcon(option.classification_level)}</span>
                  <span>{option.name}</span>
                  {renderClassificationBadge(option.classification_level)}
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No networks available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BubbleChartNetworkSelector;
