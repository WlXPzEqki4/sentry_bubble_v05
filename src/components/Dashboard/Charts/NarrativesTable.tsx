
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

// Interface for our UI component's state
interface NarrativeData {
  id: number;
  narrative: string;
  percentage: number;
  date: string;
  window: string;
}

// Type definition matching Supabase table with correct capitalization
type TopNarrativesByVirality = {
  UUID: string | number;
  Set: number;
  Date: string;
  Window: string;
  Narrative: string;
  Percentage: string;
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
      
      // Using type assertion to bypass TypeScript errors
      const { data: dateData, error: dateError } = await supabase
        .from('top_narratives_by_virality' as any)
        .select('Date')
        .order('Date', { ascending: false });
      
      if (dateError) {
        console.error("Date fetch error:", dateError);
        throw new Error(dateError.message);
      }
      
      console.log("Date data received:", dateData);
      
      // Get unique dates
      if (Array.isArray(dateData)) {
        const datesSet = new Set<string>();
        dateData.forEach(item => {
          if (item.Date) datesSet.add(item.Date);
        });
        
        const uniqueDates = Array.from(datesSet);
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
      
      // Using type assertion for window data
      const { data: windowData, error: windowError } = await supabase
        .from('top_narratives_by_virality' as any)
        .select('Window')
        .order('Window');
      
      if (windowError) {
        console.error("Window fetch error:", windowError);
        throw new Error(windowError.message);
      }
      
      console.log("Window data received:", windowData);
      
      // Get unique windows
      if (Array.isArray(windowData)) {
        const windowsSet = new Set<string>();
        windowData.forEach(item => {
          if (item.Window) windowsSet.add(item.Window);
        });
        
        const uniqueWindows = Array.from(windowsSet);
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
      
      // Using type assertion for the main query
      const { data, error } = await supabase
        .from('top_narratives_by_virality' as any)
        .select('Narrative, Percentage, Date, Window')
        .eq('Date', selectedDate)
        .eq('Window', selectedWindow)
        .order('Percentage', { ascending: false });
      
      if (error) {
        console.error("Narratives fetch error:", error);
        throw new Error(error.message);
      }
      
      console.log("Narratives data received:", data);
      
      if (Array.isArray(data)) {
        // Type the data and convert to our UI format with lowercase properties
        const formattedData: NarrativeData[] = (data as unknown as TopNarrativesByVirality[]).map((item, index) => ({
          id: index + 1,
          narrative: String(item.Narrative || ''),
          // Convert percentage from string to number if needed
          percentage: typeof item.Percentage === 'string' ? 
            parseFloat(item.Percentage.replace('%', '')) : 
            Number(item.Percentage) || 0,
          date: item.Date || '',
          window: String(item.Window || '')
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
    if (selectedDate && selectedWindow) {
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
