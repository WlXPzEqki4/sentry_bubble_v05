
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
      // Using raw SQL query for dates since the table isn't in the TypeScript types
      const { data: dateData, error: dateError } = await supabase
        .rpc('get_dates_from_narratives_virality');
      
      if (dateError) throw new Error(dateError.message);
      
      const uniqueDates = dateData ? Array.from(new Set(dateData.map((item: any) => item.date))).filter(Boolean) : [];
      setAvailableDates(uniqueDates);
      if (uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0]);
      }

      // Using raw SQL query for windows
      const { data: windowData, error: windowError } = await supabase
        .rpc('get_windows_from_narratives_virality');
      
      if (windowError) throw new Error(windowError.message);
      
      const uniqueWindows = windowData ? Array.from(new Set(windowData.map((item: any) => item.window))).filter(Boolean) : [];
      setAvailableWindows(uniqueWindows);
      if (uniqueWindows.length > 0) {
        setSelectedWindow(uniqueWindows[0]);
      }
    } catch (err: any) {
      console.error('Error fetching filter options:', err);
      setError('Failed to load filter options');
    }
  };

  // Fetch narratives data based on selected filters
  const fetchNarrativesData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using raw SQL query with parameters
      const { data, error } = await supabase
        .rpc('get_narratives_by_virality', { 
          p_date: selectedDate,
          p_window: selectedWindow
        });
      
      if (error) throw new Error(error.message);
      
      // Transform the data to match our interface
      const formattedData: NarrativeData[] = (data || []).map((item: any, index: number) => ({
        id: index + 1, // Add an ID for each row
        narrative: item.narrative || '',
        percentage: item.percentage || 0,
        date: item.date || '',
        window: item.window || ''
      }));
      
      setNarrativesData(formattedData);
    } catch (err: any) {
      console.error('Error fetching narratives data:', err);
      setError('Failed to load narratives data');
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
