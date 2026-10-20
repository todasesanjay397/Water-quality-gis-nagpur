'use client';
import { useState } from 'react';

export default function SearchBar({ geojson, onSelect }) {
  const [tehsil, setTehsil] = useState('');
  const [siteName, setSiteName] = useState('');
  const [coordinates, setCoordinates] = useState('');

  const handleSearch = (level) => {
    if (!geojson) return alert('GeoJSON not loaded');
    
    // Level 1: Search by Tehsil only
    if (level === 1 && tehsil.trim()) {
      const searchTerm = tehsil.trim().toLowerCase();
      const match = geojson.features.find(f => 
        f.properties.block?.toLowerCase() === searchTerm ||
        f.properties.block?.toLowerCase().includes(searchTerm)
      );
      if (match) {
        onSelect({ type: 'feature', data: match });
      } else {
        alert('Tehsil not found. Try: Ramtek, Katol, Hingna, etc.');
      }
    }
    
    // Level 2: Search by Site Name only
    else if (level === 2 && siteName.trim()) {
      const siteTerm = siteName.trim().toLowerCase();
      const match = geojson.features.find(f => 
        f.properties.location?.toLowerCase().includes(siteTerm) ||
        f.properties.village?.toLowerCase().includes(siteTerm)
      );
      if (match) {
        onSelect({ type: 'feature', data: match });
      } else {
        alert('Site not found. Please try another location.');
      }
    }
    
    // Level 3: Search by Coordinates only
    else if (level === 3 && coordinates.trim()) {
      const coordParts = coordinates.trim().split(',').map(c => c.trim());
      
      if (coordParts.length !== 2) {
        alert('Please enter coordinates in format: latitude, longitude');
        return;
      }
      
      const lat = parseFloat(coordParts[0]);
      const lng = parseFloat(coordParts[1]);
      
      if (isNaN(lat) || isNaN(lng)) {
        alert('Invalid coordinates. Format: 21.3889, 79.3483');
        return;
      }
      
      const match = geojson.features.find(f => {
        const [fLng, fLat] = f.geometry.coordinates;
        return Math.abs(fLat - lat) < 0.001 &&
               Math.abs(fLng - lng) < 0.001;
      });
      
      if (match) {
        onSelect({ type: 'feature', data: match });
      } else {
        alert('Exact location not found. Try adjusting coordinates slightly.');
      }
    } else {
      alert('Please fill in the required fields for this search level.');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {/* Three Input Fields */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 'clamp(8px, 2vw, 10px)',
        marginBottom: 'clamp(10px, 2vw, 12px)'
      }}>
        <input
          type="text"
          placeholder="Tehsil Name (e.g., Ramtek)"
          value={tehsil}
          onChange={(e) => setTehsil(e.target.value)}
          style={{
            padding: 'clamp(10px, 2vw, 11px) clamp(12px, 2.5vw, 14px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            fontSize: 'clamp(12px, 2.5vw, 13px)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#e2e8f0',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
        />
        <input
          type="text"
          placeholder="Site Name (e.g., Amgaon)"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          style={{
            padding: 'clamp(10px, 2vw, 11px) clamp(12px, 2.5vw, 14px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            fontSize: 'clamp(12px, 2.5vw, 13px)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#e2e8f0',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
        />
        <input
          type="text"
          placeholder="Coordinates (e.g., 21.3889, 79.3483)"
          value={coordinates}
          onChange={(e) => setCoordinates(e.target.value)}
          style={{
            padding: 'clamp(10px, 2vw, 11px) clamp(12px, 2.5vw, 14px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            fontSize: 'clamp(12px, 2.5vw, 13px)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#e2e8f0',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
        />
      </div>

      {/* Three Search Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
        gap: 'clamp(8px, 2vw, 10px)'
      }}>
        <button
          onClick={() => handleSearch(1)}
          style={{
            padding: 'clamp(10px, 2vw, 11px) clamp(16px, 3vw, 20px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 2.5vw, 13px)',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          🗺️ Search Tehsil
        </button>
        <button
          onClick={() => handleSearch(2)}
          style={{
            padding: 'clamp(10px, 2vw, 11px) clamp(16px, 3vw, 20px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            border: 'none',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 2.5vw, 13px)',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(240, 147, 251, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.4)';
          }}
        >
          📍 Search Site
        </button>
        <button
          onClick={() => handleSearch(3)}
          style={{
            padding: 'clamp(10px, 2vw, 11px) clamp(16px, 3vw, 20px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            border: 'none',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 2.5vw, 13px)',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.4)';
          }}
        >
          🎯 Coordinates
        </button>
      </div>
    </div>
  );
}
