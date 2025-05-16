
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BubbleChartNetworkSelector from './BubbleChartNetworkSelector';
import BubbleChartVisualization from './BubbleChartVisualization';
import { useBubbleChartNetworks } from '@/hooks/use-bubble-chart-networks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

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

  // Effect to check if tables exist and populate if needed
  useEffect(() => {
    const checkAndPopulateBubbleChartData = async () => {
      try {
        // First check if the bubble_chart_networks table exists
        const { data: tableExists, error: tableError } = await supabase
          .from('bubble_chart_networks')
          .select('id')
          .limit(1);
        
        if (tableError) {
          console.error('Error checking bubble chart tables:', tableError);
          // Tables might not exist yet
          toast.warning('Setting up network visualization data...');
          
          // Try to call the Edge Function to populate data
          try {
            const { data, error } = await supabase.functions.invoke('populate-bubble-charts');
            
            if (error) {
              console.error('Error populating bubble chart data:', error);
              // Only show toast for non-404 errors, as 404 is expected if the function doesn't exist yet
              if (!error.message.includes('404')) {
                toast.error('Could not populate demo network data');
              }
            } else if (data) {
              console.log('Bubble chart data:', data);
              if (data.success) {
                toast.success('Network data loaded successfully');
              }
            }
          } catch (err) {
            console.error('Error invoking populate function:', err);
          }
        } else if (!tableExists || tableExists.length === 0) {
          // Table exists but is empty
          toast.warning('Populating network visualization data...');
          
          try {
            const { data, error } = await supabase.functions.invoke('populate-bubble-charts');
            
            if (error) {
              console.error('Error populating bubble chart data:', error);
              toast.error('Could not populate network data');
            } else if (data && data.success) {
              toast.success('Network data loaded successfully');
            }
          } catch (err) {
            console.error('Error invoking populate function:', err);
          }
        } else {
          console.log('Bubble chart tables exist and contain data');
        }
      } catch (err) {
        console.error('Error checking bubble chart tables:', err);
      }
    };
    
    checkAndPopulateBubbleChartData();
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
