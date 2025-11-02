const fs = require('fs');
const path = require('path');

// seeded RNG
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function normalSample(rng, mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * std;
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

async function fetchSP500Names() {
  const url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch ' + url);
  const html = await res.text();
  // extract first table with class wikitable
  const tableMatch = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[\s\S]*?<\/table>/i);
  if (!tableMatch) throw new Error('Could not find wikitable in page');
  const tableHtml = tableMatch[0];
  // extract rows
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const names = [];
  let rowMatch;
  while ((rowMatch = rowRe.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    // get all tds
    const tds = [];
    let tdMatch;
    tdRe.lastIndex = 0;
    while ((tdMatch = tdRe.exec(rowHtml)) !== null) {
      tds.push(tdMatch[1]);
    }
    // typical table: first td ticker, second td company name
    if (tds.length >= 2) {
      const rawName = stripTags(tds[1]);
      if (rawName) names.push(rawName);
    }
  }
  // dedupe
  const unique = Array.from(new Set(names));
  return unique;
}

(async function main(){
  try {
    console.log('Fetching S&P 500 names from Wikipedia...');
    const names = await fetchSP500Names();
    console.log('Found', names.length, 'names');
    // sort alphabetically
    names.sort((a,b)=> a.localeCompare(b, 'en', {sensitivity:'base'}));
    const take = 500;
    const selected = names.slice(0, take);
    if (selected.length < take) throw new Error('Not enough company names extracted: ' + selected.length);

    const outDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const seed = 424242;
    const rng = mulberry32(seed);
    const lawParams = [
      { mean: 0.45, std: 0.25 },
      { mean: -0.1, std: 0.4 },
      { mean: 0.2, std: 0.35 },
      { mean: -0.3, std: 0.3 },
      { mean: 0.0, std: 0.5 },
    ];

    for (let k = 0; k < lawParams.length; k++) {
      const { mean, std } = lawParams[k];
      const lines = ['company_name,score'];
      for (let i = 0; i < selected.length; i++) {
        let s = normalSample(rng, mean, std);
        if (s > 1) s = 1;
        if (s < -1) s = -1;
        lines.push(`"${selected[i].replace(/"/g,'""')}",${s.toFixed(4)}`);
      }
      const filename = path.join(outDir, `law_${k+1}.csv`);
      fs.writeFileSync(filename, lines.join('\n'));
      console.log('Wrote', filename);
    }

    console.log('Done: generated', lawParams.length, 'law CSVs using S&P 500 names (alphabetical, first 500)');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
