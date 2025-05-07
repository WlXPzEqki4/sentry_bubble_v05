
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Toggle } from '@/components/ui/toggle';
import { RotateCw, RotateCcw } from 'lucide-react';

const MapTab: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [rotationEnabled, setRotationEnabled] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with the provided token
    mapboxgl.accessToken = 'pk.eyJ1IjoiamNkZW50b24yMDUxIiwiYSI6ImNtMzVkZXJudTA5ejkya3B5NDU4Z2MyeHQifQ.aUk4eH5k3JC45Foxcbe2qQ';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 0], // Starting at [0,0] before animation
      pitch: 0, // Changed from 45 to 0 for a square look
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects for more realistic 3D appearance
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });
      
      // Animation to focus on Africa after the map loads
      setTimeout(() => {
        map.current?.flyTo({
          center: [20, 5], // Approximate center of African continent
          zoom: 2.5,
          pitch: 0, // Keep the square look during animation
          duration: 5000, // 5 seconds animation
          essential: true
        });
      }, 2000); // Wait 2 seconds before starting the animation
    });

    // Cleanup function
    return () => {
      map.current?.remove();
    };
  }, []);

  // Separate effect for handling rotation that depends on rotationEnabled state
  useEffect(() => {
    if (!map.current) return;
    
    // Rotation animation settings
    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    
    // Spin globe function
    function spinGlobe() {
      if (!map.current) return;
      
      const zoom = map.current.getZoom();
      if (rotationEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    // Event listeners for interaction
    const handleMouseDown = () => {
      userInteracting = true;
    };
    
    const handleDragStart = () => {
      userInteracting = true;
    };
    
    const handleMouseUp = () => {
      userInteracting = false;
      if (rotationEnabled) spinGlobe();
    };
    
    const handleTouchEnd = () => {
      userInteracting = false;
      if (rotationEnabled) spinGlobe();
    };

    const handleMoveEnd = () => {
      if (rotationEnabled) spinGlobe();
    };

    // Add event listeners
    map.current.on('mousedown', handleMouseDown);
    map.current.on('dragstart', handleDragStart);
    map.current.on('mouseup', handleMouseUp);
    map.current.on('touchend', handleTouchEnd);
    map.current.on('moveend', handleMoveEnd);

    // Start spinning if enabled
    if (rotationEnabled) {
      spinGlobe();
    }

    // Set up interval for continuous rotation when enabled
    const rotationInterval = setInterval(() => {
      if (rotationEnabled) {
        spinGlobe();
      }
    }, 1000);

    // Cleanup event listeners and interval
    return () => {
      if (map.current) {
        map.current.off('mousedown', handleMouseDown);
        map.current.off('dragstart', handleDragStart);
        map.current.off('mouseup', handleMouseUp);
        map.current.off('touchend', handleTouchEnd);
        map.current.off('moveend', handleMoveEnd);
      }
      clearInterval(rotationInterval);
    };
  }, [rotationEnabled]);

  const handleToggleRotation = () => {
    setRotationEnabled(!rotationEnabled);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[800px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Global Visualization</h2>
        <Toggle 
          pressed={rotationEnabled} 
          onPressedChange={handleToggleRotation} 
          aria-label="Toggle rotation"
          className="ml-2"
        >
          {rotationEnabled ? (
            <RotateCw className="h-4 w-4 mr-2" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          {rotationEnabled ? 'Rotation On' : 'Rotation Off'}
        </Toggle>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Interactive 3D globe visualization. Drag to rotate, scroll to zoom.
      </p>
      <div className="relative w-full h-[700px] flex items-center justify-center">
        <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      </div>
    </div>
  );
};

export default MapTab;
