'use client';

import { useEffect, useMemo, useState } from 'react';

const POLL_INTERVAL_MS = 10_000;

export default function IoTSensorPanel() {
  const [sensors, setSensors] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timerId;
    let abortController = new AbortController();

    const pullFeed = async () => {
      try {
        const res = await fetch('/api/iot-sensors', { signal: abortController.signal, cache: 'no-store' });
        if (!res.ok) throw new Error('Sensor gateway unreachable');
        const payload = await res.json();
        setSensors(payload.sensors ?? []);
        setMetadata(payload.metadata ?? null);
        setLastRefresh(payload.generatedAt ?? new Date().toISOString());
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to refresh sensor feed');
        }
      } finally {
        setIsLoading(false);
      }
    };

    pullFeed();
    timerId = setInterval(() => {
      abortController.abort();
      abortController = new AbortController();
      pullFeed();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timerId);
      abortController.abort();
    };
  }, []);

  const fleetHealth = useMemo(() => {
    const totals = sensors.reduce(
      (acc, sensor) => {
        if (sensor.fluorideStatus?.label === 'High' || sensor.fluorideStatus?.label === 'Critical') acc.fluorideAlerts += 1;
        if (sensor.nitrateStatus?.label === 'High') acc.nitrateAlerts += 1;
        if (sensor.health === 'Alert') acc.inAlarm += 1;
        return acc;
      },
      { fluorideAlerts: 0, nitrateAlerts: 0, inAlarm: 0 },
    );
    return totals;
  }, [sensors]);

  const formatClock = (iso) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(iso));
  };

  return (
    <section
      style={{
        marginTop: 'clamp(12px, 3vw, 22px)',
        background: 'linear-gradient(145deg, rgba(15,23,42,0.85), rgba(30,41,59,0.85))',
        borderRadius: 'clamp(10px, 3vw, 16px)',
        padding: 'clamp(14px, 3vw, 22px)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 15px 35px rgba(2,6,23,0.45) inset, 0 25px 30px -20px rgba(0,0,0,0.65)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, color: '#38bdf8', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>IoT Sensor Telemetry</p>
          <h2 style={{ margin: '6px 0 0', fontSize: 'clamp(18px, 4vw, 24px)', color: '#f8fafc' }}>Real-time Fluoride & Nitrate Feed</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#cbd5f5' }}>Last sync</div>
          <div style={{ fontWeight: 600, color: '#fef3c7', fontSize: '14px' }}>{formatClock(lastRefresh)}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{metadata ? `Edge firmware ${metadata.firmware}` : ''}</div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.4)', color: '#fecaca', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: 'clamp(12px, 2.5vw, 18px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        {[{
          label: 'Active Sensors',
          value: metadata?.totalSensors ?? sensors.length,
          accent: '#60a5fa',
        }, {
          label: 'Fluoride Alerts',
          value: fleetHealth.fluorideAlerts,
          accent: '#f97316',
        }, {
          label: 'Nitrate Alerts',
          value: fleetHealth.nitrateAlerts,
          accent: '#facc15',
        }, {
          label: 'In Alarm',
          value: fleetHealth.inAlarm,
          accent: '#ef4444',
        }].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'rgba(15,23,42,0.65)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: stat.accent }}>{isLoading ? '…' : stat.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 'clamp(14px, 3vw, 22px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(12px, 3vw, 18px)',
        }}
      >
        {sensors.map((sensor) => (
          <article
            key={sensor.id}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              background: 'linear-gradient(160deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>{sensor.site}</h3>
                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '12px' }}>{sensor.block} • {sensor.sourceType}</p>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  background: sensor.health === 'Alert' ? 'rgba(248,113,113,0.2)' : 'rgba(34,197,94,0.2)',
                  color: sensor.health === 'Alert' ? '#fecaca' : '#bbf7d0',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {sensor.health}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              <div style={{ background: 'rgba(15,23,42,0.8)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Fluoride</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: sensor.fluorideStatus?.tone }}>{sensor.fluoride ?? '—'} <span style={{ fontSize: '12px', color: '#cbd5f5' }}>mg/L</span></div>
                <div style={{ fontSize: '11px', color: '#cbd5f5' }}>{sensor.fluorideStatus?.label}</div>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.8)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(248, 250, 109, 0.2)' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Nitrate</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: sensor.nitrateStatus?.tone }}>{sensor.nitrate ?? '—'} <span style={{ fontSize: '12px', color: '#cbd5f5' }}>mg/L</span></div>
                <div style={{ fontSize: '11px', color: '#cbd5f5' }}>{sensor.nitrateStatus?.label}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', marginTop: '10px', fontSize: '11px', color: '#94a3b8' }}>
              <div>
                <div style={{ color: '#cbd5f5', fontWeight: 600 }}>{sensor.turbidity} NTU</div>
                <div>Turbidity</div>
              </div>
              <div>
                <div style={{ color: '#cbd5f5', fontWeight: 600 }}>{sensor.flowRate} L/s</div>
                <div>Flow</div>
              </div>
              <div>
                <div style={{ color: '#cbd5f5', fontWeight: 600 }}>{sensor.uptimeHours} h</div>
                <div>Uptime</div>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5f5' }}>
              <span>Signal {sensor.signalStrength}%</span>
              <span>Battery {sensor.batteryPct}%</span>
              <span>Pk {sensor.lastPacket ? new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(sensor.lastPacket)) : '—'}</span>
            </div>
          </article>
        ))}

        {!sensors.length && !isLoading && !error && (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>No IoT sensors registered.</p>
        )}
      </div>
    </section>
  );
}
