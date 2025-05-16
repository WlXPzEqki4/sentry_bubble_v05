
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Enhanced function to handle tab changes without scrolling
  const handleTabChange = (value: string) => {
    // Immediately prevent any scrolling
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
    
    // Also apply after a short timeout to catch delayed scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }, 10);
  };
  
  // Add an effect to maintain scroll position
  useEffect(() => {
    const maintainScrollPosition = () => {
      window.scrollTo(0, 0);
    };
    
    // Run on mount
    maintainScrollPosition();
    
    // Return cleanup function
    return () => {};
  }, []);

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
