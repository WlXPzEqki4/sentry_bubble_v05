
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const GraphLoading: React.FC = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Skeleton className="h-[400px] w-[90%] rounded-md" />
    </div>
  );
};

export default GraphLoading;
