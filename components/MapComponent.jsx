'use client';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';

export default function MapComponent({ onFeatureClick, onMapReady }) {
  const [geoData, setGeoData] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    fetch('/nagpur.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to load geojson', err));
  }, []);

  useEffect(() => {
    if (mapRef.current && onMapReady) {
      onMapReady(mapRef.current);
    }
  }, [mapRef.current, onMapReady]);

  const getFluorideColor = (f) => {
    if (!f || isNaN(f)) return '#94a3b8'; // Unknown - Gray
    if (f >= 5.0) return '#8b0000'; // Critical - Dark Red
    if (f > 1.5) return '#d73027'; // High - Red
    if (f > 1.0) return '#fc8d59'; // Moderate - Orange
    return '#1a9850'; // Safe - Green
  };

  const getNitrateColor = (n) => {
    if (!n || isNaN(n)) return '#94a3b8'; // Unknown - Gray
    if (n > 45) return '#7c2d12'; // High - Dark Brown
    if (n > 20) return '#ea580c'; // Moderate - Orange
    return '#22c55e'; // Safe - Bright Green
  };

  const pointToLayer = (feature, latlng) => {
    const p = feature.properties;
    const isFluoride = p.dataType === 'Fluoride' || p.fluoride !== null;
    const isNitrate = p.dataType === 'Nitrate';
    
    let color, radius;
    
    if (isFluoride && !isNitrate) {
      color = getFluorideColor(p.fluoride);
      radius = 7;
    } else if (isNitrate) {
      color = getNitrateColor(p.nitrate);
      radius = 6;
    } else {
      color = '#94a3b8';
      radius = 6;
    }
    
    return L.circleMarker(latlng, {
      radius: radius,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      color: '#fff',
      fillColor: color
    });
  };

  const onEachFeature = (feature, layer) => {
    const p = feature.properties;
    const isFluoride = p.dataType === 'Fluoride' || p.fluoride !== null;
    const isNitrate = p.dataType === 'Nitrate';
    
    let popup = `<div style="min-width: 220px; font-family: system-ui;">`;
    popup += `<div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">${p.village || p.location}</div>`;
    
    if (p.block) popup += `<div style="margin-bottom: 4px;"><strong>Block:</strong> ${p.block}</div>`;
    if (p.location && p.village !== p.location) popup += `<div style="margin-bottom: 4px;"><strong>Location:</strong> ${p.location}</div>`;
    popup += `<div style="margin-bottom: 4px;"><strong>Source:</strong> ${p.sourceType}</div>`;
    
    if (isFluoride && p.fluoride !== null && !isNaN(p.fluoride)) {
      const fluColor = getFluorideColor(p.fluoride);
      popup += `<div style="margin: 8px 0; padding: 8px; background: #f1f5f9; border-radius: 6px;">`;
      popup += `<strong>Fluoride:</strong> <span style="color: ${fluColor}; font-weight: bold; font-size: 16px;">${p.fluoride} mg/L</span><br/>`;
      popup += `<span style="font-size: 12px; color: #64748b;">Category: ${p.category}</span>`;
      popup += `</div>`;
    }
    
    if (isNitrate && p.nitrate !== null && !isNaN(p.nitrate)) {
      const nitColor = getNitrateColor(p.nitrate);
      popup += `<div style="margin: 8px 0; padding: 8px; background: #fef3c7; border-radius: 6px;">`;
      popup += `<strong>Nitrate:</strong> <span style="color: ${nitColor}; font-weight: bold; font-size: 16px;">${p.nitrate} mg/L</span><br/>`;
      popup += `<span style="font-size: 12px; color: #64748b;">Category: ${p.category}</span>`;
      popup += `</div>`;
    }
    
    if (p.sampleReceiving) popup += `<div style="font-size: 12px; color: #64748b; margin-top: 6px;">Received: ${p.sampleReceiving}</div>`;
    if (p.sampleTesting) popup += `<div style="font-size: 12px; color: #64748b;">Tested: ${p.sampleTesting}</div>`;
    if (p.source) popup += `<div style="font-size: 11px; color: #94a3b8; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;">Source: ${p.source}</div>`;
    
    popup += `</div>`;
    layer.bindPopup(popup);
    layer.on('click', () => onFeatureClick && onFeatureClick(feature));
  };

  // Filter data to show only Nagpur district (approximate bounds)
  const filteredGeoData = geoData ? {
    ...geoData,
    features: geoData.features.filter(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      // Nagpur district approximate boundaries
      return lat >= 20.5 && lat <= 21.7 && lng >= 78.3 && lng <= 79.6;
    })
  } : null;

  return (
    <div style={{ height: 'clamp(400px, 60vh, 70vh)', width: '100%' }}>
      <MapContainer 
        center={[21.15, 79.08]} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }} 
        ref={mapRef}
        zoomControl={true}
        maxBounds={[[20.5, 78.3], [21.7, 79.6]]}
        minZoom={9}
        maxZoom={16}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {filteredGeoData && <GeoJSON data={filteredGeoData} pointToLayer={pointToLayer} onEachFeature={onEachFeature} key={JSON.stringify(filteredGeoData.features.length)} />}
      </MapContainer>
    </div>
  );
}
