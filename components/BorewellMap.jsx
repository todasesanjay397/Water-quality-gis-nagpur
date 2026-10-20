'use client';

import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

function FitMapToWells({ wells, searchCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (searchCoordinates && wells.length === 1) {
      const well = wells[0];
      map.fitBounds(
        [
          [searchCoordinates.latitude, searchCoordinates.longitude],
          [well.latitude, well.longitude]
        ],
        { padding: [40, 40], maxZoom: 14 }
      );
    } else if (wells.length === 1) {
      map.setView([wells[0].latitude, wells[0].longitude], 14);
    } else if (wells.length > 1) {
      map.fitBounds(wells.map(well => [well.latitude, well.longitude]), { padding: [30, 30] });
    }
  }, [map, wells, searchCoordinates]);

  return null;
}

export default function BorewellMap({ wells, searchCoordinates }) {
  const center = wells.length
    ? [wells[0].latitude, wells[0].longitude]
    : [21.15, 79.08];

  return (
    <div style={{ height: 'clamp(400px, 60vh, 680px)', width: '100%' }}>
      <MapContainer center={center} zoom={wells.length ? 12 : 9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitMapToWells wells={wells} searchCoordinates={searchCoordinates} />
        {wells.map(well => (
          <CircleMarker
            key={well.id}
            center={[well.latitude, well.longitude]}
            radius={9}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.9 }}
          >
            <Popup>
              <div style={{ minWidth: 190, color: '#0f172a' }}>
                <strong>{well.village}</strong>
                <div><strong>Tehsil:</strong> {well.tehsil}</div>
                <div><strong>Depth:</strong> {well.depth} m</div>
                <div><strong>Yield:</strong> {well.yield} LPH</div>
                <div><strong>Landmark:</strong> {well.landmark}</div>
                <div><strong>Coordinates:</strong> {well.latitude}, {well.longitude}</div>
                {well.distanceKm !== undefined && (
                  <div><strong>From searched coordinates:</strong> {well.distanceKm.toFixed(2)} km</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {searchCoordinates && (
          <CircleMarker
            center={[searchCoordinates.latitude, searchCoordinates.longitude]}
            radius={8}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#f59e0b', fillOpacity: 1 }}
          >
            <Popup>Searched coordinates</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
