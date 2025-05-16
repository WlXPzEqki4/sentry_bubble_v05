
import React, { useEffect, useState } from "react";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { Button } from "@/components/ui/button";
import { Panel } from "@react-sigma/core";

export const ForceAtlasControl = () => {
  const { start, stop, isRunning, kill } = useWorkerLayoutForceAtlas2({
    settings: {
      barnesHutOptimize: true,
      slowDown: 10,
      strongGravityMode: true,
      gravity: 1,
      scalingRatio: 10,
      linLogMode: false,
    },
  });

  // Auto-start the layout on mount and stop after a short time
  useEffect(() => {
    start();
    const timer = setTimeout(() => {
      stop();
    }, 3000);
    return () => {
      clearTimeout(timer);
      kill();
    };
  }, [start, stop, kill]);

  return (
    <Panel position="bottom-left">
      <div className="bg-white p-2 rounded-md shadow-sm">
        <Button 
          onClick={isRunning ? stop : start}
          variant={isRunning ? "destructive" : "default"}
          size="sm"
        >
          {isRunning ? "Stop Layout" : "Apply Layout"}
        </Button>
      </div>
    </Panel>
  );
};
