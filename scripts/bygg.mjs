// Bygger site/bilder.json från CSV-filerna i data/.
// Körs av GitHub Actions vid varje push, eller lokalt: node scripts/bygg.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rot = fileURLToPath(new URL('..', import.meta.url));
const site = join(rot, 'site');

// Semikolonseparerad CSV med citattecken, som Excel sparar den.
function lasCsv(fil) {
  const text = readFileSync(join(rot, 'data', fil), 'utf8').replace(/^﻿/, '');
  const rader = []; let rad = [], falt = '', citat = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (citat) {
      if (c === '"' && text[i + 1] === '"') { falt += '"'; i++; }
      else if (c === '"') citat = false;
      else falt += c;
    } else if (c === '"') citat = true;
    else if (c === ';') { rad.push(falt); falt = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      rad.push(falt); falt = '';
      if (rad.some(v => v.trim() !== '')) rader.push(rad);
      rad = [];
    } else falt += c;
  }
  if (falt !== '' || rad.length) { rad.push(falt); if (rad.some(v => v.trim() !== '')) rader.push(rad); }
  const [rubrik, ...resten] = rader;
  const nycklar = rubrik.map(h => h.trim().toLowerCase());
  return resten.map(r => Object.fromEntries(nycklar.map((k, i) => [k, (r[i] ?? '').trim()])));
}
const ja = v => /^(ja|j|x|yes|1)$/i.test(v || '');
const nej = v => /^(nej|n|no|0)$/i.test(v || '');

// Vilka fält varje varumärke filtrerar på (måste matcha SITES i site/app.js).
function attribut(p) {
  switch (p.varumarke) {
    case 'ROOH': return { Serie: p.serie, Modell: p.modell, Glas: p.glas, 'Färg på beslag': p.farg };
    case 'Bricmate': return { Kollektion: p.kollektion, 'Färg': p.farg };
    case 'Tapwell': return { Produkttyp: p.produkttyp, Serie: p.serie, Finish: p.farg };
    case 'Haven': return { Produkttyp: p.produkttyp, Serie: p.serie, 'Färg': p.farg };
    default: return { Produkttyp: p.produkttyp, Serie: p.serie, 'Färg': p.farg };
  }
}

const badrum = lasCsv('badrum.csv').filter(b => b.badrum && !nej(b.visa));
const produkter = lasCsv('produkter.csv').filter(p => p.badrum && p.varumarke);
const bilder = lasCsv('bilder.csv').filter(b => b.bild && !nej(b.visa));

const varningar = [];
const kanda = new Set(badrum.map(b => b.badrum));
const scenes = badrum.map(b => ({
  id: b.badrum, name: b.namn, env: b.miljo,
  products: produkter.filter(p => p.badrum === b.badrum).map(p => {
    const attrs = Object.fromEntries(Object.entries(attribut(p)).filter(([, v]) => v && v !== '–'));
    const conf = p.sakerhet ? p.sakerhet[0].toUpperCase() + p.sakerhet.slice(1).toLowerCase() : 'Säker';
    return { brand: p.varumarke, name: p.namn, conf, attrs };
  })
}));
for (const p of produkter) if (!kanda.has(p.badrum)) varningar.push(`Produkt för okänt eller dolt badrum ${p.badrum}: ${p.namn}`);

const images = [];
for (const b of bilder) {
  if (!kanda.has(b.badrum)) { varningar.push(`Bild ${b.bild} hör till okänt eller dolt badrum ${b.badrum}`); continue; }
  if (!existsSync(join(site, 'bilder', 'webb', b.filnamn))) { varningar.push(`Saknar webbfil för ${b.bild}: bilder/webb/${b.filnamn}`); continue; }
  if (!existsSync(join(site, 'bilder', 'tumnagel', `${b.bild}.jpg`))) varningar.push(`Saknar tumnagel för ${b.bild}`);
  images.push({ id: b.bild, s: b.badrum, seo: b.filnamn, o: b.orientering, ww: Number(b.bredd) || null, wh: Number(b.hojd) || null, mk: ja(b.utvald), chk: ja(b.granska) });
}

writeFileSync(join(site, 'bilder.json'), JSON.stringify({ byggd: new Date().toISOString(), scenes, images }));
console.log(`Badrum: ${scenes.length}  Produkter: ${produkter.length}  Bilder: ${images.length}`);
for (const v of varningar) console.warn('Varning: ' + v);
