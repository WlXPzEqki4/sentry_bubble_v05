
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import DataTable from '@/components/Dashboard/Charts/DataTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface NarrativesTableProps {
  className?: string;
}

interface NarrativeData {
  id: number;
  narrative: string;
  percentage: number;
  date: string;
  window: string;
}

// Define the expected response types from our Supabase functions
interface DateItem {
  date: string;
}

interface WindowItem {
  window: string;
}

interface NarrativeItem {
  narrative: string;
  percentage: number;
  date: string;
  window: string;
}

const NarrativesTable: React.FC<NarrativesTableProps> = ({ className = "" }) => {
  const [narrativesData, setNarrativesData] = useState<NarrativeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableWindows, setAvailableWindows] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedWindow, setSelectedWindow] = useState<string>("");

  // Fetch unique dates and windows for dropdown filters
  const fetchFilterOptions = async () => {
    try {
      console.log("Fetching date options...");
      
      // Use the rpc method correctly
      const { data: dateData, error: dateError } = await supabase.rpc(
        'get_dates_from_narratives_virality'
      );
      
      if (dateError) {
        console.error("Date fetch error:", dateError);
        throw new Error(dateError.message);
      }
      
      console.log("Date data received:", dateData);
      
      if (Array.isArray(dateData)) {
        // Type assertion to handle dates correctly
        const uniqueDates = (dateData as DateItem[])
          .map(item => item.date)
          .filter(Boolean) as string[];
        
        console.log("Processed unique dates:", uniqueDates);
        setAvailableDates(uniqueDates);
        
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        }
      } else {
        console.error("Expected array for date data but received:", typeof dateData);
        throw new Error("Invalid date data format received");
      }

      console.log("Fetching window options...");
      
      // Use the rpc method correctly for windows
      const { data: windowData, error: windowError } = await supabase.rpc(
        'get_windows_from_narratives_virality'
      );
      
      if (windowError) {
        console.error("Window fetch error:", windowError);
        throw new Error(windowError.message);
      }
      
      console.log("Window data received:", windowData);
      
      if (Array.isArray(windowData)) {
        // Type assertion to handle window data correctly
        const uniqueWindows = (windowData as WindowItem[])
          .map(item => item.window)
          .filter(Boolean) as string[];
        
        console.log("Processed unique windows:", uniqueWindows);
        setAvailableWindows(uniqueWindows);
        
        if (uniqueWindows.length > 0) {
          setSelectedWindow(uniqueWindows[0]);
        }
      } else {
        console.error("Expected array for window data but received:", typeof windowData);
        throw new Error("Invalid window data format received");
      }
    } catch (err: any) {
      console.error('Error fetching filter options:', err);
      setError('Failed to load filter options');
      toast({
        title: "Error loading filters",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  };

  // Fetch narratives data based on selected filters
  const fetchNarrativesData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching narratives data with params:", { 
        date: selectedDate, 
        window: selectedWindow 
      });
      
      // Using the rpc method correctly with params
      const { data, error } = await supabase.rpc(
        'get_narratives_by_virality',
        { 
          p_date: selectedDate,
          p_window: selectedWindow
        }
      );
      
      if (error) {
        console.error("Narratives fetch error:", error);
        throw new Error(error.message);
      }
      
      console.log("Narratives data received:", data);
      
      // Transform the data to match our interface with proper typing
      if (Array.isArray(data)) {
        const formattedData: NarrativeData[] = (data as NarrativeItem[]).map((item, index) => ({
          id: index + 1,
          narrative: item.narrative || '',
          percentage: item.percentage || 0,
          date: item.date || '',
          window: item.window || ''
        }));
        
        console.log("Formatted narratives data:", formattedData);
        setNarrativesData(formattedData);
      } else {
        console.error("Expected array for narrative data but received:", typeof data);
        setNarrativesData([]);
      }
    } catch (err: any) {
      console.error('Error fetching narratives data:', err);
      setError('Failed to load narratives data');
      toast({
        title: "Error loading narratives",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize by fetching filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (selectedDate || selectedWindow) {
      fetchNarrativesData();
    }
  }, [selectedDate, selectedWindow]);

  // Table columns configuration
  const columns = [
    {
      key: 'narrative',
      header: 'Narrative',
      render: (value: string, item: NarrativeData) => {
        // Format as "1. Narrative Text (XX%)"
        return (
          <div className="flex items-start">
            <span className="mr-1">{item.id}.</span>
            <span>{value} <span className="font-medium">({item.percentage}%)</span></span>
          </div>
        );
      }
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-lg font-medium mb-1">Top Narratives by Virality</h3>
          <p className="text-sm text-gray-500">Most viral narratives based on social media engagement</p>
        </div>
        <div className="flex gap-3">
          {/* Date selector */}
          <div className="w-40">
            <Select 
              value={selectedDate} 
              onValueChange={setSelectedDate}
              disabled={isLoading || availableDates.length === 0}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map(date => (
                  <SelectItem key={date} value={date}>{date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Window selector */}
          <div className="w-40">
            <Select 
              value={selectedWindow} 
              onValueChange={setSelectedWindow}
              disabled={isLoading || availableWindows.length === 0}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select window" />
              </SelectTrigger>
              <SelectContent>
                {availableWindows.map(window => (
                  <SelectItem key={window} value={window}>{window}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Render the DataTable with narratives data */}
      {error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>
      ) : (
        <DataTable 
          data={narrativesData}
          columns={columns}
          title=""
          className="w-full"
          pageSize={15}
        />
      )}
    </div>
  );
};

export default NarrativesTable;
