#!/usr/bin/env node

const fs = require('fs');

// Read the data
const provisos = JSON.parse(fs.readFileSync('provisos.json', 'utf8'));
const appropriationsWithProvisos = JSON.parse(fs.readFileSync('appropriations-with-provisos.json', 'utf8'));

console.log('Original file sizes:');
console.log('- provisos.json:', (fs.statSync('provisos.json').size / 1024 / 1024).toFixed(2), 'MB');
console.log('- appropriations-with-provisos.json:', (fs.statSync('appropriations-with-provisos.json').size / 1024 / 1024).toFixed(2), 'MB');

// Create optimized version: reference provisos by ID instead of duplicating
const optimized = appropriationsWithProvisos.map(approp => ({
  ...approp,
  provisos: approp.provisos.map(p => {
    // Find matching proviso and return just the number
    const match = provisos.findIndex(prov =>
      prov.section === approp.section &&
      prov.agency === approp.agency &&
      prov.billNumber === approp.billNumber &&
      prov.provisoNumber === p.provisoNumber
    );
    return match;
  })
}));

fs.writeFileSync('appropriations-with-provisos.json', JSON.stringify(optimized, null, 2));

console.log('\nOptimized file size:');
console.log('- appropriations-with-provisos.json:', (fs.statSync('appropriations-with-provisos.json').size / 1024 / 1024).toFixed(2), 'MB');

// Create a summary version for quick reference
const summary = {
  totalProvisos: provisos.length,
  totalAppropriations: appropriationsWithProvisos.length,
  agencies: [...new Set(provisos.map(p => p.agency))].sort(),
  categories: [...new Set(provisos.flatMap(p => p.categories))].sort(),
  biennia: [...new Set(provisos.map(p => p.biennium).filter(b => b))].sort(),
  note: "Full data available in provisos.json. Use proviso-search.html for interactive search."
};

fs.writeFileSync('data-summary.json', JSON.stringify(summary, null, 2));
console.log('- data-summary.json:', (fs.statSync('data-summary.json').size / 1024).toFixed(2), 'KB');
