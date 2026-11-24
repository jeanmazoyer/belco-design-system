// Nomme chaque classe racine servie en prod avec les props DS (matrice) : identique → nom exact ; sinon la combinaison la plus proche.
const fs = require('fs');
const { matrix, rulesByClass } = JSON.parse(fs.readFileSync('out/matrix.json', 'utf8'));
const D = JSON.parse(fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'orica-iso.json'), 'utf8'));
const base = (rules, cls) => (rules || []).find(r => r.startsWith('.' + cls + ' {')) || (rules || []).find(r => r.startsWith('.' + cls + '{'));
const decls = r => { if (!r) return null; const body = r.slice(r.indexOf('{') + 1, r.lastIndexOf('}')); const set = new Set(); for (const d of body.split(';')) { const i = d.indexOf(':'); if (i < 0) continue; const prop = d.slice(0, i).trim(); if (/^-(webkit|moz|ms)-/.test(prop)) continue; const val = d.slice(i + 1).trim().replace(/\s+/g, ' '); if (!val || /^-(webkit|moz|ms)-/.test(val)) continue; set.add(prop + ': ' + val); } return set; };
const carriers = Object.entries(matrix).filter(([c, m]) => m.carrier).map(([c, m]) => ({ c, m, d: decls(base(rulesByClass[c], c)) })).filter(x => x.d && x.d.size);
const ctxOf = {}; for (const smp of Object.values(D.samples)) for (const mm of smp.html.matchAll(/class="([^"]+)"/g)) { const cls = mm[1].split(/\s+/); const css = cls.filter(c => c.startsWith('css-')); const ch = cls.filter(c => c.startsWith('chakra-')); for (const c of css) { ctxOf[c] = ctxOf[c] || new Set(); ch.forEach(x => ctxOf[c].add(x)); } }
const compOfCtx = ctx => { const s = [...ctx].join(' '); if (/chakra-tabs__tab\b/.test(s)) return 'Tabs'; if (/chakra-checkbox/.test(s)) return 'Checkbox'; if (/chakra-radio/.test(s)) return 'Radio'; if (/chakra-form__label/.test(s)) return 'FormLabel'; if (/chakra-menu__menu-list/.test(s)) return 'Menu'; if (/chakra-table\b/.test(s)) return 'Table'; if (/chakra-button/.test(s)) return 'Button'; const m = s.match(/chakra-([a-z]+)/); return m ? m[1][0].toUpperCase() + m[1].slice(1) : null; };
const out = {};
const prodClasses = [...new Set(Object.values(D.samples).flatMap(s => (s.sig.match(/css-[a-z0-9]+/g) || [])))];
for (const c of prodClasses) {
  const pd = decls(base(D.rulesByClass[c], c)); if (!pd || !pd.size) continue;
  const comp = compOfCtx(ctxOf[c] || new Set());
  let best = null;
  for (const x of carriers) { if (comp && x.m.component !== comp && !(comp === 'Button' && x.m.component === 'IconButton')) continue; let inter = 0; for (const k of pd) if (x.d.has(k)) inter++; const sim = inter / (pd.size + x.d.size - inter); if (!best || sim > best.sim) best = { cls: x.c, sim, m: x.m }; }
  if (best && best.sim >= 0.7) out[c] = { component: best.m.component, props: best.m.props, sim: +best.sim.toFixed(3), exact: best.sim === 1 };
}
fs.writeFileSync('out/prod-names.json', JSON.stringify(out, null, 1));
console.log('classes racines prod:', prodClasses.length, '; nommées:', Object.keys(out).length, '; exactes:', Object.values(out).filter(x => x.exact).length);
for (const c of ['css-umgg81', 'css-9u5p6t', 'css-bquyvs', 'css-dvj57b', 'css-j45hbs', 'css-39ivzn', 'css-1e8kyhm', 'css-mfnris', 'css-gpd2jp', 'css-gb6hna', 'css-1tzmuxv', 'css-18oor2t', 'css-13e5vvr', 'css-h1zm47']) if (out[c]) console.log(c, '→', out[c].component, JSON.stringify(out[c].props), Math.round(out[c].sim * 100) + '%');
