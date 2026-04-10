'use client';

import { useEffect, useRef, useState } from 'react';

// Pure-JS Google Encoded Polyline decoder — no extra package needed
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coords.push([lng / 1e5, lat / 1e5]); // GeoJSON is [lng, lat]
  }

  return coords;
}

interface HeatmapClientProps {
  polylines: string[];
}

declare global {
  interface Window {
    mapboxgl: {
      Map: new (options: {
        container: HTMLElement;
        style: string;
        center: [number, number];
        zoom: number;
        accessToken: string;
      }) => {
        on: (event: string, callback: () => void) => void;
        addSource: (id: string, source: object) => void;
        addLayer: (layer: object) => void;
        remove: () => void;
      };
      accessToken: string;
    };
  }
}

type MapboxMapInstance = {
  on: (event: string, callback: () => void) => void;
  addSource: (id: string, source: object) => void;
  addLayer: (layer: object) => void;
  remove: () => void;
};

export default function HeatmapClient({ polylines }: HeatmapClientProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMapInstance | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapboxToken) {
      setMapError('no_token');
      return;
    }
    if (mapRef.current) return;

    // Load Mapbox GL JS via CDN
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js';
    script.async = true;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';

    document.head.appendChild(link);
    document.head.appendChild(script);

    script.onload = () => {
      if (!mapContainer.current) return;

      const map = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-78.6382, 35.7796], // Raleigh, NC
        zoom: 11,
        accessToken: mapboxToken,
      });

      mapRef.current = map;

      map.on('load', () => {
        // Build GeoJSON from decoded polylines
        const features = polylines
          .map((encoded) => {
            try {
              const coordinates = decodePolyline(encoded);
              if (coordinates.length < 2) return null;
              return {
                type: 'Feature' as const,
                geometry: {
                  type: 'LineString' as const,
                  coordinates,
                },
                properties: {},
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        map.addSource('routes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features,
          },
        });

        map.addLayer({
          id: 'routes-layer',
          type: 'line',
          source: 'routes',
          paint: {
            'line-color': '#1D9E75',
            'line-opacity': 0.3,
            'line-width': 2,
          },
        });

        setMapLoaded(true);
      });
    };

    script.onerror = () => {
      setMapError('load_failed');
    };

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, polylines]);

  if (mapError === 'no_token') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-gray-50">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">Map not configured</p>
          <p className="text-xs text-gray-400">Add <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code className="bg-gray-100 px-1 rounded">.env.local</code> to enable the heatmap.</p>
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">{polylines.length} routes ready to render once map token is configured.</p>
        </div>
      </div>
    );
  }

  if (mapError === 'load_failed') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-red-500">
        Failed to load Mapbox GL JS. Check your network connection.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div ref={mapContainer} className="h-80 w-full bg-gray-100">
        {!mapLoaded && (
          <div className="h-full flex items-center justify-center">
            <div className="text-xs text-gray-400">Loading map…</div>
          </div>
        )}
      </div>
    </div>
  );
}
