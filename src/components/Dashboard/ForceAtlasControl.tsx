
import React, { useState, useEffect } from "react";
import { useSetSettings, useRegisterEvents, useSigma } from "@react-sigma/core";
import { LayoutForceAtlas2Control } from "@react-sigma/layout-forceatlas2";

export const ForceAtlasControl = () => {
  const [running, setRunning] = useState(false);
  const sigma = useSigma();
  const setSettings = useSetSettings();
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    // Auto-start layout after a short delay
    const timer = setTimeout(() => {
      setRunning(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Register the stopForceAtlas2 event
    registerEvents({
      // This event is triggered when sigma's container is double-clicked
      doubleClickStage: () => {
        setRunning(false);
      },
    });
  }, [registerEvents]);

  return (
    <div>
      <LayoutForceAtlas2Control
        settings={{
          slowDown: 10,
          strongGravityMode: true,
          gravity: 1,
          barnesHutOptimize: true,
          barnesHutTheta: 0.5,
        }}
        isRunning={running}
      />
      <button
        className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
        onClick={() => setRunning(!running)}
        title={running ? "Stop layout" : "Start layout"}
      >
        {running ? "Stop Layout" : "Start Layout"}
      </button>
    </div>
  );
};
