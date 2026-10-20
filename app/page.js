"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import IoTSensorPanel from "../components/IoTSensorPanel";

const MapComponent = dynamic(() => import("../components/MapComponent"), { ssr: false });

export default function Page() {
  const [geojson, setGeojson] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    fetch("/nagpur.geojson").then(r => r.json()).then(data => setGeojson(data));
  }, []);

  const handleSelect = (feature) => {
    setSelected(feature.properties);
  };

  const handleSearch = (searchResult) => {
    if (!searchResult || !mapRef) return;
    
    const { type, data } = searchResult;
    
    if (type === 'feature' && data) {
      // Single location
      const coords = data.geometry.coordinates;
      mapRef.flyTo([coords[1], coords[0]], 15, { duration: 1.5 });
      handleSelect(data);
    }
  };

  const handleResetView = () => {
    if (mapRef) {
      mapRef.flyTo([21.15, 79.08], 10, { duration: 1.5 });
      setSelected(null);
    }
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: 0,
      margin: 0
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: 'clamp(12px, 3vw, 16px) clamp(12px, 4vw, 24px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 20px)' }}>
          <div style={{ flexShrink: 0 }}>
            <Image 
              src="/fno3.webp" 
              alt="Nitrate Molecule Structure" 
              width={80} 
              height={80}
              style={{ 
                filter: 'drop-shadow(0 4px 12px rgba(96, 165, 250, 0.4))',
                borderRadius: '8px'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: 'clamp(18px, 5vw, 28px)', 
              fontWeight: '700', 
              margin: '0 0 clamp(4px, 1vw, 6px) 0',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.2'
            }}>
              Nagpur Water Quality Monitoring System
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#94a3b8',
              fontSize: 'clamp(11px, 2.5vw, 13px)',
              lineHeight: '1.4'
            }}>
              Comprehensive fluoride & nitrate contamination tracking | 1,126+ testing locations across Nagpur district
            </p>
          </div>
          <Link
            href="/borewells"
            style={{
              flexShrink: 0,
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              color: 'white',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            Borewell Data
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ 
        padding: 'clamp(12px, 3vw, 20px) clamp(12px, 4vw, 24px)',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Search Bar */}
        <div style={{
          marginBottom: 'clamp(12px, 3vw, 20px)',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: 'clamp(12px, 3vw, 16px)',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(10px, 2vw, 12px)' }}>
            {geojson && <SearchBar geojson={geojson} onSelect={handleSearch} />}
            
            {/* Reset View Button */}
            <button
              onClick={handleResetView}
              style={{
                padding: 'clamp(9px, 2vw, 10px) clamp(20px, 4vw, 28px)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 2.5vw, 13px)',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
              }}
            >
              🔄 Reset Map View
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)',
          padding: 'clamp(8px, 2vw, 12px)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          border: '2px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}>
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            {geojson && <MapComponent onFeatureClick={handleSelect} onMapReady={setMapRef} />}
          </div>
        </div>

        <IoTSensorPanel />

        {/* Legend */}
        <div style={{
          marginTop: 'clamp(12px, 3vw, 20px)',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: 'clamp(14px, 3vw, 18px)',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(16px, 4vw, 24px)'
        }}>
          {/* Fluoride Legend */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa', marginBottom: '12px', borderBottom: '2px solid rgba(96, 165, 250, 0.3)', paddingBottom: '6px' }}>
              💧 Fluoride Levels (mg/L)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { color: '#1a9850', label: 'Safe', range: '<1.0' },
                { color: '#fc8d59', label: 'Moderate', range: '1.0-1.5' },
                { color: '#d73027', label: 'High', range: '1.5-5.0' },
                { color: '#8b0000', label: 'Critical', range: '≥5.0' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: item.color,
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>({item.range})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nitrate Legend */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#a78bfa', marginBottom: '12px', borderBottom: '2px solid rgba(167, 139, 250, 0.3)', paddingBottom: '6px' }}>
              🧪 Nitrate Levels (mg/L)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { color: '#22c55e', label: 'Safe', range: '≤20' },
                { color: '#ea580c', label: 'Moderate', range: '20-45' },
                { color: '#7c2d12', label: 'High', range: '>45' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: item.color,
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>({item.range})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fbbf24', marginBottom: '12px', borderBottom: '2px solid rgba(251, 191, 36, 0.3)', paddingBottom: '6px' }}>
              📊 Data Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <div>• GSDA Report (2021-23): 602 sites</div>
              <div>• Aquifer Study I: 192 sites</div>
              <div>• Aquifer Study II: 85 sites</div>
              <div>• Nitrate Monitoring: 247 sites</div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>Total: 1,126 locations</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
