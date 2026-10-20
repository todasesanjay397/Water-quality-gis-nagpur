const fs = require('fs');

// Read the CSV file
const csvContent = fs.readFileSync('./public/updated-all-block-2-year-repeated-source-list-F-affected.csv', 'utf8');

// Split into lines and skip first row (title)
const lines = csvContent.trim().split('\n');
const headerLine = lines[1]; // Second line is the actual header
const dataLines = lines.slice(2); // Start from third line

// Parse header
const headers = headerLine.split(',').map(h => h.trim());
console.log('Headers:', headers);

// Approximate coordinates for different blocks/panchayats in Nagpur district
const blockCoordinates = {
  'BHIWAPUR': { lat: 21.009, lng: 78.957 },
  'HINGNA': { lat: 21.017, lng: 79.163 },
  'KALAMESHWAR': { lat: 21.265, lng: 79.003 },
  'KAMPTEE': { lat: 21.220, lng: 79.197 },
  'KATOL': { lat: 21.057, lng: 78.827 },
  'KUHI': { lat: 21.032, lng: 79.049 },
  'MAUDA': { lat: 21.283, lng: 79.133 },
  'NAGPUR': { lat: 21.146, lng: 79.088 },
  'NARKHED': { lat: 21.433, lng: 78.973 },
  'PARSEONI': { lat: 21.020, lng: 79.300 },
  'RAMTEK': { lat: 21.354, lng: 79.352 },
  'SAONER': { lat: 21.452, lng: 78.952 },
  'UMRED': { lat: 20.853, lng: 79.320 }
};

// Track location counts for offsetting
const locationCounts = {};

// Parse each data line
const features = dataLines
  .filter(line => line.trim() && !line.startsWith('Fluoride'))
  .map(line => {
    const columns = line.split(',');
    if (columns.length < 13 || !columns[0] || !columns[12]) return null;
    
    const block = (columns[2] || 'NAGPUR').toUpperCase().trim();
    const baseCoords = blockCoordinates[block] || blockCoordinates['NAGPUR'];
    
    // Create a unique location key for offsetting
    const locationKey = `${block}-${columns[4]}-${columns[7]}`;
    locationCounts[locationKey] = (locationCounts[locationKey] || 0) + 1;
    
    // Add small random offset to prevent exact overlaps
    const offsetMultiplier = locationCounts[locationKey];
    const latOffset = (Math.random() - 0.5) * 0.01 * offsetMultiplier;
    const lngOffset = (Math.random() - 0.5) * 0.01 * offsetMultiplier;
    
    const fluoride = parseFloat(columns[12].trim());
    if (isNaN(fluoride)) return null;
    
    const category = fluoride >= 5.0 ? 'Critical' : 
                    fluoride > 1.5 ? 'High' : 
                    fluoride > 1.0 ? 'Moderate' : 'Safe';
    
    return {
      type: 'Feature',
      properties: {
        srNo: columns[0].trim(),
        district: columns[1].trim(),
        block: columns[2].trim(),
        panchayat: columns[3].trim(),
        village: columns[4].trim(),
        habitation: columns[5].trim(),
        labName: columns[6].trim(),
        location: columns[7].trim(),
        sourceType: columns[8].trim(),
        fluoride: fluoride,
        sampleReceiving: columns[9].trim(),
        sampleTesting: columns[10].trim(),
        labRefNo: columns[11].trim(),
        remark: columns[13] ? columns[13].trim() : 'UNFIT',
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
  })
  .filter(f => f !== null);

// Create GeoJSON object
const geojson = {
  type: 'FeatureCollection',
  features: features
};

// Write to file
fs.writeFileSync('./public/nagpur.geojson', JSON.stringify(geojson, null, 2));

console.log(`\n✓ Generated GeoJSON with ${features.length} fluoride testing locations`);
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
