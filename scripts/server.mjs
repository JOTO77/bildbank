// Lokal förhandsvisning: node scripts/server.mjs  → http://localhost:5180
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = join(fileURLToPath(new URL('..', import.meta.url)), 'site');
const typer = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT) || 5180;

createServer(async (req, res) => {
  const sokvag = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([\\/]\.\.)+/, '');
  const fil = join(rot, sokvag.endsWith('/') || sokvag.endsWith('\\') ? join(sokvag, 'index.html') : sokvag);
  if (!fil.startsWith(rot)) { res.writeHead(403).end(); return; }
  try {
    const data = await readFile(fil);
    res.writeHead(200, { 'Content-Type': typer[extname(fil).toLowerCase()] || 'application/octet-stream' }).end(data);
  } catch {
    res.writeHead(404).end('Hittades inte');
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
