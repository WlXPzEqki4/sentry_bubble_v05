
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Select Network:</span>
      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {networkOptions.length > 0 ? (
            networkOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
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
