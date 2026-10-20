const fs = require('fs');
const Papa = require('papaparse');

// Read the CSV file
const csvContent = fs.readFileSync('./public/updated-all-block-2-year-repeated-source-list-F-affected.csv', 'utf8');

// Parse CSV, skip first row (title row)
const parsed = Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
  transformHeader: (header) => header.trim()
});

// Skip the first data row if it's empty or header-like
const dataRows = parsed.data.slice(1);

// Approximate coordinates for different blocks/panchayats in Nagpur district
const blockCoordinates = {
  'BHIWAPUR': { lat: 21.009, lng: 78.957, latOffset: 0, lngOffset: 0 },
  'HINGNA': { lat: 21.017, lng: 79.163, latOffset: 0, lngOffset: 0 },
  'KALAMESHWAR': { lat: 21.265, lng: 79.003, latOffset: 0, lngOffset: 0 },
  'KAMPTEE': { lat: 21.220, lng: 79.197, latOffset: 0, lngOffset: 0 },
  'KATOL': { lat: 21.057, lng: 78.827, latOffset: 0, lngOffset: 0 },
  'KUHI': { lat: 21.032, lng: 79.049, latOffset: 0, lngOffset: 0 },
  'MAUDA': { lat: 21.283, lng: 79.133, latOffset: 0, lngOffset: 0 },
  'NAGPUR': { lat: 21.146, lng: 79.088, latOffset: 0, lngOffset: 0 },
  'NARKHED': { lat: 21.433, lng: 78.973, latOffset: 0, lngOffset: 0 },
  'PARSEONI': { lat: 21.020, lng: 79.300, latOffset: 0, lngOffset: 0 },
  'RAMTEK': { lat: 21.354, lng: 79.352, latOffset: 0, lngOffset: 0 },
  'SAONER': { lat: 21.452, lng: 78.952, latOffset: 0, lngOffset: 0 },
  'UMRED': { lat: 20.853, lng: 79.320, latOffset: 0, lngOffset: 0 }
};

// Track location counts for offsetting
const locationCounts = {};

// Create GeoJSON features
const features = dataRows
  .filter(row => row['Sr.No.'] && row['Fluoride   (mg/l)'])
  .map((row, index) => {
    const block = row['Block'] ? row['Block'].toUpperCase().trim() : 'NAGPUR';
    const baseCoords = blockCoordinates[block] || blockCoordinates['NAGPUR'];
    
    // Create a unique location key for offsetting
    const locationKey = `${block}-${row['Name of Village']}-${row['Source Location']}`;
    locationCounts[locationKey] = (locationCounts[locationKey] || 0) + 1;
    
    // Add small random offset to prevent exact overlaps
    const offsetMultiplier = locationCounts[locationKey];
    const latOffset = (Math.random() - 0.5) * 0.01 * offsetMultiplier;
    const lngOffset = (Math.random() - 0.5) * 0.01 * offsetMultiplier;
    
    const fluoride = parseFloat(row['Fluoride   (mg/l)']);
    const category = fluoride >= 5.0 ? 'Critical' : 
                    fluoride > 1.5 ? 'High' : 
                    fluoride > 1.0 ? 'Moderate' : 'Safe';
    
    return {
      type: 'Feature',
      properties: {
        srNo: row['Sr.No.'],
        district: row['District'],
        block: row['Block'],
        panchayat: row['Name of Panchayat'],
        village: row['Name of Village'],
        habitation: row['Name of Habitation'],
        location: row['Source Location'],
        sourceType: row['Type of Source'],
        fluoride: fluoride,
        sampleReceiving: row['Sample Receiving Date'],
        sampleTesting: row['Sample Testing Date'],
        labRefNo: row['Lab Reference No.'],
        remark: row['Remark'],
        category: category
      },
      geometry: {
        type: 'Point',
        coordinates: [
          baseCoords.lng + lngOffset,
          baseCoords.lat + latOffset
        ]
      }
    };
  });

// Create GeoJSON object
const geojson = {
  type: 'FeatureCollection',
  features: features
};

// Write to file
fs.writeFileSync('./public/nagpur.geojson', JSON.stringify(geojson, null, 2));

console.log(`✓ Generated GeoJSON with ${features.length} fluoride testing locations`);
console.log('✓ File saved: public/nagpur.geojson');

// Print summary by block
const blockCounts = {};
features.forEach(f => {
  const block = f.properties.block || 'Unknown';
  blockCounts[block] = (blockCounts[block] || 0) + 1;
});

console.log('\nData by Block:');
Object.keys(blockCounts).sort().forEach(block => {
  console.log(`  ${block}: ${blockCounts[block]} locations`);
});
