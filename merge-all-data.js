const fs = require('fs');

// Read all CSV files
const fluorideAq1 = fs.readFileSync('./public/Fluoride_Aquifer_I.csv', 'utf8');
const fluorideAq2 = fs.readFileSync('./public/Fluoride_Aquifer_II.csv', 'utf8');
const nitrateAq1 = fs.readFileSync('./public/Nitrate_Aquifer_I.csv', 'utf8');
const nitrateAq2 = fs.readFileSync('./public/Nitrate_Aquifer_II.csv', 'utf8');

// Read existing GeoJSON
const existingGeoJSON = JSON.parse(fs.readFileSync('./public/nagpur.geojson', 'utf8'));

// Parse CSV helper
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    if (values.length >= headers.length && values[0]) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      data.push(row);
    }
  }
  return data;
}

// Parse all datasets
const fluAq1Data = parseCSV(fluorideAq1);
const fluAq2Data = parseCSV(fluorideAq2);
const nitAq1Data = parseCSV(nitrateAq1);
const nitAq2Data = parseCSV(nitrateAq2);

console.log(`Loaded ${fluAq1Data.length} Fluoride Aquifer I records`);
console.log(`Loaded ${fluAq2Data.length} Fluoride Aquifer II records`);
console.log(`Loaded ${nitAq1Data.length} Nitrate Aquifer I records`);
console.log(`Loaded ${nitAq2Data.length} Nitrate Aquifer II records`);

// Create features from Fluoride Aquifer I
const fluAq1Features = fluAq1Data.map(row => {
  const lat = parseFloat(row.Latitude);
  const lng = parseFloat(row.Longitude);
  const fluoride = parseFloat(row.Fluoride_mg_per_L);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  const category = isNaN(fluoride) ? 'Unknown' :
                   fluoride >= 5.0 ? 'Critical' : 
                   fluoride > 1.5 ? 'High' : 
                   fluoride > 1.0 ? 'Moderate' : 'Safe';
  
  return {
    type: 'Feature',
    properties: {
      source: 'Fluoride Aquifer I',
      district: 'NAGPUR',
      block: row.Taluka,
      village: row['Site Name'],
      location: row['Site Name'],
      sourceType: 'Aquifer Study',
      fluoride: fluoride,
      nitrate: null,
      category: category,
      dataType: 'Fluoride'
    },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
}).filter(f => f !== null);

// Create features from Fluoride Aquifer II
const fluAq2Features = fluAq2Data.map(row => {
  const lat = parseFloat(row.LATITUDE);
  const lng = parseFloat(row.LONGITUDE);
  const fluoride = parseFloat(row.Fluoride_mg_per_L);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  const category = isNaN(fluoride) ? 'Unknown' :
                   fluoride >= 5.0 ? 'Critical' : 
                   fluoride > 1.5 ? 'High' : 
                   fluoride > 1.0 ? 'Moderate' : 'Safe';
  
  return {
    type: 'Feature',
    properties: {
      source: 'Fluoride Aquifer II',
      district: 'NAGPUR',
      block: row.TAHSIL_NAME,
      village: row['Site Name'],
      location: row['Site Name'],
      sourceType: 'Aquifer Study',
      fluoride: fluoride,
      nitrate: null,
      category: category,
      dataType: 'Fluoride'
    },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
}).filter(f => f !== null);

// Create features from Nitrate Aquifer I
const nitAq1Features = nitAq1Data.map(row => {
  const lat = parseFloat(row.Latitude);
  const lng = parseFloat(row.Longitude);
  const nitrate = parseFloat(row.Nitrate_mg_per_L);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  const category = isNaN(nitrate) ? 'Unknown' :
                   nitrate > 45 ? 'High' : 
                   nitrate > 20 ? 'Moderate' : 'Safe';
  
  return {
    type: 'Feature',
    properties: {
      source: 'Nitrate Aquifer I',
      district: 'NAGPUR',
      block: row.Taluka,
      village: row['Site Name'],
      location: row['Site Name'],
      sourceType: 'Aquifer Study',
      fluoride: null,
      nitrate: nitrate,
      category: category,
      dataType: 'Nitrate'
    },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
}).filter(f => f !== null);

// Create features from Nitrate Aquifer II
const nitAq2Features = nitAq2Data.map(row => {
  const lat = parseFloat(row.LATITUDE);
  const lng = parseFloat(row.LONGITUDE);
  const nitrate = parseFloat(row.Nitrate_mg_per_L);
  
  if (isNaN(lat) || isNaN(lng) || row.Nitrate_mg_per_L === 'BDL') return null;
  
  const category = isNaN(nitrate) ? 'Unknown' :
                   nitrate > 45 ? 'High' : 
                   nitrate > 20 ? 'Moderate' : 'Safe';
  
  return {
    type: 'Feature',
    properties: {
      source: 'Nitrate Aquifer II',
      district: 'NAGPUR',
      block: row.TAHSIL_NAME,
      village: row['Site Name'],
      location: row['Site Name'],
      sourceType: 'Aquifer Study',
      fluoride: null,
      nitrate: nitrate,
      category: category,
      dataType: 'Nitrate'
    },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
}).filter(f => f !== null);

// Combine all features
const allFeatures = [
  ...existingGeoJSON.features,
  ...fluAq1Features,
  ...fluAq2Features,
  ...nitAq1Features,
  ...nitAq2Features
];

// Create new GeoJSON
const newGeoJSON = {
  type: 'FeatureCollection',
  features: allFeatures
};

// Write to file
fs.writeFileSync('./public/nagpur.geojson', JSON.stringify(newGeoJSON, null, 2));

console.log(`\n✓ Combined GeoJSON created with ${allFeatures.length} total locations`);
console.log(`  - GSDA Report: ${existingGeoJSON.features.length} locations`);
console.log(`  - Fluoride Aquifer I: ${fluAq1Features.length} locations`);
console.log(`  - Fluoride Aquifer II: ${fluAq2Features.length} locations`);
console.log(`  - Nitrate Aquifer I: ${nitAq1Features.length} locations`);
console.log(`  - Nitrate Aquifer II: ${nitAq2Features.length} locations`);
