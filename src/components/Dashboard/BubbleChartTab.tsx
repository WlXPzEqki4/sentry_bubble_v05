
import React from 'react';
import BubbleChartNetworkSelector from './BubbleChartNetworkSelector';
import BubbleChartVisualization from './BubbleChartVisualization';
import { useBubbleChartNetworks } from '@/hooks/use-bubble-chart-networks';

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

  // Display user classification level in console for debugging
  React.useEffect(() => {
    console.log(`BubbleChartTab - User classification level: ${userClassificationLevel}`);
    console.log(`Available network options: ${networkOptions.length}`);
  }, [userClassificationLevel, networkOptions]);

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

      {networksError ? (
        <div className="p-8 text-center">
          <p className="text-red-500">Error loading networks: {networksError.message}</p>
        </div>
      ) : networkOptions.length === 0 && !networksLoading ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">No networks available for your classification level ({userClassificationLevel}).</p>
          <p className="text-sm text-gray-500 mt-2">Network data is currently using demo visualization only.</p>
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
