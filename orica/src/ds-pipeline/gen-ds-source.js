// Assemble ds-source.json : tokens et thème du DS Hub (source), stories rendues (HTML + CSS normalisé), correspondance avec le relevé prod.
const fs = require('fs'), path = require('path');
const SRC = process.argv[2]; const PROD = process.argv[3] || require('path').join(__dirname, '..', 'orica-iso.json');
const theme = require('./out/theme.cjs').default;
const vars = JSON.parse(fs.readFileSync('out/theme-vars.json', 'utf8'));
const { results } = JSON.parse(fs.readFileSync('out/stories.json', 'utf8'));
const DS = JSON.parse(fs.readFileSync('out/ds-rules.json', 'utf8'));
const D = JSON.parse(fs.readFileSync(PROD, 'utf8'));
const norm = v => String(v).replace(/\s+/g, ' ').replace(/, /g, ',').trim();

/* tokens : source vs prod */
const prod = D.tokens; const srcVars = {}; for (const [k, v] of Object.entries(vars)) if (k.startsWith('--chakra-')) srcVars[k] = v;
const tokenDiff = { changed: [], onlyProd: [], onlySource: [] };
for (const k of Object.keys(srcVars)) { if (!(k in prod)) tokenDiff.onlySource.push(k); else if (norm(srcVars[k]) !== norm(prod[k])) tokenDiff.changed.push({ k, source: srcVars[k], prod: prod[k] }); }
for (const k of Object.keys(prod)) if (!(k in srcVars)) tokenDiff.onlyProd.push(k);

/* thème : composants surchargés par le DS + schémas de couleur lus dans la source */
const overridden = fs.readdirSync(path.join(SRC, 'chakra', 'components')).filter(d => fs.statSync(path.join(SRC, 'chakra', 'components', d)).isDirectory());
const components = {};
for (const [name, def] of Object.entries(theme.components)) {
  let colorSchemes = []; let note = '';
  if (overridden.includes(name) || name === 'FormLabel' || name === 'FormError') {
    const dir = path.join(SRC, 'chakra', 'components', name === 'FormLabel' || name === 'FormError' ? 'Form' : name);
    const files = fs.readdirSync(dir).filter(f => /\.ts$/.test(f) && !/stories/.test(f));
    for (const f of files) { const t = fs.readFileSync(path.join(dir, f), 'utf8'); const m = t.match(/colorSchemeMap[^{]*\{([\s\S]*?)\n\};/); if (m) colorSchemes = [...m[1].matchAll(/^\s{2}([a-zA-Z]+):\s*\{/gm)].map(x => x[1]); }
  }
  components[name] = { name, overridden: overridden.includes(name) || name === 'FormLabel' || name === 'FormError', variants: def.variants ? Object.keys(def.variants) : [], sizes: def.sizes ? Object.keys(def.sizes) : [], defaultProps: def.defaultProps || {}, colorSchemes };
}
/* composants custom du Hub (dossier src/components) */
const customDirs = fs.readdirSync(path.join(SRC, 'components')).filter(d => fs.statSync(path.join(SRC, 'components', d)).isDirectory());

/* stories */
const stories = results.map(s => {
  const m = s.file.match(/^chakra\/components\/([^/]+)\//); const h = s.file.match(/^components\/([^/]+)\//);
  const rules = [...new Set(s.classes.flatMap(c => DS.byClass[c] || []))];
  return { group: m ? 'chakra' : 'hub', component: m ? m[1] : h ? h[1] : s.file, file: s.file, title: s.title, name: s.name, html: s.html.replace(/<span id="__chakra_env" hidden=""><\/span>$/, ''), classes: s.classes, rules };
});
/* classes chakra-* portées par chaque classe css dans les stories (contexte de composant) */
const dsCtx = {}; for (const s of results) for (const m of s.html.matchAll(/class="([^"]+)"/g)) { const cls = m[1].split(/\s+/); const css = cls.filter(c => c.startsWith('css-')); const ch = cls.filter(c => c.startsWith('chakra-')); for (const c of css) { dsCtx[c] = dsCtx[c] || new Set(); ch.forEach(x => dsCtx[c].add(x)); } }
const prodCtx = {}; for (const smp of Object.values(D.samples)) for (const m of smp.html.matchAll(/class="([^"]+)"/g)) { const cls = m[1].split(/\s+/); const css = cls.filter(c => c.startsWith('css-')); const ch = cls.filter(c => c.startsWith('chakra-')); for (const c of css) { prodCtx[c] = prodCtx[c] || new Set(); ch.forEach(x => prodCtx[c].add(x)); } }

/* correspondance prod ↔ DS */
const base = (rules, cls) => rules.find(r => r.startsWith('.' + cls + ' {')) || rules.find(r => r.startsWith('.' + cls + '{'));
const decls = r => { if (!r) return null; const body = r.slice(r.indexOf('{') + 1, r.lastIndexOf('}')); const set = new Set(); for (const d of body.split(';')) { const i = d.indexOf(':'); if (i < 0) continue; const prop = d.slice(0, i).trim(); if (/^-(webkit|moz|ms)-/.test(prop)) continue; const val = d.slice(i + 1).trim().replace(/\s+/g, ' '); if (!val || /^-(webkit|moz|ms)-/.test(val)) continue; set.add(prop + ': ' + val); } return set; };
const dsDecl = {}; for (const [c, rules] of Object.entries(DS.byClass)) { const d = decls(base(rules, c)); if (d && d.size) dsDecl[c] = d; }
const storyOfClass = {}; for (const s of stories) for (const c of s.classes) (storyOfClass[c] = storyOfClass[c] || []).push({ group: s.group, component: s.component, name: s.name });
const prodClasses = [...new Set(Object.values(D.samples).flatMap(s => s.classes || []))].filter(c => D.rulesByClass[c]);
const match = {};
for (const c of prodClasses) {
  const pd = decls(base(D.rulesByClass[c], c)); if (!pd || !pd.size) continue;
  const pctx = prodCtx[c] || new Set(); let best = null;
  for (const [dc, dd] of Object.entries(dsDecl)) {
    let inter = 0; for (const x of pd) if (dd.has(x)) inter++; let sim = inter / (pd.size + dd.size - inter);
    const dctx = dsCtx[dc] || new Set(); const sameCtx = [...pctx].some(x => dctx.has(x)); if (pctx.size && !sameCtx) sim *= 0.85; // priorité au même composant Chakra
    if (!best || sim > best.sim) best = { cls: dc, sim, raw: inter / (pd.size + dd.size - inter), dd };
  }
  if (!best) continue;
  // stories triées : d’abord celles du composant qui correspond au contexte chakra-* de la classe prod (chakra-button → Button), puis thème avant Hub
  const ctxNames = [...pctx].map(x => x.replace(/^chakra-/, '').split('__')[0].replace(/-/g, '').toLowerCase());
  const stories = (storyOfClass[best.cls] || []).slice().sort((a, b) => { const sa = ctxNames.some(n => a.component.toLowerCase().includes(n)) ? 0 : 1, sb = ctxNames.some(n => b.component.toLowerCase().includes(n)) ? 0 : 1; return sa - sb || (a.group === 'chakra' ? 0 : 1) - (b.group === 'chakra' ? 0 : 1); });
  match[c] = { ds: best.cls, sim: +best.raw.toFixed(3), stories, prodOnly: [...pd].filter(x => !best.dd.has(x)), dsOnly: [...best.dd].filter(x => !pd.has(x)), ctx: [...pctx] };
}
const out = {
  meta: { name: 'design-system-hub', chakra: '2.5.5', generatedAt: new Date().toISOString().slice(0, 10), storiesRendered: stories.length, fonts: theme.fonts, prodFonts: { body: prod['--chakra-fonts-body'], heading: prod['--chakra-fonts-heading'] } },
  tokens: srcVars, tokenDiff,
  foundations: { colors: theme.colors, fontSizes: theme.fontSizes, radii: theme.radii, shadows: theme.shadows, breakpoints: theme.breakpoints, fonts: theme.fonts, gradients: { baia: 'linear(120deg, primary.600 0%, primary.500 40%, primary.400 58%, primary.500 100%)', scale: 'linear(135deg, {scale}.600 0%, {scale}.400 100%)', scaleHover: 'linear(135deg, {scale}.700 0%, {scale}.500 100%)' } },
  components, customComponents: customDirs, stories, match,
};
fs.writeFileSync('out/ds-source.json', JSON.stringify(out));
const ident = Object.values(match).filter(m => m.sim === 1).length, good = Object.values(match).filter(m => m.sim >= 0.8).length;
console.log('ds-source.json:', (fs.statSync('out/ds-source.json').size / 1024).toFixed(0), 'KB ; composants thème', Object.keys(components).length, '(surchargés', Object.values(components).filter(c => c.overridden).length, ') ; custom', customDirs.length, '; stories', stories.length, '; match', Object.keys(match).length, 'dont identiques', ident, '≥80 %', good);
console.log('tokens: changés', tokenDiff.changed.length, 'seulement prod', tokenDiff.onlyProd.length, 'seulement source', tokenDiff.onlySource.length);
