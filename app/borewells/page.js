'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const BorewellMap = dynamic(() => import('../../components/BorewellMap'), { ssr: false });

function distanceInKm(first, second) {
  const radians = value => (value * Math.PI) / 180;
  const latitudeDifference = radians(second.latitude - first.latitude);
  const longitudeDifference = radians(second.longitude - first.longitude);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function parseCoordinates(value) {
  const parts = value.split(',').map(part => part.trim());
  if (parts.length !== 2 || parts.some(part => part === '')) return null;

  const [latitude, longitude] = parts.map(Number);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export default function BorewellsPage() {
  const [borewells, setBorewells] = useState([]);
  const [tehsil, setTehsil] = useState('');
  const [village, setVillage] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [results, setResults] = useState([]);
  const [searchCoordinates, setSearchCoordinates] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadBorewells() {
      try {
        const response = await fetch('/borewell_data.csv');
        if (!response.ok) throw new Error(`Unable to load borewell data (${response.status}).`);

        const csv = await response.text();
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true, dynamicTyping: true });
        if (parsed.errors.length) {
          throw new Error(`Unable to parse borewell data: ${parsed.errors[0].message}`);
        }

        const rows = parsed.data
          .filter(row =>
            Number.isFinite(row['Sr. No.']) &&
            typeof row.Taluka === 'string' &&
            typeof row.Village === 'string' &&
            Number.isFinite(row['Depth (m)']) &&
            Number.isFinite(row['Yield (LPH)']) &&
            Number.isFinite(row.Latitude) &&
            Number.isFinite(row.Longitude)
          )
          .map(row => ({
            id: row['Sr. No.'],
            tehsil: row.Taluka.trim(),
            village: row.Village.trim(),
            landmark: String(row['Landmark / Location'] || '').trim(),
            depth: row['Depth (m)'],
            yield: row['Yield (LPH)'],
            latitude: row.Latitude,
            longitude: row.Longitude
          }));

        if (!rows.length) throw new Error('The borewell CSV does not contain any valid records.');
        if (active) setBorewells(rows);
      } catch (error) {
        if (active) setDataError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBorewells();
    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    const tehsilTerm = tehsil.trim().toLocaleLowerCase();
    const villageTerm = village.trim().toLocaleLowerCase();
    const coordinateText = coordinates.trim();

    if (!tehsilTerm && !villageTerm && !coordinateText) {
      setMessage('Enter a tehsil, village, or coordinates to search.');
      setResults([]);
      setSearchCoordinates(null);
      return;
    }

    const parsedCoordinates = coordinateText ? parseCoordinates(coordinateText) : null;
    if (coordinateText && !parsedCoordinates) {
      setMessage('Enter coordinates as latitude, longitude (for example: 21.15, 79.08).');
      setResults([]);
      setSearchCoordinates(null);
      return;
    }

    let matches = borewells.filter(well =>
      (!tehsilTerm || well.tehsil.toLocaleLowerCase().includes(tehsilTerm)) &&
      (!villageTerm || well.village.toLocaleLowerCase().includes(villageTerm))
    );

    if (parsedCoordinates) {
      const candidates = tehsilTerm || villageTerm ? matches : borewells;
      const nearest = candidates
        .map(well => ({
          ...well,
          distanceKm: distanceInKm(parsedCoordinates, well)
        }))
        .sort((first, second) => first.distanceKm - second.distanceKm)[0];

      matches = nearest ? [nearest] : [];
    }

    setSearchCoordinates(parsedCoordinates);
    setResults(matches);

    if (!matches.length) {
      setMessage('No borewell records match those tehsil and village filters.');
    } else if (parsedCoordinates) {
      setMessage(`Showing the nearest recorded borewell${tehsilTerm || villageTerm ? ' within the matching records' : ''}.`);
    } else {
      setMessage(`${matches.length} borewell${matches.length === 1 ? '' : 's'} found.`);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '0 16px 32px' }}>
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        margin: '0 -16px 24px',
        padding: '16px clamp(16px, 4vw, 32px)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 4px', color: '#7dd3fc', fontSize: 'clamp(22px, 4vw, 30px)' }}>Nagpur Borewell Finder</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Search borewell records by tehsil, village, or coordinates.</p>
          </div>
          <Link href="/" style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: '#334155',
            color: '#e2e8f0',
            textDecoration: 'none',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            Water Quality Map
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <form onSubmit={handleSearch} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
          gap: 12,
          alignItems: 'end',
          padding: 16,
          marginBottom: 16,
          background: 'rgba(30, 41, 59, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 12
        }}>
          <label style={{ display: 'grid', gap: 6, color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
            Tehsil
            <input value={tehsil} onChange={event => setTehsil(event.target.value)} placeholder="e.g. Hingna" style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 6, color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
            Village
            <input value={village} onChange={event => setVillage(event.target.value)} placeholder="e.g. Takalghat" style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 6, color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
            Coordinates (latitude, longitude)
            <input value={coordinates} onChange={event => setCoordinates(event.target.value)} placeholder="e.g. 20.913767, 78.947311" style={inputStyle} />
          </label>
          <button type="submit" disabled={loading || Boolean(dataError)} style={{
            minHeight: 42,
            border: 0,
            borderRadius: 8,
            background: loading || dataError ? '#475569' : 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: loading || dataError ? 'not-allowed' : 'pointer'
          }}>
            Show Map
          </button>
        </form>

        <div role="status" aria-live="polite" style={{
          minHeight: 24,
          marginBottom: 12,
          color: dataError ? '#fca5a5' : '#cbd5e1',
          fontSize: 14
        }}>
          {loading ? 'Loading borewell records…' : dataError || message}
        </div>

        <section style={{
          padding: 10,
          background: 'rgba(30, 41, 59, 0.65)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: 14,
          overflow: 'hidden'
        }}>
          <BorewellMap wells={results} searchCoordinates={searchCoordinates} />
        </section>

        {results.length > 0 && (
          <section aria-label="Borewell search results" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: 12,
            marginTop: 16
          }}>
            {results.map(well => (
              <article key={well.id} style={{
                padding: 16,
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: 10,
                color: '#cbd5e1',
                lineHeight: 1.7
              }}>
                <h2 style={{ margin: '0 0 8px', color: '#7dd3fc', fontSize: 17 }}>{well.village}</h2>
                <div><strong>Tehsil:</strong> {well.tehsil}</div>
                <div><strong>Depth:</strong> {well.depth} m</div>
                <div><strong>Yield:</strong> {well.yield} LPH</div>
                <div><strong>Landmark:</strong> {well.landmark || 'Not provided'}</div>
                <div><strong>Coordinates:</strong> {well.latitude}, {well.longitude}</div>
                {well.distanceKm !== undefined && <div><strong>Distance from search:</strong> {well.distanceKm.toFixed(2)} km</div>}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 42,
  padding: '10px 12px',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 8,
  background: 'rgba(15, 23, 42, 0.8)',
  color: '#e2e8f0',
  outline: 'none'
};
