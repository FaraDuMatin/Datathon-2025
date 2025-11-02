const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (let k = 1; k <= 5; k++) {
  const lines = ['company_name,score'];
  for (let i = 1; i <= 500; i++) {
    const base = -1 + 2 * (i - 1) / 499;
    const factor = 1 - (k - 1) * 0.08; // small variation per law
    let val = base * factor;
    if (val > 1) val = 1;
    if (val < -1) val = -1;
    lines.push(`Company_${String(i).padStart(4, '0')},${val.toFixed(4)}`);
  }
  fs.writeFileSync(path.join(outDir, `law_${k}.csv`), lines.join('\n'));
}
console.log('CSV files generated in', outDir);
