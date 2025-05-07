
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  rotationEnabled: boolean;
  onMapLoaded?: () => void;
  selectedCountry?: { name: string; coordinates: number[] } | null;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  rotationEnabled,
  onMapLoaded,
  selectedCountry
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
      pitch: 0, // Starting with flat view
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
      if (!map.current) return;
      
      map.current.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });
      
      // Improved animation sequence to focus on Africa after the map loads
      setTimeout(() => {
        if (!map.current) return;
        
        map.current.flyTo({
          center: [20, 5], // Approximate center of African continent
          zoom: 2.8, // Slightly higher zoom to better frame Africa
          pitch: 20, // Add some pitch for better perspective
          duration: 6000, // Longer, smoother animation
          essential: true
        });
        
        // Enable rotation with a delay after flyTo animation completes
        setTimeout(() => {
          if (onMapLoaded) onMapLoaded();
        }, 7000); // Wait 1 second after the flyTo animation (which takes 6 seconds)
      }, 2000); // Wait 2 seconds before starting the animation
    });

    // Cleanup function
    return () => {
      map.current?.remove();
    };
  }, [onMapLoaded]);

  // Separate effect for handling rotation that depends on rotationEnabled state
  useEffect(() => {
    if (!map.current) return;
    
    // Rotation animation settings
    const secondsPerRevolution = 360; // Slower initial rotation (6 minutes per revolution)
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

  // Effect to fly to selected country
  useEffect(() => {
    if (!map.current || !selectedCountry) return;
    
    if (selectedCountry.name === 'Sudan') {
      const [longitude, latitude] = selectedCountry.coordinates;
      
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 5,
        pitch: 30,
        duration: 3000,
        essential: true
      });
    }
  }, [selectedCountry]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapContainer;
