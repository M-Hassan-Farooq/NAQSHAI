import { checkRegulatoryStatus } from '../lib/regulatoryRegistry.js';

const testCases = [
  { society: 'Sector G-13', city: 'Islamabad' },
  { society: 'Multi Gardens B-17', city: 'Islamabad' },
  { society: 'Gulberg Greens', city: 'Islamabad' },
  { society: 'DHA Phase 2', city: 'Islamabad' },
  { society: 'Bahria Town', city: 'Rawalpindi' },
  { society: 'Park View City', city: 'Islamabad' },
  { society: 'Ghauri Town', city: 'Islamabad' },
  { society: 'Abdullah City', city: 'Rawalpindi' },
  { society: 'Unknown Green City', city: 'Islamabad' },
  { society: 'Rawalpindi Cantt', city: 'Rawalpindi' }
];

console.log('=== NAQSHAI REGULATORY COMPLIANCE TEST SUITE ===\n');

for (const t of testCases) {
  const result = checkRegulatoryStatus(t.society, t.city);
  console.log(`[TEST] "${t.society}, ${t.city}"`);
  console.log(`  -> Status: ${result.statusLabel} [Tier: ${result.tier}]`);
  console.log(`  -> Authority: ${result.authority} (${result.jurisdiction})`);
  console.log(`  -> Badge: ${result.badgeText} (${result.badgeColor})`);
  console.log(`  -> NOC: ${result.nocNumber}`);
  if (result.warning) console.log(`  -> ⚠️ Warning: ${result.warning}`);
  console.log('');
}
