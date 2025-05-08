
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Info, Facebook, Instagram, Twitter, TikTok } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface PostInfoCardsProps {
  date: string;
  window: string;
  className?: string;
}

// Interface for our UI component's state
interface PlatformData {
  platform: string;
  icon: React.ReactNode;
  total_interactions: number;
  metrics: Array<{
    name: string;
    value: number | string;
  }>;
  reactions?: Array<{
    name: string;
    emoji: string;
    value: number;
  }>;
}

// Interface for raw data from Supabase
interface PostInfoData {
  Platform: string;
  Date: string;
  Window: string | number;
  Total_Interactions: number;
  Reposts?: number;
  Retruths?: number;
  Shares?: number;
  Quote_Posts?: number;
  Comments?: number;
  Likes?: number;
  Replies?: number;
  Posts?: number;
  Views?: number;
  Forwards?: number;
  Reactions?: number;
  Like_Count?: number;
  Love_Count?: number;
  Haha_Count?: number;
  Wow_Count?: number;
  Sad_Count?: number;
  Angry_Count?: number;
}

const PostInfoCards: React.FC<PostInfoCardsProps> = ({ date, window, className = "" }) => {
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the appropriate icon based on platform name
  const getPlatformIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-6 w-6 text-blue-500" />;
      case 'instagram':
        return <Instagram className="h-6 w-6 text-pink-500" />;
      case 'x':
        return <Twitter className="h-6 w-6" />;
      case 'telegram':
        return <span className="flex items-center justify-center h-6 w-6 text-blue-400 font-bold">T</span>;
      case 'tik tok':
        return <TikTok className="h-6 w-6" />;
      case 'truth social':
        return <span className="flex items-center justify-center h-6 w-6 text-blue-600 font-bold">T</span>;
      case 'gab':
        return <span className="flex items-center justify-center h-6 w-6 text-green-500 font-bold">G</span>;
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  // Transform raw data into the format we need for display
  const transformData = (data: PostInfoData[]): PlatformData[] => {
    return data.map(item => {
      const platformData: PlatformData = {
        platform: item.Platform,
        icon: getPlatformIcon(item.Platform),
        total_interactions: item.Total_Interactions,
        metrics: []
      };

      // Add metrics based on what's available in the data
      if (item.Reposts) platformData.metrics.push({ name: 'Reposts', value: item.Reposts });
      if (item.Retruths) platformData.metrics.push({ name: 'Retruths', value: item.Retruths });
      if (item.Shares) platformData.metrics.push({ name: 'Shares', value: item.Shares });
      if (item.Quote_Posts) platformData.metrics.push({ name: 'Quote Posts', value: item.Quote_Posts });
      if (item.Comments) platformData.metrics.push({ name: 'Comments', value: item.Comments });
      if (item.Likes) platformData.metrics.push({ name: 'Likes', value: item.Likes });
      if (item.Replies) platformData.metrics.push({ name: 'Replies', value: item.Replies });
      if (item.Posts) platformData.metrics.push({ name: 'Posts', value: item.Posts });
      if (item.Views) platformData.metrics.push({ name: 'Views', value: item.Views.toLocaleString() });
      if (item.Forwards) platformData.metrics.push({ name: 'Forwards', value: item.Forwards });
      if (item.Reactions) platformData.metrics.push({ name: 'Reactions', value: item.Reactions });

      // Add reaction data if available
      if (item.Like_Count || item.Love_Count || item.Haha_Count || item.Wow_Count || item.Sad_Count || item.Angry_Count) {
        platformData.reactions = [];
        
        if (item.Like_Count) platformData.reactions.push({ name: 'Like', emoji: '👍', value: item.Like_Count });
        if (item.Love_Count) platformData.reactions.push({ name: 'Love', emoji: '❤️', value: item.Love_Count });
        if (item.Haha_Count) platformData.reactions.push({ name: 'Haha', emoji: '😄', value: item.Haha_Count });
        if (item.Wow_Count) platformData.reactions.push({ name: 'Wow', emoji: '😲', value: item.Wow_Count });
        if (item.Sad_Count) platformData.reactions.push({ name: 'Sad', emoji: '😢', value: item.Sad_Count });
        if (item.Angry_Count) platformData.reactions.push({ name: 'Angry', emoji: '😠', value: item.Angry_Count });
      }

      return platformData;
    });
  };

  // Fetch post info data from Supabase
  const fetchPostInfo = async () => {
    if (!date || !window) {
      console.log("Missing date or window parameter, skipping fetch");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching post info data with params:", { date, window });
      
      // Use type assertion for the table query
      const response = await supabase
        .from('post_info' as any)
        .select('*')
        .eq('Date', date)
        .eq('Window', window) as unknown as {
          data: PostInfoData[] | null,
          error: any
        };
      
      if (response.error) {
        console.error("Post info fetch error:", response.error);
        throw new Error(response.error.message);
      }
      
      const data = response.data || [];
      console.log("Post info data received:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        // Transform and set the platforms data
        const transformedData = transformData(data);
        setPlatforms(transformedData);
      } else {
        console.log("No post info data found for the selected date and window");
        setPlatforms([]);
      }
    } catch (err: any) {
      console.error('Error fetching post info data:', err);
      setError('Failed to load post information');
      toast({
        title: "Error loading post data",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when date or window changes
  useEffect(() => {
    if (date && window) {
      fetchPostInfo();
    }
  }, [date, window]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Post Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse h-64 flex flex-col">
              <div className="bg-gray-200 h-6 w-32 mb-4 rounded"></div>
              <div className="bg-gray-200 h-6 w-24 mb-2 rounded"></div>
              <div className="space-y-2 mt-2">
                <div className="bg-gray-200 h-4 w-full rounded"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Post Info</h3>
        <Card className="p-4 text-red-500 bg-red-50">
          {error}
        </Card>
      </div>
    );
  }

  if (platforms.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Post Info</h3>
        <Card className="p-4 text-gray-500">
          No post data available for the selected date and window.
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium mb-1">Post Info</h3>
        <p className="text-sm text-gray-500">
          Social media interactions across platforms for the selected timeframe
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, index) => (
          <Card key={index} className="p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {platform.icon}
                <span className="font-semibold">{platform.platform}</span>
              </div>
              <Badge variant="outline" className="ml-2 font-semibold">
                {platform.total_interactions.toLocaleString()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {platform.metrics.map((metric, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{metric.name}</span>
                  <span className="font-medium">{metric.value}</span>
                </div>
              ))}
            </div>
            
            {platform.reactions && platform.reactions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {platform.reactions.map((reaction, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span>{reaction.emoji}</span>
                    <span className="text-sm">{reaction.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostInfoCards;
