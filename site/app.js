// Bildbank för Tapwell Group. Samma kod för alla sajter: ?sajt=rooh | haven | bricmate | tapwell
// ?intro=0 döljer första blocket. Inbäddad (i <object>/<iframe>) döljs sidhuvud, brödsmula och sidfot automatiskt.
const SITES = {
  rooh: { brand: "ROOH", host: "rooh.se", url: "https://rooh.se", contact: "https://rooh.se/support/kontakt", logo: "assets/logo.svg",
    nav: ["Duschlösningar", "Serier", "Inspiration", "Speciallösningar"],
    filters: [{ a: "Serie", t: "Välj serie" }, { a: "Modell", t: "Välj modell" }, { a: "Glas", t: "Välj glas", sw: "glas" }, { a: "Färg på beslag", t: "Välj färg på beslag", sw: "farg" }],
    lede: "Här hittar du miljöbilder på ROOH:s duschlösningar för webbshop, katalog och annonser. Välj serie, modell, glas och färg på beslag för att hitta badrum som visar precis den lösning du säljer." },
  bricmate: { brand: "Bricmate", host: "bricmate.se", url: "https://bricmate.se", contact: "https://bricmate.se",
    nav: ["Plattor", "Kollektioner", "Inspiration", "Hitta butik"],
    filters: [{ a: "Kollektion", t: "Välj kollektion" }, { a: "Färg", t: "Välj färg" }],
    lede: "Miljöbilder där Bricmates plattor används. Välj kollektion och färg för att hitta badrum med plattan du säljer." },
  haven: { brand: "Haven", host: "haven.se", url: "https://haven.se", contact: "https://haven.se/hitta-aterforsaljare",
    nav: ["Badrumsmöbler", "Serier", "Inspiration", "Återförsäljare"],
    filters: [{ a: "Produkttyp", t: "Välj produkt" }, { a: "Serie", t: "Välj serie" }, { a: "Färg", t: "Välj färg" }],
    lede: "Miljöbilder där Havens badrumsmöbler finns med. Välj produkt, serie och färg för att hitta rätt badrum." },
  tapwell: { brand: "Tapwell", host: "tapwell.se", url: "https://tapwell.se", contact: "https://tapwell.se/vanliga-fragor",
    nav: ["Blandare", "Serier", "Inspiration", "Återförsäljare"],
    filters: [{ a: "Produkttyp", t: "Välj produkt" }, { a: "Serie", t: "Välj serie" }, { a: "Finish", t: "Välj finish", sw: "farg" }],
    lede: "Miljöbilder där Tapwells blandare, duschar och handdukstorkar finns med. Välj produkt, serie och finish för att hitta rätt badrum." }
};
const SW_FARG = { "Br Bl Chrome": "sw-BrBc", "Brushed Black Chrome": "sw-BrBc", "Bronze": "sw-BR", "Brushed Nickel": "sw-BN", "Chrome": "sw-CR", "Polished": "sw-CR",
  "Matte black": "sw-MB", "Matte Black": "sw-MB", "Brass": "sw-LU", "Polished Brass": "sw-LU", "Honey gold": "sw-HG", "Honey Gold": "sw-HG" };
const SW_GLAS = { "Klarglas": "gl-klar.jpg", "Räfflat": "gl-raffl.jpg" };
const LABEL = { "Br Bl Chrome": "Brushed Black Chrome", "Brass": "Polished Brass", "Klarglas": "Klart glas", "Räfflat": "Räfflat glas" };
const ORDER = { Serie: ["R2", "R3", "R4"], Modell: ["Duschhörna", "Duschnisch", "Duschvägg"] };
const PAGE = 36;

const $ = id => document.getElementById(id);
const lab = v => LABEL[v] || v;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const params = new URLSearchParams(location.search);
let embedded = false; try { embedded = window.self !== window.top; } catch { embedded = true; }
if (params.get("inbaddad") === "1") embedded = true;

let SC = {}, IMGS = [], site = SITES[params.get("sajt")] ? params.get("sajt") : "rooh";
let F = {}, open = {}, picked = new Set(), q = "", shown = PAGE;

const prodOf = (scene, brand) => (SC[scene]?.products || []).filter(p => p.brand === brand);
const attrVals = (img, attr) => prodOf(img.s, SITES[site].brand).map(p => p.attrs && p.attrs[attr]).filter(Boolean);
const siteImgs = () => IMGS.filter(i => prodOf(i.s, SITES[site].brand).length);
const webbUrl = it => "bilder/webb/" + encodeURIComponent(it.seo);

function ok(img, skip) {
  for (const f of SITES[site].filters) {
    if (f.a === skip) continue;
    const sel = F[f.a];
    if (sel && sel.size && !attrVals(img, f.a).some(v => sel.has(v))) return false;
  }
  if (q) {
    const t = (img.id + " " + SC[img.s].name + " " + img.seo + " " + (SC[img.s].products || []).map(p => p.name).join(" ")).toLowerCase();
    if (!q.split(/\s+/).every(w => t.includes(w))) return false;
  }
  return true;
}

function sorts() {
  const S = SITES[site], f0 = S.filters[0]?.a, f1 = S.filters[1]?.a, last = S.filters[S.filters.length - 1]?.a;
  const key = (i, a) => attrVals(i, a)[0] || "~";
  const ord = (a, v) => ORDER[a] ? String(ORDER[a].indexOf(v)).padStart(2, "0") : v;
  return [
    ["prod", `${f0}${f1 ? " och " + f1.toLowerCase() : ""}`, (a, b) => (ord(f0, key(a, f0)) + ord(f1, key(a, f1)) + a.id).localeCompare(ord(f0, key(b, f0)) + ord(f1, key(b, f1)) + b.id, "sv")],
    ["last", last, (a, b) => (key(a, last) + a.id).localeCompare(key(b, last) + b.id, "sv")],
    ["id", "Badrum-ID", (a, b) => a.id.localeCompare(b.id)],
    ["badrum", "Badrum", (a, b) => (SC[a.s].name + a.id).localeCompare(SC[b.s].name + b.id, "sv")],
    ["mk", "Utvalda först", (a, b) => (b.mk - a.mk) || a.id.localeCompare(b.id)]
  ];
}

const chev = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 5l5 5 5-5" fill="none" stroke="#000" stroke-width="1.2"/></svg>';

function buildFilters() {
  const host = $("filters"); host.innerHTML = "";
  const base = siteImgs();
  for (const f of SITES[site].filters) {
    F[f.a] = F[f.a] || new Set();
    const vals = [...new Set(base.flatMap(i => attrVals(i, f.a)))]
      .sort((x, y) => ORDER[f.a] ? ORDER[f.a].indexOf(x) - ORDER[f.a].indexOf(y) : lab(x).localeCompare(lab(y), "sv"));
    const sel = [...F[f.a]].map(lab).join(", ") || "Alla";
    const d = document.createElement("div"); d.className = "acc"; d.dataset.open = !!open[f.a];
    d.innerHTML = `<button type="button" aria-expanded="${!!open[f.a]}">${esc(f.t)} (${esc(sel)})${chev}</button><div class="panel" ${open[f.a] ? "" : "hidden"}><div class="${f.sw ? "sw" : "opts"}"></div></div>`;
    d.querySelector("button").onclick = () => { open[f.a] = !open[f.a]; buildFilters(); };
    const box = d.querySelector(".panel>div");
    if (!vals.length) box.outerHTML = '<p class="note">Inga värden registrerade än.</p>';
    for (const v of vals) {
      const n = base.filter(i => attrVals(i, f.a).includes(v) && ok(i, f.a)).length;
      const b = document.createElement("button"); b.type = "button";
      b.setAttribute("aria-pressed", F[f.a].has(v)); b.disabled = !n && !F[f.a].has(v);
      if (f.sw) {
        const src = f.sw === "farg" ? (SW_FARG[v] ? `assets/${SW_FARG[v]}.png` : "") : (SW_GLAS[v] ? `assets/${SW_GLAS[v]}` : "");
        b.className = "swo"; b.innerHTML = `<span class="img"><i style="background-image:url('${src}')"></i></span>${esc(lab(v))}<small>${n} bilder</small>`;
      } else { b.className = "opt"; b.innerHTML = `${esc(lab(v))}<small>${n} bilder</small>`; }
      b.onclick = () => { F[f.a].has(v) ? F[f.a].delete(v) : F[f.a].add(v); shown = PAGE; render(); };
      box && box.appendChild(b);
    }
    host.appendChild(d);
  }
}

function prodLine(scene) {
  const by = {};
  for (const p of SC[scene].products || []) (by[p.brand] = by[p.brand] || []).push(esc(p.name.replace(new RegExp("^" + p.brand + " "), "")));
  const order = [SITES[site].brand, "ROOH", "Bricmate", "Haven", "Tapwell"].filter((v, i, a) => a.indexOf(v) === i);
  return order.filter(b => by[b]).map(b => `<b>${b}</b> ${by[b].join(", ")}`).join(" · ");
}

function render() {
  buildFilters();
  const act = $("active"); act.innerHTML = "";
  for (const a in F) for (const v of F[a]) {
    const c = document.createElement("button"); c.type = "button"; c.className = "chip"; c.textContent = lab(v) + " ×";
    c.onclick = () => { F[a].delete(v); render(); }; act.appendChild(c);
  }
  if (act.children.length) { const r = document.createElement("button"); r.type = "button"; r.className = "reset"; r.textContent = "Rensa alla"; r.onclick = clearAll; act.appendChild(r); }
  const so = sorts(), cur = $("sort").value;
  $("sort").innerHTML = so.map(s => `<option value="${s[0]}">${esc(s[1])}</option>`).join("");
  $("sort").value = so.some(s => s[0] === cur) ? cur : "prod";
  let list = siteImgs().filter(i => ok(i)).sort(so.find(s => s[0] === $("sort").value)[2]);
  if ($("one").checked) { const seen = new Set(); list = list.filter(i => !seen.has(i.s) && seen.add(i.s)); }
  $("count").textContent = "";
  const empty = $("empty"); empty.hidden = list.length > 0;
  empty.innerHTML = siteImgs().length
    ? `Inga bilder matchar dina val. <button class="reset" type="button" id="reset2">Rensa val</button>`
    : `Det finns inga badrum med ${esc(SITES[site].brand)}-produkter registrerade än.`;
  $("reset2") && ($("reset2").onclick = clearAll);
  const g = $("grid"); g.innerHTML = "";
  for (const it of list.slice(0, shown)) {
    const s = SC[it.s];
    const c = document.createElement("div"); c.className = "card"; c.tabIndex = 0; c.setAttribute("role", "button");
    c.setAttribute("aria-label", `${s.name}, ${it.id}`);
    c.innerHTML = `<div class="ph"><img loading="lazy" src="bilder/tumnagel/${esc(it.id)}.jpg" alt="${esc(s.name)}"></div>
      
      <button type="button" class="pick" aria-label="Lägg till ${esc(it.id)} i urval" aria-pressed="${picked.has(it.id)}">${picked.has(it.id) ? "✓" : "+"}</button>
      <div class="cap"><div class="n">${esc(s.name)}</div><div class="id">${esc(it.id)}</div><div class="pr">${prodLine(it.s)}</div></div>`;
    c.onclick = e => { if (e.target.closest(".pick")) { togglePick(it.id); return; } detail(it); };
    c.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); detail(it); } };
    g.appendChild(c);
  }
  $("more").hidden = list.length <= shown;
  $("basket").hidden = !picked.size;
  $("bcount").textContent = `${picked.size} ${picked.size === 1 ? "bild" : "bilder"} i urvalet`;
}
function togglePick(id) { picked.has(id) ? picked.delete(id) : picked.add(id); render(); }
function clearAll() { for (const a in F) F[a].clear(); $("one").checked = false; q = ""; $("q").value = ""; shown = PAGE; render(); }
function toast(t) { const e = $("toast"); e.textContent = t; e.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => e.hidden = true, 3500); }

let last = null;
function detail(it) {
  last = last || document.activeElement;
  const s = SC[it.s], S = SITES[site];
  const same = IMGS.filter(i => i.s === it.s);
  const brands = [S.brand, "ROOH", "Bricmate", "Haven", "Tapwell"].filter((v, i, a) => a.indexOf(v) === i);
  const plist = brands.map(b => {
    const ps = prodOf(it.s, b);
    return ps.length ? `<div><b>${b}</b>${ps.map(p => esc(p.name.replace(new RegExp("^" + b + " "), ""))).join("<br>")}</div>` : "";
  }).join("");
  const row = (l, v) => `<div><b>${l}:</b><span>${v || "–"}</span></div>`;
  const abs = new URL(webbUrl(it), location.href).href;
  $("ov").innerHTML = `<div class="wrap"><div class="top"><span class="crumb" style="padding:0">Bildbank / ${esc(s.id)} / ${esc(it.id)}</span><button class="x" type="button">Stäng ✕</button></div>
   <div class="pd">
    <div class="big"><img src="${webbUrl(it)}" alt="${esc(s.name)}">
      <div class="thumbs">${same.map(i => `<button type="button" aria-label="${esc(i.id)}" aria-current="${i.id === it.id}" data-i="${esc(i.id)}" style="background-image:url('bilder/tumnagel/${esc(i.id)}.jpg')"></button>`).join("")}</div></div>
    <div>
      <h1 id="pdtitle">${esc(s.name)}</h1>
      <p class="lead">Badrum ${esc(s.id)} · bild ${esc(it.id)}</p>
      <a class="btn dark" href="${webbUrl(it)}" download="${esc(it.seo)}" style="width:100%">Ladda ner bild<br><span class="note" style="color:#bbb">JPG ${it.ww ? it.ww + " × " + it.wh + " px" : ""} · för webb</span></a>
      <p class="note" style="margin:8px 0 0">Behöver du bilden för tryck? <a class="u" href="${S.contact}" target="_blank" rel="noopener">Kontakta ${esc(S.brand)}</a> och ange bild-ID <b style="color:#000">${esc(it.id)}</b>.</p>
      <div class="lnk"><input id="lnk" readonly value="${esc(abs)}" aria-label="Fast bildlänk"><button class="btn" type="button" id="cp" style="padding:9px 14px">Kopiera länk</button></div>
      <button class="btn" type="button" id="dp" style="margin-top:10px;width:100%">${picked.has(it.id) ? "✓ Ligger i urvalet" : "Lägg till i urval"}</button>
      <h3>Produkter i badrummet</h3><div class="plist">${plist}</div>
      <h3>Om bilden</h3>
      <div class="sum">${row("Bild-ID", esc(it.id))}${row("Badrum-ID", esc(s.id))}${row("Filnamn", esc(it.seo))}${row("Storlek", it.ww ? it.ww + " × " + it.wh + " px, JPG" : "")}${row("Format", esc(it.o))}</div>
    </div></div></div>`;
  const ov = $("ov"); ov.hidden = false; document.body.style.overflow = "hidden"; ov.scrollTop = 0;
  ov.querySelector(".x").onclick = closeDetail; ov.querySelector(".x").focus();
  ov.querySelectorAll(".thumbs button").forEach(b => b.onclick = () => detail(IMGS.find(i => i.id === b.dataset.i)));
  $("cp").onclick = () => {
    const i = $("lnk");
    (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject())
      .then(() => toast("Länken är kopierad"), () => { i.select(); toast("Länken är markerad. Tryck Ctrl+C för att kopiera."); });
  };
  $("dp").onclick = () => { togglePick(it.id); detail(it); };
}
function closeDetail() { $("ov").hidden = true; document.body.style.overflow = ""; last?.focus?.(); last = null; }

async function downloadZip() {
  if (!window.JSZip) { toast("Zip-funktionen laddas fortfarande. Försök igen om en stund."); return; }
  const items = IMGS.filter(i => picked.has(i.id));
  const btn = $("bdl"); btn.disabled = true;
  try {
    const zip = new JSZip();
    let n = 0;
    for (const it of items) {
      btn.textContent = `Hämtar ${++n} av ${items.length} …`;
      const r = await fetch(webbUrl(it));
      if (!r.ok) throw new Error(it.seo);
      zip.file(it.seo, await r.blob());
    }
    btn.textContent = "Packar …";
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `${SITES[site].brand.toLowerCase()}-bildbank-${items.length}-bilder.zip`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    toast(`${items.length} bilder är nedladdade som zip-fil.`);
  } catch (e) {
    toast("Det gick inte att hämta alla bilder. Försök igen, eller ladda ner dem en och en.");
  } finally { btn.disabled = false; btn.textContent = "Ladda ner urval (zip)"; }
}

function setSite(k) {
  site = k; const S = SITES[k]; F = {}; open = {}; shown = PAGE;
  $("sites").innerHTML = Object.entries(SITES).map(([id, s]) => `<button type="button" data-s="${id}" aria-pressed="${id === k}">${s.host}</button>`).join("");
  $("sites").querySelectorAll("button").forEach(b => b.onclick = () => { setSite(b.dataset.s); const u = new URL(location.href); u.searchParams.set("sajt", b.dataset.s); history.replaceState(null, "", u); });
  $("logo").innerHTML = S.logo ? `<img src="${S.logo}" alt="${S.brand}">` : `<span>${S.brand.toUpperCase()}</span>`;
  $("logo").href = S.url; $("logo").setAttribute("aria-label", `${S.brand} startsida`);
  $("navl").innerHTML = S.nav.map(n => `<a href="${S.url}" target="_blank" rel="noopener">${n}</a>`).join("");
  $("navSupport").href = S.contact; $("navOm").textContent = `Om ${S.brand}`; $("navOm").href = S.url;
  $("lede").textContent = S.lede;
  $("contact").href = S.contact;
  if (k !== "rooh") { const first = siteImgs().find(i => i.o === "Liggande") || siteImgs()[0]; if (first) $("hero").src = webbUrl(first); }
  else $("hero").src = "assets/hero.jpg";
  $("foot").textContent = `${S.brand} är en del av Tapwell Group. Bilderna får användas för att marknadsföra produkterna som visas.`;
  document.title = `${S.brand} Bildbank`;
  render();
}

document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("ov").hidden) closeDetail(); });
$("one").onchange = () => { shown = PAGE; render(); };
$("sort").onchange = render;
$("q").oninput = e => { q = e.target.value.trim().toLowerCase(); shown = PAGE; render(); };
$("moreBtn").onclick = () => { shown += PAGE; render(); };
$("bclear").onclick = () => { picked.clear(); render(); };
$("bdl").onclick = downloadZip;

if (embedded) {
  document.body.classList.add("embed");
  $("siteHeader").hidden = true; $("crumb").hidden = true; $("foot").hidden = true;
} else {
  $("demo").hidden = false;
}
if (params.get("intro") === "0") $("intro").hidden = true;

fetch("bilder.json", { cache: "no-cache" }).then(r => r.json()).then(d => {
  d.scenes.forEach(s => SC[s.id] = s); IMGS = d.images; setSite(site);
}).catch(() => { $("grid").innerHTML = '<p class="empty">Bilderna kunde inte laddas. Ladda om sidan.</p>'; });
