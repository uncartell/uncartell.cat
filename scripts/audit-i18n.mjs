import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = new URL('../', import.meta.url);
const ignored = new Set(['vendor-qrcode-generator.js', 'vendor-supabase.js']);
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'i18n') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (['.html', '.js'].includes(extname(entry.name)) && !ignored.has(entry.name)) files.push(path);
  }
}
await walk(root.pathname);
const literal = /(['"`])(?:(?!\1)[^\\\n]|\\.)*[À-ÿ](?:(?!\1)[^\\\n]|\\.)*\1/g;
let total = 0;
const inventory = [];
for (const path of files.sort()) {
  const text = await readFile(path, 'utf8');
  const matches = text.match(literal) || [];
  if (!matches.length) continue;
  total += matches.length;
  inventory.push({ file: relative(root.pathname, path), candidates: matches.length });
}
console.log(JSON.stringify({ scannedFiles: files.length, hardcodedLocaleCandidates: total, inventory }, null, 2));
