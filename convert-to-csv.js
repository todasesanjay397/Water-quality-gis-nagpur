const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Convert DPDC fluoride 2020-21.xlsx
const file1 = path.join(publicDir, 'DPDC fluoride  2020-21.xlsx');
const workbook1 = XLSX.readFile(file1);
const sheetName1 = workbook1.SheetNames[0];
const worksheet1 = workbook1.Sheets[sheetName1];
const csv1 = XLSX.utils.sheet_to_csv(worksheet1);
fs.writeFileSync(path.join(publicDir, 'DPDC-fluoride-2020-21.csv'), csv1);
console.log('✓ Converted: DPDC fluoride 2020-21.xlsx → DPDC-fluoride-2020-21.csv');

// Convert updated all block 2 year repeated source list F affected.xlsx
const file2 = path.join(publicDir, 'updated all block 2 year repeated source list F affected.xlsx');
const workbook2 = XLSX.readFile(file2);
const sheetName2 = workbook2.SheetNames[0];
const worksheet2 = workbook2.Sheets[sheetName2];
const csv2 = XLSX.utils.sheet_to_csv(worksheet2);
fs.writeFileSync(path.join(publicDir, 'updated-all-block-2-year-repeated-source-list-F-affected.csv'), csv2);
console.log('✓ Converted: updated all block 2 year repeated source list F affected.xlsx → updated-all-block-2-year-repeated-source-list-F-affected.csv');

console.log('\nBoth files converted successfully!');
