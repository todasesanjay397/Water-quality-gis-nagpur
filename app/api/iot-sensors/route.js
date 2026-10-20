const SENSOR_BLUEPRINT = [
  {
    id: 'FNO3-001',
    site: 'Hingna Water Treatment Pilot',
    block: 'Hingna',
    sourceType: 'Community Tube Well',
    lat: 21.064,
    lng: 78.962,
    baseFluoride: 1.1,
    baseNitrate: 23,
    samplingIntervalSec: 30,
    batteryPct: 94,
  },
  {
    id: 'FNO3-014',
    site: 'Saoner Rural Hospital',
    block: 'Saoner',
    sourceType: 'Overhead Tank',
    lat: 21.385,
    lng: 78.922,
    baseFluoride: 1.7,
    baseNitrate: 33,
    samplingIntervalSec: 20,
    batteryPct: 88,
  },
  {
    id: 'FNO3-021',
    site: 'Katol Grampanchayat',
    block: 'Katol',
    sourceType: 'Piped Supply',
    lat: 21.266,
    lng: 78.585,
    baseFluoride: 0.9,
    baseNitrate: 18,
    samplingIntervalSec: 45,
    batteryPct: 97,
  },
  {
    id: 'FNO3-035',
    site: 'Umrer Municipal Intake',
    block: 'Umrer',
    sourceType: 'Hand Pump Cluster',
    lat: 20.853,
    lng: 79.324,
    baseFluoride: 2.4,
    baseNitrate: 48,
    samplingIntervalSec: 25,
    batteryPct: 83,
  },
  {
    id: 'FNO3-042',
    site: 'Parseoni Agri Borewell',
    block: 'Parseoni',
    sourceType: 'Irrigation Borewell',
    lat: 21.41,
    lng: 79.197,
    baseFluoride: 1.3,
    baseNitrate: 55,
    samplingIntervalSec: 35,
    batteryPct: 91,
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const jitter = (base, spread) => base + (Math.random() * 2 - 1) * spread;

const fluorideCategory = (value) => {
  if (value >= 5) return { label: 'Critical', tone: '#991b1b' };
  if (value >= 1.5) return { label: 'High', tone: '#dc2626' };
  if (value >= 1.0) return { label: 'Moderate', tone: '#fb923c' };
  return { label: 'Safe', tone: '#22c55e' };
};

const nitrateCategory = (value) => {
  if (value > 45) return { label: 'High', tone: '#7c2d12' };
  if (value > 20) return { label: 'Moderate', tone: '#d97706' };
  return { label: 'Safe', tone: '#16a34a' };
};

export async function GET() {
  const generatedAt = new Date().toISOString();

  const sensors = SENSOR_BLUEPRINT.map((sensor) => {
    const fluoride = Number(jitter(sensor.baseFluoride, 0.35).toFixed(2));
    const nitrate = Number(jitter(sensor.baseNitrate, 6).toFixed(1));
    const turbidity = Number(jitter(1.6, 0.5).toFixed(2));
    const flowRate = Number(jitter(3.2, 0.8).toFixed(2));

    const fluorideStatus = fluorideCategory(fluoride);
    const nitrateStatus = nitrateCategory(nitrate);

    return {
      ...sensor,
      fluoride,
      nitrate,
      turbidity,
      flowRate,
      signalStrength: clamp(Math.round(jitter(82, 8)), 50, 100),
      batteryPct: clamp(Math.round(jitter(sensor.batteryPct, 4)), 30, 100),
      uptimeHours: clamp(Math.round(jitter(742, 40)), 100, 940),
      fluorideStatus,
      nitrateStatus,
      health: fluorideStatus.label === 'Critical' || nitrateStatus.label === 'High' ? 'Alert' : 'Nominal',
      lastPacket: generatedAt,
    };
  });

  return new Response(
    JSON.stringify({
      sensors,
      generatedAt,
      metadata: {
        pollIntervalSec: 10,
        firmware: 'FNO3 Edge v2.1.4',
        totalSensors: sensors.length,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    },
  );
}
