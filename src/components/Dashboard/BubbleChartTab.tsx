
import React from 'react';
import BubbleChartNetworkSelector from './BubbleChartNetworkSelector';
import BubbleChartVisualization from './BubbleChartVisualization';
import { useBubbleChartNetworks } from '@/hooks/use-bubble-chart-networks';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BubbleChartTabProps {
  userClassificationLevel?: string;
}

const BubbleChartTab: React.FC<BubbleChartTabProps> = ({ userClassificationLevel = 'unclassified' }) => {
  const {
    networkOptions,
    selectedNetwork,
    setSelectedNetwork,
    isLoading: networksLoading,
    error: networksError
  } = useBubbleChartNetworks(userClassificationLevel);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Network Bubble Chart</h2>
          <p className="text-sm text-gray-500">
            Interactive visualization of weighted network connections with community detection
          </p>
        </div>

        <BubbleChartNetworkSelector 
          networkOptions={networkOptions}
          selectedNetwork={selectedNetwork}
          setSelectedNetwork={setSelectedNetwork}
          isLoading={networksLoading}
        />
      </div>

      <Alert variant="default" className="bg-gray-50 border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
          <AlertTitle>Demo Visualization</AlertTitle>
        </div>
        <AlertDescription>
          This visualization is using demo network data based on your selection. Node size represents importance, 
          colors represent family/group affiliations, and edge thickness represents relationship strength.
        </AlertDescription>
      </Alert>

      {networksError ? (
        <div className="p-8 text-center">
          <p className="text-red-500">Error loading networks: {networksError.message}</p>
        </div>
      ) : (
        <BubbleChartVisualization 
          selectedNetwork={selectedNetwork}
          userClassificationLevel={userClassificationLevel}
        />
      )}
    </div>
  );
};

export default BubbleChartTab;
