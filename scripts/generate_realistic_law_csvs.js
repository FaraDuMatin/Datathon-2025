const fs = require('fs');
const path = require('path');

// Small seeded RNG (mulberry32) for reproducibility
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Box-Muller for normal samples using our rng
function normalSample(rng, mean = 0, std = 1) {
  // use Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * std;
}

const seed = 12345; // changeable
const rng = mulberry32(seed);

const outDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Small lists to create realistic-sounding company names
const prefixes = ['Global', 'Advanced', 'Prime', 'Unified', 'National', 'United', 'First', 'Pioneer', 'Next', 'Apex', 'Summit', 'Bright', 'Capital', 'Core', 'Crest', 'Silver', 'Green', 'Blue', 'Quantum', 'Vertex'];
const nouns = ['Technologies','Solutions','Systems','Logistics','Foods','Holdings','Networks','Enterprises','Dynamics','Pharma','Energy','Consulting','Manufacturing','Design','Services','Retail','Analytics','Partners','Ventures','Industries'];
const suffixes = ['Inc', 'LLC', 'Corp', 'Group', 'Co', 'PLC', 'AG', 'SA', 'BV', 'GmbH'];

// Build 500 unique names by composition and some indexing fallback
function makeCompanyNames(count) {
  const names = new Set();
  let attempts = 0;
  while (names.size < count && attempts < count * 10) {
    const p = prefixes[Math.floor(rng() * prefixes.length)];
    const n = nouns[Math.floor(rng() * nouns.length)];
    const s = suffixes[Math.floor(rng() * suffixes.length)];
    // Occasionally add a geographic or sector token
    const maybeCity = rng() < 0.12 ? ['Global','North','South','East','West','Metro'][Math.floor(rng()*6)] + ' ' : '';
    const name = `${maybeCity}${p} ${n} ${s}`.replace(/\s+/g,' ').trim();
    names.add(name);
    attempts++;
  }
  // If still less than count, add numbered suffixes
  let i = 1;
  while (names.size < count) {
    names.add(`Acme ${i++} Co`);
  }
  return Array.from(names).slice(0, count);
}

const companyNames = makeCompanyNames(500);

// For each law, choose a mean and stddev for score distribution
// Means chosen to represent different typical impacts (range -0.4..0.6)
const lawParams = [
  { mean: 0.45, std: 0.25 }, // law 1 — generally positive (high effect)
  { mean: -0.1, std: 0.4 },  // law 2 — mixed/mostly small negative
  { mean: 0.2, std: 0.35 },  // law 3 — small positive
  { mean: -0.3, std: 0.3 },  // law 4 — negative impact for many
  { mean: 0.0, std: 0.5 },   // law 5 — wide variability
];

for (let k = 0; k < lawParams.length; k++) {
  const { mean, std } = lawParams[k];
  const lines = ['company_name,score'];
  for (let i = 0; i < companyNames.length; i++) {
    // sample a normal value and clamp to [-1,1]
    let s = normalSample(rng, mean, std);
    if (s > 1) s = 1;
    if (s < -1) s = -1;
    // Round to 4 decimals
    const out = s.toFixed(4);
    lines.push(`${companyNames[i]},${out}`);
  }
  const filename = path.join(outDir, `law_${k+1}.csv`);
  fs.writeFileSync(filename, lines.join('\n'));
  console.log('Wrote', filename);
}

console.log('Done: generated', lawParams.length, 'law CSVs in', outDir);
