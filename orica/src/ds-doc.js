// Documentation à partir du Design System Hub (source) : sections « Dans le Design System Hub » des composants,
// page Design System Hub, conformité prod ↔ DS. Les données viennent de ds-source.json (généré par ds-pipeline/, hors dépôt du DS).
const fs = require('fs'), path = require('path');

function loadDS(dir) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'ds-source.json'), 'utf8')); } catch (e) { return null; }
}

/* quel composant de la doc correspond à quels composants du DS (thème Chakra surchargé + composants Hub) */
const DS_MAP = {
  bouton: { chakra: ['Button'], hub: [] },
  tabs: { chakra: ['Tabs'], hub: ['TabWithCount'] },
  segmented: { chakra: [], hub: ['SegmentedControl'] },
  select: { chakra: ['Select'], hub: ['MultiSelect', 'OrigineSelect'] },
  menu: { chakra: ['Menu'], hub: ['LocalePicker', 'ActionsGroup'] },
  'champ-de-recherche': { chakra: [], hub: ['SearchInput'] },
  'champ-de-saisie': { chakra: ['Input', 'Textarea', 'Form', 'FormLabel', 'FormError'], hub: ['DateInput', 'TimeInput', 'NumberInput', 'PhoneInput'] },
  'case-a-cocher': { chakra: ['Checkbox', 'Radio'], hub: ['CardGroup'] },
  badge: { chakra: ['Badge', 'Tag'], hub: ['TagDisplayer', 'EvolutionTag', 'FieldLinkTag'] },
  avatar: { chakra: ['Avatar'], hub: ['AvatarUser'] },
  heading: { chakra: ['Heading', 'Divider', 'Container'], hub: ['EllipsisText'] },
  tableau: { chakra: ['Table'], hub: ['DataTable'] },
  'ligne-de-reference': { chakra: [], hub: ['Module'] },
  pagination: { chakra: [], hub: [] },
  'carte-kpi': { chakra: [], hub: [] },
  accordeon: { chakra: ['Accordion'], hub: [] },
  drawer: { chakra: ['Drawer'], hub: [] },
  'barre-de-filtres': { chakra: [], hub: ['Filters'] },
  coquille: { chakra: [], hub: ['Sidebar', 'AppsNav', 'StickyAdaptatif'] },
  'etat-vide': { chakra: [], hub: [] },
  lien: { chakra: ['Link'], hub: [] },
  toast: { chakra: [], hub: [] },
  modal: { chakra: ['Modal'], hub: [] },
  tooltip: { chakra: ['Tooltip'], hub: ['TooltipBtn'] },
  switch: { chakra: ['Switch'], hub: [] },
  skeleton: { chakra: ['Skeleton'], hub: ['ComponentSkeleton', 'SkeletonSimpleText', 'SkeletonTag'] },
  'date-picker': { chakra: [], hub: ['PeriodePicker'] },
  kanban: { chakra: [], hub: ['Kanban'] },
  stepper: { chakra: [], hub: [] },
  breadcrumbs: { chakra: ['Breadcrumb'], hub: [] },
  upload: { chakra: [], hub: ['Dropzone'] },
  'number-input': { chakra: ['NumberInput'], hub: ['NumberInput'] },
  popover: { chakra: ['Popover'], hub: [] },
  alert: { chakra: ['Alert'], hub: [] },
  progress: { chakra: ['Progress'], hub: ['SoftRingProgress', 'CustomCircularProgress'] },
  slider: { chakra: ['Slider'], hub: [] },
  'hub-icon': { chakra: [], hub: ['HubIcon'] },
  'scroll-box': { chakra: [], hub: ['ScrollBox'] },
  'tango-tuto': { chakra: [], hub: ['TangoTuto'] },
  notes: { chakra: [], hub: ['notes'] },
};
/* pages créées uniquement grâce au DS (absentes du relevé prod) */
const DS_ONLY_PAGES = [
  ['alert', 'Alert', 'Messages d’état (subtle, left-accent, top-accent, solid) et variante « ai » du DS Hub.'],
  ['progress', 'Progress', 'Barres et anneaux de progression du DS Hub.'],
  ['slider', 'Slider', 'Curseurs simple et à plage.'],
  ['hub-icon', 'HubIcon', 'Le composant d’icône du Hub : icônes custom du DS en priorité, puis Font Awesome 6, Ionicons 5 et Material.'],
  ['scroll-box', 'ScrollBox', 'Zone défilante avec la barre de défilement du DS.'],
  ['tango-tuto', 'TangoTuto', 'Bouton d’accès à un tutoriel Tango.'],
  ['notes', 'Notes', 'Tags de type de note et bloc de note du Hub.'],
];
const FR = { variants: 'variantes', sizes: 'tailles', colorSchemes: 'schémas de couleur' };

function makeDsDoc({ DS, esc, pretty, cssPretty, section, chev, nextDemoId }) {
  if (!DS) return null;
  const storiesOf = (group, comp) => DS.stories.filter(s => s.group === group && s.component === comp);
  const sources = id => DS_MAP[id] || { chakra: [], hub: [] };
  const hasDs = id => { const m = sources(id); return m.chakra.some(c => DS.components[c]) || m.hub.some(h => storiesOf('hub', h).length); };
  const chip = (t, cls = '') => `<span class="ds-chip ${cls}">${esc(t)}</span>`;
  const isUpper = s => /^[A-Z]/.test(s);

  /* carte de définition d’un composant du thème */
  function themeCard(name) {
    const c = DS.components[name]; if (!c) return '';
    const rows = [];
    if (c.variants.length) rows.push(`<div class="ds-row"><span class="label">Variantes</span><div>${c.variants.map(v => chip(v, v === c.defaultProps.variant ? 'is-default' : '')).join('')}</div></div>`);
    if (c.sizes.length) rows.push(`<div class="ds-row"><span class="label">Tailles</span><div>${c.sizes.map(v => chip(v, v === c.defaultProps.size ? 'is-default' : '')).join('')}</div></div>`);
    if (c.colorSchemes.length) rows.push(`<div class="ds-row"><span class="label">Schémas de couleur dédiés</span><div>${c.colorSchemes.map(v => chip(v)).join('')}<span class="muted">+ toute échelle du thème (primary, brand, cafe, cacao…) en dégradé</span></div></div>`);
    const dp = Object.entries(c.defaultProps || {}); if (dp.length) rows.push(`<div class="ds-row"><span class="label">Par défaut</span><div><code class="inline">${esc(dp.map(([k, v]) => `${k}="${v}"`).join(' '))}</code></div></div>`);
    return `<div class="ds-card"><div class="ds-card-head"><b>&lt;${esc(name)}&gt;</b><span class="ds-tag ${c.overridden ? 'is-ds' : ''}">${c.overridden ? 'surchargé par le DS Hub' : 'thème Chakra par défaut'}</span></div>${rows.join('')}</div>`;
  }
  /* démo d’une ou plusieurs stories (HTML + CSS générés depuis la source) */
  function dsDemo(stories, opts = {}) {
    if (!stories.length) return '';
    const id = 'ds' + nextDemoId();
    const cap = n => `<span style="font:600 10px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#777a7f;min-width:96px;flex-shrink:0">${esc(n.replace(/([a-z])([A-Z])/g, '$1 $2'))}</span>`;
    const html = stories.length > 1 ? stories.map(s => `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;width:100%;padding:4px 0;border-bottom:1px dashed #e5e9ef">${cap(s.name)}${s.html}</div>`).join('') : stories[0].html;
    const shown = stories.map(s => `<!-- ${s.component} › ${s.name} (${s.file}) -->\n${pretty(s.html)}`).join('\n\n');
    const rules = [...new Set(stories.flatMap(s => s.rules))];
    const css = rules.map(cssPretty).join('\n\n');
    const names = stories.map(s => s.name).join(', ');
    return `<div class="demo is-ds" data-demo="${id}">
    <div class="demo-preview${opts.grey ? ' is-grey' : ''}${opts.block ? ' is-block' : ''}" data-shadow-host style="${esc(opts.wrap || '')}"></div>
    <template data-shadow>${html}</template>
    <div class="demo-foot">
      <button class="demo-toggle" type="button" data-panel="code">${chev}<span>Afficher le code</span><span class="demo-file">${esc(stories[0].component)} › ${esc(names)}</span></button>
      <div class="demo-panel demo-code" hidden>
        <div class="demo-tabs"><button type="button" data-lang="html" class="is-on">HTML rendu par le DS</button><button type="button" data-lang="css">CSS Emotion généré</button><span class="demo-file">${esc(stories[0].file)}</span></div>
        <div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre data-html><code>${esc(shown)}</code></pre><pre data-css hidden><code>${esc(css)}</code></pre></div>
      </div>
    </div>
  </div>`;
  }
  /* bloc complet « Dans le Design System Hub » pour un composant de la doc */
  function dsSection(id, opts = {}) {
    const m = sources(id); const parts = [];
    for (const c of m.chakra) { if (!DS.components[c]) continue; const st = storiesOf('chakra', c); parts.push(`<div class="ds-block">${themeCard(c)}${st.length ? dsDemo(st, { block: opts.block, grey: opts.grey, wrap: opts.wrap }) : '<p class="muted">Pas de story pour ce composant dans le DS.</p>'}</div>`); }
    for (const h of m.hub) { const st = storiesOf('hub', h); if (!st.length) continue; parts.push(`<div class="ds-block"><div class="ds-card"><div class="ds-card-head"><b>&lt;${esc(h)}&gt;</b><span class="ds-tag is-hub">composant Hub (src/components/${esc(h)})</span></div></div>${dsDemo(st, { block: opts.block, grey: opts.grey, wrap: opts.wrap })}</div>`); }
    if (!parts.length) return section('Dans le Design System Hub', `<div class="ds-none"><span class="ds-tag">hors DS</span><p>Ce composant n’existe pas dans le Design System Hub : il est composé dans l’application Orica avec des primitives Chakra (Box, Stack, Flex). Candidat à une entrée dans le DS.</p></div>`);
    return section('Dans le Design System Hub', `${tokensToggle()}${parts.join('')}`, 'Rendu depuis le code source du DS (thème Chakra 2.5.5 + stories Storybook), avec les tokens tels que servis par Orica. Ce que le DS génère, pas ce que la prod sert : la section suivante compare les deux.');
  }
  const tokensToggle = () => `<div class="ds-toggle"><button type="button" class="aud-btn" data-ds-tokens>Voir avec les tokens du DS Hub</button><span class="muted">Orica surcharge l’échelle primary (orica) et la police (CentraNo2) ; le DS Hub source utilise brand et Open Sans / Oswald.</span></div>`;

  /* conformité : classes racines prod ↔ DS */
  function conformity(id, roots) {
    const rows = roots.flatMap(r => (r.match(/css-[a-z0-9]+/g) || []).map(c => ({ root: r, cls: c }))).filter((x, i, a) => a.findIndex(y => y.cls === x.cls) === i);
    if (!rows.length) return '';
    const items = rows.map(({ root, cls }) => {
      const m = DS.match[cls];
      if (!m) return `<tr><td><code>${esc(root)}</code></td><td colspan="3"><span class="muted">pas de règle de base comparable</span></td></tr>`;
      const pct = Math.round(m.sim * 100); const st = m.stories[0];
      const grade = pct >= 95 ? 'is-good' : pct >= 80 ? 'is-mid' : 'is-low';
      const diffs = [...m.prodOnly.map(d => `<i class="add" title="présent en prod, absent du DS">+ ${esc(d)}</i>`), ...m.dsOnly.map(d => `<i class="del" title="généré par le DS, absent en prod">− ${esc(d)}</i>`)].slice(0, 6).join('');
      return `<tr><td><code>${esc(root)}</code></td><td><span class="aud-mbar ${grade}" style="width:70px;display:inline-block;vertical-align:middle"><i style="width:${pct}%"></i></span> <b>${pct} %</b></td><td>${st ? `${esc(st.component)} › ${esc(st.name)}${m.stories.length > 1 ? ` <span class="muted">+${m.stories.length - 1}</span>` : ''}` : '—'}</td><td class="ds-diffs">${pct === 100 ? '<span class="muted">identique</span>' : diffs || '<span class="muted">mêmes déclarations, ordre différent</span>'}</td></tr>`;
    }).join('');
    const avg = Math.round(100 * rows.reduce((s, { cls }) => s + (DS.match[cls] ? DS.match[cls].sim : 0), 0) / rows.length);
    return section('Conformité au Design System Hub', `<div class="ds-conf"><div class="ds-conf-score ${avg >= 95 ? 'is-good' : avg >= 80 ? 'is-mid' : 'is-low'}"><b>${avg} %</b><span>des déclarations CSS servies par Orica pour ce composant sont celles que génère le DS Hub (moyenne des classes racines).</span></div><div class="tablewrap"><table class="ds-table"><thead><tr><th>Classe servie (prod)</th><th>Conformité</th><th>Généré par</th><th>Écarts</th></tr></thead><tbody>${items}</tbody></table></div></div>`, 'Pour chaque classe Emotion servie, la règle de base est comparée déclaration par déclaration à la règle la plus proche générée depuis le DS. + : présent en prod seulement (props passées par l’app) ; − : généré par le DS mais absent en prod.');
  }

  /* page Design System Hub */
  function dsHubPage(prodTokens, COMPLIST) {
    const chg = DS.tokenDiff.changed; const onlyProd = DS.tokenDiff.onlyProd;
    const grp = {}; onlyProd.forEach(k => { const m = k.match(/^--chakra-colors-([a-zA-Z]+)/); const g = m ? 'colors/' + m[1] : k; (grp[g] = grp[g] || []).push(k); });
    const comps = Object.values(DS.components);
    const overridden = comps.filter(c => c.overridden);
    const hubWithStories = [...new Set(DS.stories.filter(s => s.group === 'hub').map(s => s.component))];
    const statusOf = name => { const ids = Object.entries(DS_MAP).filter(([, m]) => m.chakra.includes(name) || m.hub.includes(name)).map(([id]) => id); const page = ids.map(id => COMPLIST.find(c => c.id === id)).find(Boolean); return page ? `<a href="#${page.id}">${esc(page.title)}</a>${page.prodOnly === false ? '' : ''}` : '<span class="muted">—</span>'; };
    const relevé = name => { const n = Object.values(DS.match).filter(m => m.sim >= 0.95 && m.stories.some(s => s.component === name)).length; return n; };
    return `${section('Vue d’ensemble', `<div class="ds-stats"><div><b>${overridden.length}</b><span>composants Chakra surchargés par le thème</span></div><div><b>${DS.customComponents.length}</b><span>composants Hub (src/components)</span></div><div><b>${DS.meta.storiesRendered}</b><span>stories rendues depuis la source</span></div><div><b>${Object.keys(DS.tokens).length}</b><span>tokens générés par le thème</span></div><div><b>${Object.values(DS.match).filter(m => m.sim === 1).length}</b><span>classes servies identiques à celles du DS</span></div></div>`, `Paquet design-system-hub (Chakra UI ${esc(DS.meta.chakra)}), reçu le ${esc(DS.meta.generatedAt)}. Le thème est chargé tel quel, chaque story Storybook est rendue en React, le CSS Emotion produit est comparé à celui que sert Orica.`)}
    ${section('Tokens : ce qu’Orica change par rapport au DS', `<div class="tablewrap"><table class="ds-table"><thead><tr><th>Token</th><th>DS Hub (source)</th><th>Orica (servi)</th></tr></thead><tbody>${chg.map(c => `<tr><td><code>${esc(c.k)}</code></td><td>${/colors/.test(c.k) ? `<i class="ds-sw" style="background:${esc(c.source)}"></i>` : ''}${esc(c.source)}</td><td>${/colors/.test(c.k) ? `<i class="ds-sw" style="background:${esc(c.prod)}"></i>` : ''}${esc(c.prod)}</td></tr>`).join('')}</tbody></table></div>
    <p class="note" style="margin-top:12px">${Object.keys(DS.tokens).length - chg.length} tokens sont identiques. Orica ajoute ${onlyProd.length} tokens qui n’existent pas dans le DS : ${Object.entries(grp).sort((a, b) => b[1].length - a[1].length).map(([g, ks]) => `${esc(g)} (${ks.length})`).join(', ')}.</p>`, 'L’application remplace l’échelle primary par son échelle orica et la police par CentraNo2 ; tout le reste du thème vient du DS Hub.')}
    ${section('Composants du thème Chakra', `<div class="tablewrap"><table class="ds-table"><thead><tr><th>Composant</th><th>Variantes</th><th>Tailles</th><th>Par défaut</th><th>Relevé Orica</th><th>Page</th></tr></thead><tbody>${comps.sort((a, b) => (b.overridden - a.overridden) || a.name.localeCompare(b.name)).map(c => `<tr class="${c.overridden ? '' : 'is-muted'}"><td><b>&lt;${esc(c.name)}&gt;</b>${c.overridden ? '' : ' <span class="muted">défaut Chakra</span>'}</td><td>${c.variants.map(v => chip(v, v === c.defaultProps.variant ? 'is-default' : '')).join('') || '—'}</td><td>${c.sizes.join(', ') || '—'}</td><td><code class="inline">${esc(Object.entries(c.defaultProps).map(([k, v]) => `${k}=${v}`).join(' ')) || '—'}</code></td><td>${relevé(c.name) ? `<b>${relevé(c.name)}</b> classes identiques` : '<span class="muted">non rencontré</span>'}</td><td>${statusOf(c.name)}</td></tr>`).join('')}</tbody></table></div>`, 'En gras, les variantes par défaut. « Relevé Orica » : nombre de classes servies par Orica qui correspondent à 95 % ou plus à une story de ce composant.')}
    ${section('Composants Hub', `<div class="ds-hublist">${DS.customComponents.sort().map(h => { const n = storiesOf('hub', h).length; const r = relevé(h); return `<div class="ds-hub ${n ? '' : 'is-muted'}"><b>${esc(h)}</b><span>${n ? `${n} stor${n > 1 ? 'ies' : 'y'}` : 'sans story'}${r ? ` · <em>${r} classes relevées</em>` : ''}</span>${statusOf(h)}</div>`; }).join('')}</div>`, `${hubWithStories.length} composants Hub ont une story et sont rendus dans la doc ; les autres n’ont pas de story (ou dépendent de l’API Belco) et ne sont pas rendus.`)}`;
  }

  const allRules = [...new Set(DS.stories.flatMap(s => s.rules))];
  const tokensOverrideCss = ':host{' + DS.tokenDiff.changed.map(c => `${c.k}:${c.source};`).join('') + '}';
  const componentsSummary = Object.fromEntries(Object.values(DS.components).filter(c => c.overridden).map(c => [c.name, { variants: c.variants, sizes: c.sizes, defaultProps: c.defaultProps, colorSchemes: c.colorSchemes, stories: storiesOf('chakra', c.name).map(s => s.name) }]));
  const hubSummary = Object.fromEntries([...new Set(DS.stories.filter(s => s.group === 'hub').map(s => s.component))].map(h => [h, storiesOf('hub', h).map(s => s.name)]));
  return { DS_MAP, DS_ONLY_PAGES, hasDs, dsSection, conformity, dsHubPage, themeCard, dsDemo, storiesOf, allRules, tokensOverrideCss, componentsSummary, hubSummary };
}
module.exports = { loadDS, makeDsDoc, DS_MAP, DS_ONLY_PAGES };
