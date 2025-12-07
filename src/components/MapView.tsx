import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { WaterObject } from '../types/database';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  objects: WaterObject[];
  onObjectClick: (object: WaterObject) => void;
  highlightedObject?: WaterObject | null;
}

const conditionColors: Record<number, string> = {
  1: '#22c55e',
  2: '#86efac',
  3: '#facc15',
  4: '#fb923c',
  5: '#ef4444',
};

function MapController({ highlightedObject }: { highlightedObject?: WaterObject | null }) {
  const map = useMap();

  useEffect(() => {
    if (highlightedObject) {
      const lat = Number(highlightedObject.latitude);
      const lon = Number(highlightedObject.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        map.flyTo([lat, lon], 10, {
          duration: 1.5,
        });
      }
    }
  }, [highlightedObject, map]);

  return null;
}

export function MapView({ objects, onObjectClick, highlightedObject }: MapViewProps) {
  console.log(`MapView rendering with ${objects.length} objects`);
  return (
    <MapContainer
      center={[48.0196, 66.9237]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController highlightedObject={highlightedObject} />
      {objects.map((obj) => {
        const lat = Number(obj.latitude as any);
        const lon = Number(obj.longitude as any);
        if (isNaN(lat) || isNaN(lon)) return null;
        const condition = Number(obj.technical_condition) || 3;
        const fill = conditionColors[condition] ?? '#999999';

        return (
          <CircleMarker
            key={obj.id}
            center={[lat, lon]}
            radius={8}
            fillColor={fill}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => onObjectClick(obj),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{obj.name}</p>
                <p className="text-gray-600">{obj.region}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
