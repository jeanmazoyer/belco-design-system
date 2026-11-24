// Normalise le CSS Emotion rendu (SSR) via le CSSOM de Chromium, comme le relevé prod (collector.js lisait r.cssText).
// Sortie : out/ds-rules.json = { byClass: {css-xxx: [cssText…]}, byStory: {storyKey: [classes]} }
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const { results } = JSON.parse(fs.readFileSync('out/stories.json', 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent('<!doctype html><html><head></head><body></body></html>');
  const byClass = {}; const byStory = {}; let total = 0;
  for (const s of results) {
    const css = s.css.replace(/:host,:root,\[data-theme\]\{[^}]*\}/g, '');
    const rules = await p.evaluate(css => { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); const out = []; const walk = (rs, media) => { for (const r of rs) { if (r.type === 1) out.push(media ? '@media ' + media + ' { ' + r.cssText + ' }' : r.cssText); else if (r.type === 4) walk(r.cssRules, r.conditionText); else if (r.type === 7) out.push(r.cssText); else if (r.type === 12 && r.cssRules) walk(r.cssRules, media); } }; walk(st.sheet.cssRules); st.remove(); return out; }, css);
    const key = s.file.replace(/.*\//, '').replace('.stories.tsx', '') + '/' + s.name;
    byStory[key] = s.classes; total += rules.length;
    for (const r of rules) { const m = r.match(/\.css-[a-z0-9]+/g); if (!m) continue; for (const c of new Set(m)) { const k = c.slice(1); (byClass[k] = byClass[k] || []); if (!byClass[k].includes(r)) byClass[k].push(r); } }
  }
  await b.close();
  fs.writeFileSync('out/ds-rules.json', JSON.stringify({ byClass, byStory }));
  console.log('rules:', total, '; classes:', Object.keys(byClass).length, '; stories:', Object.keys(byStory).length);
})();
