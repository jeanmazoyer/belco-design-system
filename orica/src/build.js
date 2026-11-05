// Build the ISO Orica documentation from orica-iso.json (real tokens, real Emotion rules, real HTML, real icons).
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
// Dossier de sortie = dossier du design system dans le dépôt (orica/). Ses fichiers tokens.css, rules/*.md et changelog.json
// sont la SOURCE quand ils existent : une pull request sur ces fichiers change la documentation à la régénération.
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(DIR, 'bundle');
process.env.ORICA_OUT = OUT;
const D = JSON.parse(fs.readFileSync(path.join(DIR, 'orica-iso.json'), 'utf8'));
const SRC = { tokens: false, rules: [], changelog: false };
try {
  const css = fs.readFileSync(path.join(OUT, 'tokens.css'), 'utf8');
  const parsed = {}; for (const m of css.matchAll(/^\s*(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/gm)) parsed[m[1]] = m[2].trim();
  if (Object.keys(parsed).length > 100) { D.tokens = parsed; SRC.tokens = true; }
} catch (e) { }

/* ------------------------------------------------------------------ neutralisation des données */
const UI_KEEP = new Set(['Langue','Se déconnecter','Références','Offres & Farm samples','Café','Cacao','Nouvelle référence','Filtres','Réinitialiser','Appliquer','Supprimer','Oui','Non','Achat','Fabrication','Type de café','Type de sourcing','Direct Trade','Cross Trade','Sourcing Exclusive','Alpha','Produits visibles sur Belco.fr','Produits en sommeil','Uniquement les produits en sommeil','Sourcing steps complétés','Impact score complété','Parcelles et risques complétés','Due diligence','À soumettre','Soumise','Validée','Rejetée','UB','Sans UB','Inclure en sommeil','Inclure terminés / annulés','Inclure inactifs','Parcours prospect','Gérer les tags fournisseur','Nouveau fournisseur','Nouveau prospect','Fournisseurs et prospects','Fournisseurs','Prospects','Tout fermer','Tout ouvrir','Nouvelle offre','Importer Excel','Ajouter une adresse','Ajouter un contact','Ajouter un rôle','Enregistrer','Raison sociale','Univers','Flo ID','Partenaire depuis','Adresse principale','Contact','Roles','Types juridiques','Commentaire','Privé','Public','Association','Coopérative','Institution','ONG','Par origines','Par UB','Kanban','Plan détaillé','Echantillons','Objectifs','Contrats actifs','Brouillons','Contrats regroupés','Contrats archivés','Origine','Fournisseur','Période','Crop','POL','POD','Statut','Type','Incoterm','Créé le','BTB','Désignation','Embarquement','POL / POD','Pays','Nom','Contact','Offres','Contrats','Actions','Qté. achat','Qté. restante','Position comm.','Pipeline','Objectif','Contrats via offres','En cours','Comparaison offres sur 3 crops','Volume offres','Volume converti','Nb offres','À contractualiser','Conversion','Taux de rejet','Reliquat','Analyse qualité','Score moyen','Part FCCO','Prix fixe moy.','Prime diff. moy.','Funnel offres','Prix','Qualité','FCCO','Hors FCCO',"Taux d'analyse",'Analysées','Non analysées','Offres FCCO','Part du volume','Contractualisées','Prime diff.','cts$/lb fixe','Précédent','Suivant','Power BI','Impact','Aucune région trouvée','Filiale','Origines','Statuts','Exportateur','Producteur','Inactif','Actif','Finalisé','Label','Terroir','Microlot','Label process','Terroir lavé','Terroir process','Estate','Dry Mill','Wet Mill','Trader','Intermédiaire','Entrepôt','Station de sèchage','Rechercher un café','Rechercher','Traçabilité','Traçabilités','Disponibilité','Filiale','Statuts','Quantité','Certifications','Tags','Types juridiques','Filiales de sourcing','Certifications fournisseur','Année','Mois','Semaine','Français','English','Español','Label lavé','Estate lavé','Estate process','Espresso Blend','Cascara','DT','Harrar','DK BIO','DK Premium','DK Sugar','DK Water','CAM','CUB','DOM','JAM','D','FAS','-','—','|','*','1 / 36','1 / 1']);
const COUNTRIES = /^(Afrique|Amérique|Allemagne|Australie|Birmanie|BLENDS|Bolivie|Brésil|Burundi|Cameroun|Canada|Chine|Colombie|Congo|Costa Rica|Cuba|République Dominicaine|El Salvador|Equateur|Éthiopie|Ethiopie|Guatemala|Honduras|Inde|Indonésie|Jamaïque|Kenya|Laos|Mexique|Nicaragua|Ouganda|Panama|Papouasie|Pérou|Rwanda|Salvador|Tanzanie|Thaïlande|Vietnam|Yémen|Zambie)/;
function neutralText(t, ctx) {
  const raw = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
  if (!raw) return t;
  if (UI_KEEP.has(raw)) return t;
  if (/^CECI EST UN ENVIRONNEMENT/i.test(raw)) return t;
  if (/^\d+\s*\/\s*\d+$/.test(raw)) return t;                       // pagination "1 / 36"
  if (/^(🇫🇷|🇬🇧|🇪🇸)/.test(raw)) return t;                       // langues
  if (/^[A-Za-zÀ-ÿ' .-]+\s*\(\d+\)$/.test(raw)) return t.replace(/\d+/, '0'); // "Bolivie (5)"
  if (COUNTRIES.test(raw) && raw.length < 30) return t;              // référentiel pays / régions
  if (/^\d{4}(\/\d{4})?$/.test(raw)) return t;                        // années, crops
  if (/^[+-]?[\d\s .,]+\s*(%|T\.|t|Kg|kg|\$|cts\$?\/lb|offres|produits)?/.test(raw) && !/[A-Za-z]{4,}/.test(raw.replace(/offres|produits|cts/g,''))) return t.replace(/\d/g, '0'); // nombres → zéros
  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(raw)) return t.replace(/\d/g, '0');
  if (/^(Jan|Fév|Mar|Avr|Mai|Juin|Juil|Août|Sep|Oct|Nov|Déc)\.? \d{2}$/.test(raw)) return t.replace(/\d/g, '0');
  if (/^\d{15}$/.test(raw)) return '000000000000000';
  if (/^[A-Z]{3}\d{2}[A-Z]{3}\d{3}$/.test(raw)) return 'XXX00XXX000';
  if (/^[A-Z]{2}$/.test(raw) && ctx.avatar) return 'AB';
  if (/^\d+ offres$/.test(raw)) return t.replace(/\d+/, '0');
  if (/^\d+ produits · /.test(raw)) return '0 produits · 0,00 t';
  if (raw === 'Jean Mazoyer') return 'Prénom Nom';
  if (raw === 'JM') return 'AB';
  if (raw === 'TEST') return 'Client';
  // texte libre (noms de fournisseurs, références, contacts, villes de port…) → libellé neutre
  if (/^[A-Z0-9 &.'-]{6,}$/.test(raw)) return 'NOM EXEMPLE';
  if (ctx.row) return 'Exemple';
  return t;
}
function neutralize(html, ctx = {}) {
  // text nodes
  let out = html.replace(/>([^<>]+)</g, (m, t) => '>' + neutralText(t, ctx) + '<');
  // aria-labels and option values that carry data
  out = out.replace(/aria-label="([^"]*)"/g, (m, v) => 'aria-label="' + neutralText(v, ctx).replace(/"/g, '&quot;') + '"');
  out = out.replace(/Jean Mazoyer/g, 'Prénom Nom').replace(/>JM</g, '>AB<');
  out = out.replace(/name="radio-:[^"]*"/g, 'name="radio-group"');
  out = out.replace(/\s(id|aria-controls|aria-labelledby|aria-describedby|data-projection-id)="[^"]*"/g, '');
  out = out.replace(/vs N-0/g, 'vs N-1');
  // external links carrying identifiers (Power BI workspace / report ids): keep the host, neutralize the ids
  out = out.replace(/href="(https?:\/\/[^"]*)"/g, (m, u) => 'href="' + u.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '00000000-0000-0000-0000-000000000000').replace(/\/[0-9a-f]{20}\b/gi, '/00000000000000000000') + '"');
  // hrefs to app routes that embed a record id
  out = out.replace(/href="(\/[^"]*?)(\d{2,})([^"]*)"/g, (m, a, n, b) => 'href="' + a + '0'.repeat(n.length) + b + '"');
  return out;
}
const ROWISH = new Set(['tr','refrow','stack','accordion','kpi','kpigrid','table','tablewrap','filterbar','menu','drawer','drawercontainer','rail']);
for (const [k, s] of Object.entries(D.samples)) {
  s.html = neutralize(s.html, { row: ROWISH.has(s.name), avatar: s.name === 'avatar' || /avatar/.test(s.html) });
}
// Drop the bare "popover" samples (empty arrow containers) and internal duplicates we don't document
for (const k of Object.keys(D.samples)) { if (/^popover\|/.test(k) || k === 'drawercontainer|manual' || /^stack\|chakra-stack css-n21gh5/.test(k) || /^filterbar\|/.test(k)) delete D.samples[k]; }
// split the list panels (références, contrats) into filter bar / rows / pagination
function splitChildren(html) {
  const toks = html.split(/(<[^>]+>|<!--[\s\S]*?-->)/).filter(Boolean);
  const voidT = /^<(input|img|br|hr|path|circle|rect|line|polyline|polygon|ellipse|use|source|col)\b/;
  let depth = 0, cur = '', out = [], started = false;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (!started) { started = true; continue; } // skip root open tag
    const isOpen = /^<[a-zA-Z]/.test(t) && !voidT.test(t) && !/\/>$/.test(t);
    const isClose = /^<\//.test(t);
    if (depth === 0 && isClose) break; // root close
    cur += t;
    if (isOpen) depth++;
    else if (isClose) depth--;
    if (depth === 0 && (isOpen || isClose || voidT.test(t) || /^<!--/.test(t))) { if (cur.trim()) out.push(cur); cur = ''; }
  }
  return out;
}
function mk(name, base, html, extra) { return { name, sig: base.sig, screen: base.screen, text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50), html, classes: [...new Set((html.match(/css-[a-z0-9]+/g) || []))], ...extra }; }
{
  const refs = D.samples['refrow|manual']; const parts = splitChildren(refs.html);
  const bar = parts.find(p => /chakra-input__group/.test(p)); const listPart = parts.find(p => /^<div class="chakra-stack css-n21gh5"><div class="css-2g5t7v"/.test(p)); const rows = listPart ? splitChildren(listPart).filter(p => /^<div class="css-2g5t7v"/.test(p)) : []; const pager = parts.find(p => /^<nav/.test(p));
  if (bar) D.samples['filterbar|references'] = mk('filterbar', refs, bar);
  if (rows.length) D.samples['refrow|manual'] = mk('refrow', refs, rows.slice(0, 3).join('\n'));
  if (pager) D.samples['pagination|references'] = mk('pagination', refs, pager);
  const contr = Object.entries(D.samples).find(([k]) => /^stack\|chakra-stack css-egoftb/.test(k));
  if (contr) { const cp = splitChildren(contr[1].html); const cbar = cp.find(p => /chakra-input__group/.test(p)); if (cbar) D.samples['filterbar|contrats'] = mk('filterbar', contr[1], cbar); const ctable = cp.find(p => /chakra-table/.test(p)); if (ctable) D.samples['tablewrap|contrats'] = mk('tablewrap', contr[1], ctable); delete D.samples[contr[0]]; }
}

/* ------------------------------------------------------------------ helpers */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sampleRules = s => [...new Set(s.classes.flatMap(c => D.rulesByClass[c] || []))];
const rulesText = s => sampleRules(s).join('\n');
const tokensUsed = s => [...new Set((rulesText(s).match(/--chakra-[a-zA-Z0-9-]+/g) || []))].filter(t => D.tokens[t] !== undefined);
const FLAG_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#d8dee7"/><rect width="4" height="1" fill="#c5cad2"/><rect y="2" width="4" height="1" fill="#c5cad2"/></svg>');
const IMG_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" rx="0.12" fill="#d8dee7"/></svg>');
function renderable(s) {
  // external images (flags on jsDelivr, certification seals on the Filerobot CDN) cannot load inside the doc: neutral placeholders in the preview only
  let h = inlineIcons(s.html).replace(/src="https:\/\/cdn\.jsdelivr\.net\/gh\/lipis\/flag-icons\/[^"]+"/g, `src="${FLAG_URI}"`).replace(/src="https?:\/\/[^"]+"/g, `src="${IMG_URI}"`);
  if (s.name === 'tr') h = `<div class="chakra-table__container css-1nmizk2"><table class="chakra-table css-h1zm47"><tbody>${h}</tbody></table></div>`;
  return h;
}
function inlineIcons(html) {
  return html.replace(/<svg data-icon="([^"]+)" class="([^"]*)"><\/svg>/g, (m, id, cls) => {
    const ic = D.icons[id]; if (!ic) return m;
    const vb = ic.viewBox ? ` viewBox="${ic.viewBox}"` : '';
    const st = ic.style ? ` style="${ic.style}"` : '';
    return `<svg${vb} class="${cls || ic.cls}" focusable="false" aria-hidden="true"${st}>${ic.inner}</svg>`;
  });
}
// pretty-print HTML lightly (one tag per line, indent)
function pretty(html) {
  const tokens = html.replace(/>\s+</g, '><').split(/(<[^>]+>)/).filter(Boolean);
  let depth = 0, out = [];
  const voidTags = /^<(input|img|br|hr|meta|link|path|circle|rect|line|polyline|polygon|ellipse|use)\b/;
  for (const t of tokens) {
    if (/^<\//.test(t)) { depth = Math.max(0, depth - 1); out.push('  '.repeat(depth) + t); }
    else if (/^<!--/.test(t)) out.push('  '.repeat(depth) + t);
    else if (/^</.test(t)) { out.push('  '.repeat(depth) + t); if (!voidTags.test(t) && !/\/>$/.test(t)) depth++; }
    else if (t.trim()) out.push('  '.repeat(depth) + t.trim());
  }
  return out.join('\n');
}
const cssPretty = r => r.replace(/\s*\{\s*/, ' {\n  ').replace(/;\s*(?=[a-z-]+:)/g, ';\n  ').replace(/;?\s*\}$/, ';\n}').replace(/\{\n\s+\}/, '{ }');

/* ------------------------------------------------------------------ CSS global de la prod (tokens, reset, fonts) */
const tokensCss = ':root, :host {\n' + Object.entries(D.tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n') + '\n}\n';
const fontFaceCss = D.fontFaces.filter(f => /CentraNo2/.test(f)).map(f => f.replace(/url\("?\/orica\/fonts\/([^")]+)"?\)/g, (m, file) => {
  const local = /book/.test(file) ? 'local("Centra No2 Book"), local("CentraNo2-Book"), local("Centra No2")' : /medium/.test(file) ? 'local("Centra No2 Medium"), local("CentraNo2-Medium")' : /extrabold/.test(file) ? 'local("Centra No2 Extrabold"), local("CentraNo2-Extrabold")' : 'local("Centra No2 Bold"), local("CentraNo2-Bold")';
  return `${local}, url("fonts/${file}")`;
})).join('\n');
// reset Chakra (sans html/body qui sont retargetés sur :host dans le shadow DOM)
const baseRules = D.base.filter(r => !/^(html|body|html, body)\b/.test(r) && !/\[data-js-focus-visible\]/.test(r));
const baseCss = baseRules.join('\n') + '\n' + D.keyframes.join('\n');
const allComponentCss = Object.entries(D.rulesByClass).map(([c, rs]) => rs.join('\n')).join('\n');
const sharedCss = tokensCss + '\n' + baseCss;

/* ------------------------------------------------------------------ catalogue des composants (clé = sample keys) */
const S = D.samples;
const byName = n => Object.entries(S).filter(([k, v]) => v.name === n);
const find = (name, pred) => Object.entries(S).find(([k, v]) => v.name === name && (!pred || pred(v, k)));
const sample = (key) => S[key];

const pick = {
  btnPrimary: find('button', v => /css-umgg81$/.test(v.sig) && !/menu-button/.test(v.sig)),
  btnPrimaryMenu: find('button', v => /menu-button css-umgg8/.test(v.sig)),
  btnFiltres: find('button', v => v.text === 'Filtres'),
  btnReset: find('button', v => v.text === 'Réinitialiser'),
  btnSupprimer: find('button', v => v.text === 'Supprimer'),
  btnAppliquer: find('button', v => v.text === 'Appliquer'),
  btnGhost: find('button', v => v.text === 'Parcours prospect'),
  btnGhost2: find('button', v => v.text === 'Gérer les tags fournisseur'),
  btnTab: find('button', v => /Fournisseurs et prospects/.test(v.text)),
  btnImport: find('button', v => v.text === 'Importer Excel'),
  btnUnivers: find('button', v => v.text === 'Café'),
  btnSoft: find('button', v => v.text === 'Ajouter une adresse'),
  btnSave: find('button', v => v.text === 'Enregistrer'),
  btnOffre: find('button', v => v.text === 'Nouvelle offre'),
  btnToggleAll: find('button', v => /Tout fermer/.test(v.text)),
  btnAvatar: find('button', v => v.text === 'AB' || /css-1695t4a/.test(v.sig)),
  btnIconPager: find('button', v => /css-39ivzn/.test(v.sig)),
  btnIconCopy: find('button', v => /css-684j93/.test(v.sig)),
  btnIconScroll: find('button', v => /css-dj65kc/.test(v.sig)),
  btnRail: find('button', v => /css-1vt6cti/.test(v.sig)),
  btnBack: find('button', v => /css-od61ih/.test(v.sig)),
  btnRowIcons: byName('button').filter(([k, v]) => /css-(1d97s1n|que1ht|xedyxu|imuao1|z89we1|mjkbmp|9j6jqp|1v5ah32|x7zswu)/.test(v.sig)),
  tabsRefs: find('tabs', v => /css-1q9h0zz/.test(v.sig)),
  tabsContrats: sample('tabs|contrats'),
  tabsPlans: sample('tabs|plans'),
  selectBasic: find('select', v => /css-ts3co9/.test(v.sig)),
  selectOrigine: find('select', v => /css-y2aryr/.test(v.sig)),
  selectFiliale: find('select', v => /css-1vh7n41/.test(v.sig)),
  selectAnnee: find('select', v => /css-42b2qy/.test(v.sig)),
  search: find('inputgroup', v => /css-1dg1wqw/.test(v.sig)),
  search2: find('inputgroup', v => /css-15qbqmr/.test(v.sig)),
  inputForm: find('input', v => /css-1v4ryj4/.test(v.sig)),
  inputDrawer: find('input', v => /css-1pmwcp4/.test(v.sig)),
  textarea: find('textarea'),
  checkbox: find('checkbox', v => /css-fthuel/.test(v.sig)),
  checkbox2: find('checkbox', v => /css-150ix87/.test(v.sig)),
  checkbox3: find('checkbox', v => /css-14rebin/.test(v.sig)),
  radio: find('radio'),
  formcontrol: find('formcontrol'),
  formlabel: find('formlabel', v => /Raison/.test(v.text)),
  formlabel2: find('formlabel', v => /Univers/.test(v.text)),
  formcard: sample('formcard|manual'),
  menuUser: find('menu', v => /css-qaotz4/.test(v.sig)),
  menuPower: find('menu', v => /css-1kfu8nn/.test(v.sig)),
  menuOrigins: find('menu', v => /css-15xa4a2/.test(v.sig)),
  avatarUser: find('avatar', v => /css-172qkdj/.test(v.sig)),
  avatarFlag: find('avatar', v => /css-18oor2t/.test(v.sig)),
  headingPage: find('heading', v => /css-13e5vvr/.test(v.sig)),
  headingDrawer: find('heading', v => /css-btg4an/.test(v.sig)),
  headingOrigine: find('heading', v => /css-1jipdab/.test(v.sig)),
  dividers: byName('divider'),
  badges: byName('badge'),
  wrapTags: find('wrap', v => /css-ok8zxw/.test(v.sig)),
  wrapRoles: find('wrap', v => /css-i6bazn/.test(v.sig)),
  tablewrap: find('tablewrap'),
  thead: find('thead'),
  trFourn: find('tr', v => /css-1jg4rhe/.test(v.sig)),
  trContrat: find('tr', v => /css-4tz101/.test(v.sig)),
  refrow: sample('refrow|manual'),
  accComparaison: find('accordion', v => /css-1t7rcca/.test(v.sig)),
  accOrigine: find('accordion', v => /css-sb8hnz/.test(v.sig)),
  accUB: find('accordion', v => /css-k1i27f/.test(v.sig)),
  kpi: sample('kpi|manual'),
  kpigrid: sample('kpigrid|manual'),
  segmented: sample('segmented|manual'),
  univers: sample('univers|manual'),
  pagination: sample('pagination|manual'),
  paginationRefs: sample('pagination|references'),
  tablewrapContrats: sample('tablewrap|contrats'),
  drawer: sample('drawer|manual'),
  overlay: sample('overlay|manual'),
  rail: find('rail'),
  pagehead: find('pagehead', v => /Références/.test(v.text)),
  pageheadForm: sample('pagehead|form'),
  filterbarRefs: sample('filterbar|references'),
  filterbarContrats: sample('filterbar|contrats'),
  emptyState: find('stack', v => /Aucune région/.test(v.text)),
  linkMenu: find('link', v => /menuitem/.test(v.sig)),
  linkBtn: find('link', v => /chakra-button/.test(v.sig)),
};
const g = x => Array.isArray(x) ? x[1] : x; // unwrap [key, sample]
const missing = Object.entries(pick).filter(([k, v]) => !v || (Array.isArray(v) && v.length === 0 && k === 'btnRowIcons'));
if (missing.length) console.warn('MISSING picks:', missing.map(m => m[0]).join(', '));

/* ------------------------------------------------------------------ pages */
// A demo block: real HTML rendered in a shadow root + real code (HTML / CSS / tokens) + IA rules
let demoId = 0;
function demo(samples, opts = {}) {
  const isPair = x => Array.isArray(x) && x.length === 2 && typeof x[0] === 'string' && x[1] && typeof x[1] === 'object' && 'html' in x[1];
  samples = (Array.isArray(samples) && !isPair(samples) ? samples : [samples]).map(g).filter(Boolean);
  if (!samples.length) return '<div class="empty-page"><span class="soon">Soon</span><p>Non relevé.</p></div>';
  const id = 'd' + (++demoId);
  const htmlReal = samples.map(renderable).join(opts.sep || '\n');
  const htmlShown = samples.map(s => pretty(s.html)).join('\n\n');
  const rules = [...new Set(samples.flatMap(sampleRules))];
  const cssShown = rules.map(cssPretty).join('\n\n');
  const toks = [...new Set(samples.flatMap(tokensUsed))].sort();
  const tokShown = toks.map(t => `${t}: ${D.tokens[t]};`).join('\n');
  const wrapStyle = opts.wrap || '';
  const screens = [...new Set(samples.map(s => s.screen))].join(', ');
  return `<div class="demo" data-demo="${id}" data-screens="${esc(screens)}">
    <div class="demo-preview${opts.grey ? ' is-grey' : ''}${opts.block ? ' is-block' : ''}" data-shadow-host style="${esc(wrapStyle)}"></div>
    <template data-shadow>${htmlReal}</template>
    <div class="demo-foot">
      <button class="demo-toggle" type="button" data-panel="code">${chev}<span>Afficher le code</span><span class="demo-file">${esc(screens)}</span></button>
      <div class="demo-panel demo-code" hidden>
        <div class="demo-tabs"><button type="button" data-lang="html" class="is-on">HTML servi</button><button type="button" data-lang="css">CSS Emotion</button><button type="button" data-lang="tokens">Tokens utilisés (${toks.length})</button><span class="demo-file"></span></div>
        <div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre data-html><code>${esc(htmlShown)}</code></pre><pre data-css hidden><code>${esc(cssShown)}</code></pre><pre data-tokens hidden><code>${esc(tokShown)}</code></pre></div>
      </div>
      ${opts.rules ? rulesRow(opts.rules) : ''}
    </div>
  </div>`;
}
const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
const RULES = {};
function rulesRow(key) {
  const text = RULES[key] || `# ${key}\nStatut : Soon.`;
  return `<button class="demo-toggle demo-toggle--rules" type="button" data-panel="rules">${chev}<span>IA Rules</span><span class="demo-file">rules/${key}.md</span></button>
    <div class="demo-panel demo-rules" hidden><div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre><code>${esc(text)}</code></pre></div></div>`;
}
const section = (title, body, note) => `<section class="section"><h2>${title}</h2>${note ? `<p class="note">${note}</p>` : ''}${body}</section>`;

/* ---- IA rules (fondées sur les classes et tokens réels) ---- */
const T = D.tokens;
RULES.couleurs = `# Couleurs — Orica (Belco Hub)
Source : variables CSS du thème Chakra UI servi par hub.belco-sandbox.synako.fr (relevé 5 nov. 2026). Fichier : couleurs.md
Utiliser les variables telles quelles : var(--chakra-colors-…). Ne jamais écrire un hex en dur.

## Échelles de marque
- orica / primary (identiques) : 30 ${T['--chakra-colors-orica-30']} · 50 ${T['--chakra-colors-orica-50']} · 100 ${T['--chakra-colors-orica-100']} · 300 ${T['--chakra-colors-orica-300']} · 500 ${T['--chakra-colors-orica-500']} (accent Orica) · 600 ${T['--chakra-colors-orica-600']} · 700 ${T['--chakra-colors-orica-700']} · 900 ${T['--chakra-colors-orica-900']}
- blink (module Blink, hors périmètre) : 500 ${T['--chakra-colors-blink-500']} · lab (Le Lab, hors périmètre) : 500 ${T['--chakra-colors-lab-500']}
- dark (texte) : 500 ${T['--chakra-colors-dark-500']} = couleur de texte html/body · 400 ${T['--chakra-colors-dark-400']} · alphas dark-500-1 … dark-500-8
- gray / secondary (identiques) : 50 ${T['--chakra-colors-gray-50']} · 100 ${T['--chakra-colors-gray-100']} = fond html/body · 200 ${T['--chakra-colors-gray-200']} · 300 ${T['--chakra-colors-gray-300']} · 400 ${T['--chakra-colors-gray-400']} · 500 ${T['--chakra-colors-gray-500']} · 600 ${T['--chakra-colors-gray-600']} · 700 ${T['--chakra-colors-gray-700']} (placeholders) · 800 ${T['--chakra-colors-gray-800']} · 900 ${T['--chakra-colors-gray-900']}
- green : 50 ${T['--chakra-colors-green-50']} · 100 ${T['--chakra-colors-green-100']} · 500 ${T['--chakra-colors-green-500']} · 800 ${T['--chakra-colors-green-800']} · 900 ${T['--chakra-colors-green-900']} (vert forêt belco.fr)
- error / red : 500 ${T['--chakra-colors-error-500']} · success-500 ${T['--chakra-colors-success-500']} · warning-500 ${T['--chakra-colors-warning-500']} · alert ${T['--chakra-colors-alert']}
- sand : 50 ${T['--chakra-colors-sand-50']} (fond belco.fr) · 500 ${T['--chakra-colors-sand-500']} · ivory-500 ${T['--chakra-colors-ivory-500']} · ivory-600 ${T['--chakra-colors-ivory-600']}
- secondaryGreen 300 ${T['--chakra-colors-secondaryGreen-300']} (sauge) · 500 ${T['--chakra-colors-secondaryGreen-500']} (mousse) · mossGreen 500 ${T['--chakra-colors-mossGreen-500']} · brown 500 ${T['--chakra-colors-brown-500']}

## Tokens sémantiques métier (badges qualité et statuts)
- terroir 100/500 ${T['--chakra-colors-terroir-100']} / ${T['--chakra-colors-terroir-500']} · label 100/500 ${T['--chakra-colors-label-100']} / ${T['--chakra-colors-label-500']} · labelplus ${T['--chakra-colors-labelplus-100']} / ${T['--chakra-colors-labelplus-500']} · estate ${T['--chakra-colors-estate-100']} / ${T['--chakra-colors-estate-500']} · microlot ${T['--chakra-colors-microlot-100']} / ${T['--chakra-colors-microlot-500']} · prestige ${T['--chakra-colors-prestige-100']} / ${T['--chakra-colors-prestige-500']} · classic ${T['--chakra-colors-classic-100']} / ${T['--chakra-colors-classic-500']} · blend ${T['--chakra-colors-blend-100']} / ${T['--chakra-colors-blend-500']} · nosourcing ${T['--chakra-colors-nosourcing-100']} / ${T['--chakra-colors-nosourcing-500']}
- status-prospect ${T['--chakra-colors-status-prospect-100']} / ${T['--chakra-colors-status-prospect-500']} · status-fournisseur ${T['--chakra-colors-status-fournisseur-100']} / ${T['--chakra-colors-status-fournisseur-500']} · status-inactif ${T['--chakra-colors-status-inactif-100']} / ${T['--chakra-colors-status-inactif-500']}
- statuteOffreAchat : recue ${T['--chakra-colors-statuteOffreAchat-recue']} · negociation ${T['--chakra-colors-statuteOffreAchat-negociation']} · achetee ${T['--chakra-colors-statuteOffreAchat-achetee']} · nogo ${T['--chakra-colors-statuteOffreAchat-nogo']}
- planAchat : pipeline ${T['--chakra-colors-planAchat-pipeline']} · conversion ${T['--chakra-colors-planAchat-conversion']} · conversionMuted ${T['--chakra-colors-planAchat-conversionMuted']}
- echantillon-type (offre, pss, arrivage, formation, sav, primeur), scoreMauvais/Moyen/Bon/TresBon, scoringCafeLevel high/mid/low, segmentScoringClient dormant/pepite/strategique : voir tokens.css

## Règles
- Le primaire d'Orica est primary-500 (= orica-500). Les boutons primaires passent en dégradé linear-gradient(135deg, primary-700 → primary-500) au hover et au active.
- Le focus clavier est --chakra-shadows-outline (${T['--chakra-shadows-outline']}) : ne pas le remplacer.
- Texte : dark-500 ; placeholders : gray-700 ; filets : gray-200 à gray-300 ; fond de page : gray-100.
- Le rouge error-500 n'est jamais un fond de bouton ; il sert au texte (« Se déconnecter », astérisque) et aux bordures invalides.
- Pas de mode sombre activé (les règles .chakra-ui-dark existent dans le CSS mais ne sont pas appliquées).`;

RULES.typographie = `# Typographie — Orica
Source : tokens Chakra servis. Fichier : typographie.md

- --chakra-fonts-body = --chakra-fonts-heading = ${T['--chakra-fonts-body']} ; --chakra-fonts-mono = ${T['--chakra-fonts-mono']}
- @font-face CentraNo2 : 400 (book), 500 (medium), 700 (bold), 800 (extrabold) — fichiers /orica/fonts/centrano2-*.woff2
- fontSizes : xs ${T['--chakra-fontSizes-xs']} · sm ${T['--chakra-fontSizes-sm']} · md ${T['--chakra-fontSizes-md']} (défaut html/body) · lg ${T['--chakra-fontSizes-lg']} · xl ${T['--chakra-fontSizes-xl']} · 2xl ${T['--chakra-fontSizes-2xl']} · 3xl ${T['--chakra-fontSizes-3xl']} · 4xl ${T['--chakra-fontSizes-4xl']} · 5xl ${T['--chakra-fontSizes-5xl']} · 2xs ${T['--chakra-fontSizes-2xs']} · 3xs ${T['--chakra-fontSizes-3xs']}
- fontWeights : normal 400 · medium 500 · semibold 600 · bold 700 · extrabold 800
- lineHeights : none 1 · shorter 1.25 · short 1.375 · base 1.5 · tall 1.625 ; html reset line-height 1.5
- letterSpacings : tighter -0.05em · tight -0.025em · normal 0 · wide 0.025em · wider 0.05em · widest 0.1em

## Usages relevés
- Titre de page (chakra-heading css-13e5vvr) : voir composant Heading ; boutons : fontSizes-lg (14px) weight 500/600 ; onglets : fontSizes-lg weight 500 ; libellés de formulaire : weight 600 ; corps : md (13px).

## Règles
- Une seule famille. Pas de police display, pas de majuscules sur les titres.
- Toujours passer par var(--chakra-fontSizes-*) et var(--chakra-fontWeights-*).`;

RULES.matieres = `# Matières — Orica
Source : tokens Chakra servis. Fichier : matieres.md

- radii : xs ${T['--chakra-radii-xs']} · sm ${T['--chakra-radii-sm']} · base ${T['--chakra-radii-base']} · md ${T['--chakra-radii-md']} (boutons, selects, inputs) · lg ${T['--chakra-radii-lg']} · xl ${T['--chakra-radii-xl']} · 2xl ${T['--chakra-radii-2xl']} · 3xl ${T['--chakra-radii-3xl']} · full 9999px (rem sur base 13px : md = 10.4px, sm = 5.2px, xs = 2.6px)
- shadows : xs ${T['--chakra-shadows-xs']} · sm ${T['--chakra-shadows-sm']} · md ${T['--chakra-shadows-md']} · lg ${T['--chakra-shadows-lg']} (drawer) · outline ${T['--chakra-shadows-outline']} (focus) · xs-top ${T['--chakra-shadows-xs-top']} ; couleur d'ombre --chakra-colors-shadow ${T['--chakra-colors-shadow']}
- space : 1 0.25rem … 96 24rem (échelle Chakra standard, base 13px) ; sizes : 10 = 2.5rem = 32.5px (hauteur des boutons, inputs, selects)
- borders : 1px / 2px / 4px / 8px solid ; border-color par défaut --chakra-colors-chakra-border-color → gray-200
- zIndices : dropdown 1000 · sticky 1100 · overlay 1300 · modal 1400 (drawer Filtres) · popover 1500 · toast 1700 · tooltip 1800
- transitions : property-common ${T['--chakra-transition-property-common']} ; duration normal 200ms, fast 150ms
- breakpoints : sm ${T['--chakra-breakpoints-sm']} · md ${T['--chakra-breakpoints-md']} · lg ${T['--chakra-breakpoints-lg']} · xl ${T['--chakra-breakpoints-xl']} · 2xl ${T['--chakra-breakpoints-2xl']}

## Règles
- Les ombres sont toutes à 5 % d'opacité (#100F0F0D) : elles séparent, elles ne décorent pas.
- radii-md partout sur les contrôles ; radii-full pour les avatars et pastilles.
- Le drawer utilise zIndices-modal et shadows-lg sur un overlay blackAlpha-600 (${T['--chakra-colors-blackAlpha-600']}).`;

RULES.bouton = `# Bouton — Orica (chakra-button)
Source : HTML et règles Emotion servies. Fichier : bouton.md

## Variantes relevées (classe Emotion → usage)
- css-umgg81 : primaire. Fond primary-500, texte blanc, hauteur sizes-10, radii-md, font-size lg, weight 500, padding-inline 24px. Hover/active : dégradé 135deg primary-700 → primary-500. Icône via chakra-button__icon (margin-inline-end 0.5rem).
- css-9u5p6t : secondaire (« Filtres »). Fond gray-200, border 1px, hover gray-300. Dans un chakra-button__group attaché.
- css-1mkv6x2 / css-15cs1d / css-1d5dnrm : pied du drawer (Réinitialiser / Appliquer / Supprimer).
- css-dvj57b, css-rs6u5x : boutons texte (« Parcours prospect », « Gérer les tags fournisseur »).
- css-4osav8 : onglet-bouton avec badge compteur (« Fournisseurs et prospects 708 »).
- css-d8378c : choix Univers dans un formulaire (« Café » / « Cacao »).
- css-1j5h8y1 : bouton doux « Ajouter … » des formulaires. css-j45hbs : « Enregistrer ». css-bquyvs : « Importer Excel ». css-x7zswu : « Nouvelle offre ». css-u8ip7p : « Tout fermer / Tout ouvrir ».
- css-684j93 : bouton icône inline (copier) · css-39ivzn : flèches de pagination (disabled → opacity .4) · css-dj65kc : flèche de défilement des filtres · css-1vt6cti : tuile du rail · css-od61ih : retour (page de création) · css-1695t4a : bouton-avatar du menu utilisateur.

## États (communs à toutes les variantes, écrits dans le CSS)
- :focus-visible → box-shadow var(--chakra-shadows-outline)
- :disabled / [aria-disabled=true] → opacity .4, cursor not-allowed, box-shadow none ; hover désactivé → dégradé primary-600 → primary-400 (primaire) ou gray-200 (secondaire)
- transition : var(--chakra-transition-property-common) var(--chakra-transition-duration-normal)

## Règles
- Réutiliser les classes Emotion existantes via le composant React <Button> du Hub ; ne pas recréer de bouton en CSS libre.
- Un primaire par en-tête de page, à droite du titre, avec icône « plus » (FontAwesome circle-plus) à gauche.`;

RULES.tabs = `# Tabs — Orica (chakra-tabs)
Fichier : tabs.md
- chakra-tabs__tablist css-1q9h0zz : flex, overflow scroll sans scrollbar, border-bottom 1px gray-300.
- chakra-tabs__tab css-1wrhscr : weight 500, fontSizes-lg, padding 10px 0, margin-right 30px, border-bottom 2px transparent. [aria-selected=true] → couleur primary-500 et border-color primary-500 ; :active → fond gray-200 ; disabled → opacity .4.
- Les onglets peuvent être des <a> (Références) ou des <button> (Contrats, Plans d'achat). Un badge compteur (chakra-badge) suit le libellé.
## Règles
- Sous l'en-tête de page, avant la barre de filtres. Jamais plus d'un niveau.`;

RULES.select = `# Select & menus — Orica
Fichier : select.md
- chakra-select css-mfnris : <select> natif, hauteur sizes-10, radii-md, fond blanc, border 1px, padding-inline-start space-4, icône chevron absolue (chakra-select__icon-wrapper css-iohxn1, 24px). Hover → border gray-100 ; focus-visible → border rgb(49,130,206) ; [aria-invalid] → border red ; disabled → opacity .4.
- chakra-menu__menu-list : panneau des menus (utilisateur, Power BI, filtres Origines) ; items chakra-menu__menuitem / __menuitem-option (css-hu8ktr) avec chakra-menu__icon-wrapper pour la coche.
- Filtres de liste : un chakra-menu__menu-button ouvre une liste d'options cochables avec compteur.
## Règles
- Select natif pour un choix simple ; menu Chakra à options pour le multi-choix avec compteurs.`;

RULES.champs = `# Champs — Orica (chakra-input, chakra-textarea, chakra-form__label)
Fichier : champs.md
- Recherche : chakra-input__group css-1dg1wqw (min-width 200px) + chakra-input__left-element (loupe 16px) + chakra-input css-gpd2jp (hauteur 2.5em, padding-inline-start 2.5em, radii-md, border gray-200, texte dark-500, placeholder gray-700). Hover → border gray-500 ; focus → border primary-500 et fond gray-50 ; invalid → border red-500.
- Formulaire : chakra-input css-1v4ryj4, chakra-textarea css-1gdsx9s, libellé chakra-form__label (weight 600, astérisque en span requis).
- Cases : chakra-checkbox__control css-j9e2r5 (18px, radii-xs, border primary-500 ; checked → fond primary-500 ; hover checked → primary-600 ; disabled → gray-100). Radio : chakra-radio css-15xz5uj.
## Règles
- Libellé au-dessus, weight 600, astérisque rouge via span. Aide et erreur sous le champ.
- État d'erreur : [aria-invalid=true] (border error-500) existe dans le CSS ; aucun message d'erreur n'a été relevé visuellement.`;

RULES.badge = `# Badge & tags — Orica
Fichier : badge.md
- chakra-badge css-gb6hna / css-li4vr2 : compteur après un libellé d'onglet (« 708 », « 694 »).
- Tags de référence (chakra-wrap css-ok8zxw > chakra-wrap__list) : spans css-1tzmuxv (poids, process), css-449933 (Microlot), css-iwbke2 (Label), css-p9hk8a (Terroir) — couleurs via tokens microlot / label / terroir.
- Statuts de tableau (Actif / Inactif, Finalisé) : spans dans les cellules, couleurs status-* et tokens sémantiques.
## Règles
- Un tag par qualité, ordre : type de sourcing, label, poids. Couleurs uniquement via les tokens métier (terroir, label, estate, microlot…).`;

RULES.tableau = `# Tableau — Orica (chakra-table)
Fichier : tableau.md
- chakra-table__container css-1nmizk2 > table.chakra-table css-h1zm47 ; thead ; tbody tr css-1jg4rhe (fournisseurs) / css-4tz101 (contrats).
- Cellules : avatar-drapeau (chakra-avatar css-18oor2t) + nom, chips de type, statut, compteurs, colonne d'actions avec boutons icônes.
- Pagination : nav.chakra-stack css-17769tf → texte « n / N » (chakra-text css-ebjc71) + deux chakra-button css-39ivzn (Précédent / Suivant, disabled quand inapplicable).
## Règles
- Première colonne = identité (drapeau + nom), dernière = actions. Pas de bordures verticales.`;

RULES.ecrans = `# Écrans — Orica
Fichier : ecrans.md
- Rail : <aside> css-1dn00vq, 64px, tuiles chakra-button css-1vt6cti ; module actif marqué ; avatar utilisateur en bas (chakra-menu).
- En-tête de page : <header> avec chakra-heading css-13e5vvr (titre), radiogroup Univers (css-1laeaix, Café / Cacao), action primaire à droite ; page de création : bouton retour css-od61ih avant le titre.
- Liste : onglets → barre de filtres (chakra-input__group + chakra-select__wrapper × n + chakra-checkbox + bouton Filtres dans un chakra-button__group) → lignes (css-2g5t7v pour les références, chakra-table pour les autres) → pagination.
- Plans d'achat : grille de KPI css-123lq1y > cartes css-qhm6ri (icône, titre, valeur css-1vcnt04, barre empilée css-sm2y2r, légendes), segmented radiogroup css-1g55o27 (Par origines / Par UB / Kanban), accordéons chakra-accordion__item.
- Drawer Filtres : chakra-modal__content css-15u2225 (364px, droite) sur chakra-modal__overlay ; groupes chakra-form-control avec radios / cases ; pied Réinitialiser / Appliquer.
## Règles
- Toujours cet ordre : en-tête, onglets, filtres, contenu, pagination.`;

/* ---- pages ---- */
for (const k of Object.keys(RULES)) { try { const t = fs.readFileSync(path.join(OUT, 'rules', k + '.md'), 'utf8'); if (t.trim()) { RULES[k] = t.replace(/\n+$/, ''); SRC.rules.push(k); } } catch (e) { } }
const PAGES = [];
const page = (id, group, title, lede, body, soon) => PAGES.push({ id, group, title, lede, body, soon });

const colorScale = (prefix, steps) => `<div class="scale"><b>${prefix}</b><div class="scale-row">${steps.map(s => { const k = `--chakra-colors-${prefix}-${s}`; return T[k] ? `<div class="sw"><i style="background:${T[k]}"></i><span>${s}</span><small>${T[k]}</small></div>` : ''; }).join('')}</div></div>`;
const semanticList = (keys) => `<div class="sem">${keys.map(k => `<div class="sem-row"><i style="background:${T[k]}"></i><code>${k}</code><span>${T[k]}</span></div>`).join('')}</div>`;

page('introduction', 'Fondations', 'Orica Design System',
  'Documentation ISO du module Orica du Belco Hub : les variables CSS du thème Chakra UI, les règles Emotion et le HTML tels qu’ils sont servis par l’application, relevés le 5 novembre 2026. Rien n’est réécrit : chaque aperçu est rendu avec le CSS de la prod, chaque bloc de code est celui de la prod. Les données ont été neutralisées.',
  `<div class="bento">
    <a href="#couleurs"><div class="bento-preview"><div class="bars">${['dark-500','gray-700','gray-300','primary-500','primary-100','green-900','sand-500','terroir-500','label-500'].map(k => `<i style="background:${T['--chakra-colors-'+k]}"></i>`).join('')}</div></div><h3>Couleurs</h3><p>${Object.keys(T).filter(k => k.startsWith('--chakra-colors-')).length} variables de couleur : échelles, alphas, tokens métier.</p></a>
    <a href="#composants"><div class="bento-preview is-shadow" data-shadow-host></div><template data-shadow>${inlineIcons(g(pick.btnPrimary).html)} ${inlineIcons(g(pick.tabsPlans).html)}</template><h3>Composants</h3><p>${Object.keys(D.rulesByClass).length} classes Emotion relevées, ${Object.keys(D.icons).length} icônes SVG, ${Object.keys(S).length} échantillons HTML.</p></a>
    <a href="#ecran-references"><div class="bento-preview is-shadow" data-shadow-host style="align-items:flex-start"></div><template data-shadow>${inlineIcons(g(pick.pagehead).html)}</template><h3>Écrans</h3><p>Neuf écrans d’Orica, avec leurs en-têtes, barres de filtres, listes et panneaux tels que servis.</p></a>
    <a href="#typographie"><div class="bento-preview"><div style="display:flex;flex-direction:column;gap:6px;align-items:center;font-family:CentraNo2,system-ui,sans-serif"><span style="font-size:25px;font-weight:700;line-height:1.2">CentraNo2</span><span style="font-size:13px;color:#777a7f">fontSizes-md 13px · body dark-500</span></div></div><h3>Typographie</h3><p>Une famille, quatre graisses servies, une échelle de 10 à 30 px.</p></a>
    <a href="#matieres"><div class="bento-preview"><div class="shape-row"><i style="border-radius:${T['--chakra-radii-sm']};background:#fff;box-shadow:${T['--chakra-shadows-xs']}"></i><i style="border-radius:${T['--chakra-radii-md']};background:#fff;box-shadow:${T['--chakra-shadows-sm']}"></i><i style="border-radius:${T['--chakra-radii-xl']};background:#fff;box-shadow:${T['--chakra-shadows-lg']}"></i></div></div><h3>Matières</h3><p>Rayons en rem sur base 13 px, ombres à 5 %, z-index et transitions Chakra.</p></a>
    <a href="#icones"><div class="bento-preview is-shadow" data-shadow-host style="flex-wrap:wrap;gap:14px;font-size:22px;color:#232930"></div><template data-shadow>${Object.entries(D.icons).slice(0, 14).map(([id, ic]) => `<svg viewBox="${ic.viewBox || '0 0 24 24'}" style="width:1em;height:1em" class="${ic.cls}">${ic.inner}</svg>`).join('')}</template><h3>Icônes</h3><p>${Object.keys(D.icons).length} SVG inline relevés (FontAwesome et Chakra), tels que servis.</p></a>
  </div>
  ${section('Méthode', `<p>Pour chaque écran, un script a lu <code class="inline">document.styleSheets</code> (variables <code class="inline">--chakra-*</code>, reset, règles Emotion <code class="inline">.css-xxxx</code> avec leurs états <code class="inline">:hover</code>, <code class="inline">:focus-visible</code>, <code class="inline">[data-active]</code>, <code class="inline">:disabled</code>) et le <code class="inline">outerHTML</code> de chaque composant. Les aperçus sont rendus dans un Shadow DOM avec ces règles ; ils ne sont pas redessinés. Les images externes (drapeaux flag-icons chargés depuis jsDelivr, sceaux de certification servis par le CDN Filerobot) sont remplacées par un rectangle neutre dans les aperçus, le code conservant l\u2019URL d\u2019origine ; les identifiants portés par les liens (rapports Power BI) sont mis à zéro. Les listes répétitives sont réduites à trois éléments et les contenus métier (noms, références, montants, dates) remplacés par des valeurs neutres ; les libellés d’interface sont conservés.</p>`)}
  ${section('Ce qui n’est pas ISO', `<p>Les fichiers de fontes CentraNo2 (woff2, sous licence) ne sont pas embarqués : la page les charge si elles sont installées localement, sinon system-ui. Les composants Chakra absents des écrans parcourus (toast, modal de confirmation, tooltip, switch, skeleton, date picker, kanban) sont marqués Soon. Les animations Framer Motion du segmented (translation du curseur) sont figées.</p>`)}
`);

page('couleurs', 'Fondations', 'Couleurs',
  `${Object.keys(T).filter(k => k.startsWith('--chakra-colors-')).length} variables de couleur, dans l’ordre et avec les valeurs du thème servi. Les échelles orica et primary sont identiques ; gray et secondary aussi.`,
  `${section('Échelles', [
    ['orica', ['30','50','100','200','300','400','500','600','700','800','900']],
    ['dark', ['50','100','200','300','400','500','600','700','800','900']],
    ['gray', ['50','70','100','200','300','400','500','600','700','800','900']],
    ['green', ['50','100','200','300','400','500','600','700','750','800','850','900']],
    ['secondaryGreen', ['50','100','110','150','200','250','300','350','400','500','600','700','800','900']],
    ['mossGreen', ['50','100','200','300','400','500','600','700','800','900']],
    ['sand', ['50','100','200','300','400','500','600','700','800','900']],
    ['brown', ['50','100','200','300','400','500','600','700','800','900']],
    ['ivory', ['50','100','500','600','800']],
    ['brand', ['50','100','200','300','400','500','600','700','800','900']],
    ['blink', ['30','50','70','100','200','300','400','500','600','700','800','900']],
    ['lab', ['30','50','100','200','300','400','500','600','700','800','900']],
    ['error', ['50','100','200','300','400','500','600','700','800','900']],
    ['yellow', ['50','100','200','300','400','500','600','700','800','900']],
    ['cacao', ['50','100','200','300','400','500','600','700','800','900','950']],
    ['blue', ['50','100','200','300','400','500','600','700','800','900']],
  ].map(([p, s]) => colorScale(p, s)).join(''))}
  ${section('Tokens métier', semanticList(Object.keys(T).filter(k => /^--chakra-colors-(terroir|label|labelplus|estate|microlot|prestige|classic|blend|nosourcing|outgrower|producteur|status-|statuteOffreAchat|planAchat|echantillon-type|scoreMauvais|scoreMoyen|scoreBon|scoreTresBon|prioriteClient|success|warning|alert|shadow|translate|prixEnBaisse|fcco|digiforma|segmentationClient)/.test(k) && !/-\d-\d$/.test(k))), 'Les tokens que les composants métier (badges qualité, statuts d’offre, plans d’achat, échantillons) utilisent directement.')}
  ${section('Variables sémantiques Chakra', semanticList(['--chakra-colors-chakra-body-text','--chakra-colors-chakra-body-bg','--chakra-colors-chakra-border-color','--chakra-colors-chakra-subtle-bg','--chakra-colors-chakra-placeholder-color']), 'Résolues en gray-800, white, gray-200, gray-100, gray-500 ; mais html et body sont surchargés : texte dark-500 et fond gray-100.')}
  ${section('tokens.css', `<div class="demo is-open"><div class="demo-code" style="border-top:0"><div class="demo-tabs"><span class="demo-file">tokens.css · ${Math.round(tokensCss.length/1024)} Ko · ${Object.keys(T).length} variables</span></div><div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre><code>${esc(tokensCss)}</code></pre></div></div><div class="demo-foot">${rulesRow('couleurs')}</div></div>`)}
`);

page('typographie', 'Fondations', 'Typographie',
  'Les tokens de police du thème et les quatre déclarations @font-face servies.',
  `${section('Échelle fontSizes', `<div class="type-scale">${['3xs','2xs','xs','sm','md','lg','xl','2xl','3xl','4xl','5xl'].map(k => `<div class="type-row"><div class="meta"><b>fontSizes-${k}</b><small>${T['--chakra-fontSizes-'+k]}</small></div><div class="spec" style="font-family:CentraNo2,system-ui,sans-serif;font-size:${T['--chakra-fontSizes-'+k]};line-height:1.3">Sourcing et importation de cafés verts</div></div>`).join('')}</div>`)}
  ${section('Graisses', `<div class="type-scale">${[['normal',400],['medium',500],['semibold',600],['bold',700],['extrabold',800]].map(([k,w]) => `<div class="type-row"><div class="meta"><b>fontWeights-${k}</b><small>${w}${[400,500,700,800].includes(w)?' · @font-face servie':' · synthétisée'}</small></div><div class="spec" style="font-family:CentraNo2,system-ui,sans-serif;font-size:18px;font-weight:${w}">Entre 150 et 300 cafés disponibles toute l’année</div></div>`).join('')}</div>`, 'Le semibold 600 est utilisé par des composants (libellés de formulaire, bouton large) mais aucune fonte 600 n’est servie : le navigateur l’interpole.')}
  ${section('@font-face servies', `<div class="demo is-open"><div class="demo-code" style="border-top:0"><div class="demo-tabs"><span class="demo-file">fonts.css</span></div><div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre><code>${esc(D.fontFaces.filter(f => /CentraNo2/.test(f)).join('\n'))}</code></pre></div></div><div class="demo-foot">${rulesRow('typographie')}</div></div>`, 'Les woff2 ne sont pas inclus (licence Colophon). Cette page utilise local("Centra No2 …") en secours.')}
`);

page('matieres', 'Fondations', 'Matières',
  'Rayons, ombres, espacements, z-index et transitions : les valeurs du thème, sans conversion.',
  `${section('Rayons', `<div class="preset-grid">${['xs','sm','base','md','lg','xl','2xl','3xl','full'].map(k => `<div class="preset"><div class="box" style="background:#fff;border:1px solid ${T['--chakra-colors-gray-300']};border-radius:${T['--chakra-radii-'+k]}"></div><b>radii-${k}</b><small>${T['--chakra-radii-'+k]}${/rem/.test(T['--chakra-radii-'+k])?' = '+(parseFloat(T['--chakra-radii-'+k])*13)+'px':''}</small></div>`).join('')}</div>`, 'Base rem = 13 px (fontSizes-md sur html).')}
  ${section('Ombres', `<div class="preset-grid">${['xs','sm','md','lg','outline','xs-top','base','xl','2xl','inner','dark-lg'].map(k => `<div class="preset"><div class="box" style="background:#fff;border-radius:${T['--chakra-radii-md']};box-shadow:${T['--chakra-shadows-'+k]}"></div><b>shadows-${k}</b><small>${esc(T['--chakra-shadows-'+k])}</small></div>`).join('')}</div>`, 'xs, sm, md, lg et xs-top sont les ombres Belco (#100F0F0D, 5 %) ; base, xl, 2xl, inner, dark-lg sont les valeurs Chakra par défaut, présentes dans le thème.')}
  ${section('Espacements', `<div class="space-row">${['0-5','1','1-5','2','2-5','3','3-5','4','5','6','8','10','12','16','20'].map(k => `<figure><i style="width:${T['--chakra-space-'+k]};height:${T['--chakra-space-'+k]};background:${T['--chakra-colors-primary-500']}"></i><figcaption>space-${k}<br><small>${T['--chakra-space-'+k]}</small></figcaption></figure>`).join('')}</div>`)}
  ${section('z-index, transitions, breakpoints', `<div class="demo is-open"><div class="demo-code" style="border-top:0"><div class="demo-tabs"><span class="demo-file">tokens.css (extrait)</span></div><div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre><code>${esc(Object.entries(T).filter(([k]) => /^--chakra-(zIndices|transition|breakpoints|borders|blur|sizes-(10|8|6|4|container))/.test(k)).map(([k,v]) => `${k}: ${v};`).join('\n'))}</code></pre></div></div><div class="demo-foot">${rulesRow('matieres')}</div></div>`)}
`);

page('icones', 'Fondations', 'Icônes',
  `${Object.keys(D.icons).length} SVG inline relevés dans les écrans, avec leur viewBox et leur classe. Les icônes FontAwesome (viewBox 0 0 512 512 ou 0 0 448 512) et les icônes Chakra (0 0 24 24) cohabitent.`,
  `${section('Jeu relevé', `<div class="icon-grid">${Object.entries(D.icons).map(([id, ic]) => `<div class="icon-cell" title="${id}"><svg viewBox="${ic.viewBox || '0 0 24 24'}" style="width:22px;height:22px;color:#232930">${ic.inner}</svg><small>${esc((ic.viewBox||'').replace('0 0 ',''))}</small></div>`).join('')}</div>`, 'Les icônes sont rendues en currentColor ; la couleur vient du composant parent.')}
  ${section('icons.svg (sprite)', `<div class="demo"><div class="demo-code" style="border-top:0"><div class="demo-tabs"><span class="demo-file">icons.svg · ${Object.keys(D.icons).length} symboles</span></div><div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre><code>${esc(spriteSvg())}</code></pre></div></div></div>`)}
`);
function spriteSvg() { return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n` + Object.entries(D.icons).map(([id, ic]) => `  <symbol id="${id}" viewBox="${ic.viewBox || '0 0 24 24'}">${ic.inner}</symbol>`).join('\n') + '\n</svg>'; }

page('terminal', 'Fondations', 'Terminal', 'Entrée conservée pour la structure Geist. Sans objet pour Orica.', `<div class="empty-page"><span class="display">Soon</span><p>Orica n’a pas d’outil en ligne de commande.</p></div>`, true);

/* ---- écrans ---- */
const SCREENS = [
  ['ecran-references', 'Références', '/orica/references/cafes', [pick.pagehead, pick.tabsRefs, pick.filterbarRefs, pick.refrow, pick.paginationRefs], 'En-tête, deux onglets (liens), barre de filtres avec recherche, selects, case « Inclure en sommeil » et bouton Filtres, puis les lignes de références (css-2g5t7v) chargées en continu.'],
  ['ecran-fournisseurs', 'Fournisseurs', '/orica/fournisseurs/actifs', [pick.btnTab, pick.tablewrap], 'Onglet-bouton avec compteur, puis tableau chakra-table : drapeau, nom, type, statut, rôles, contact, compteurs, actions.'],
  ['ecran-plans-achat', 'Plans d’achat', '/orica/plans_achat', [pick.segmented, pick.tabsPlans, pick.kpigrid, pick.accOrigine], 'Segmented « Par origines / Par UB / Kanban », onglets, grille de quatre cartes KPI avec barres empilées, accordéons par origine avec leurs lignes et « Nouvelle offre ».'],
  ['ecran-contrats', 'Contrats d’achat', '/orica/contrats_achat', [pick.tabsContrats, pick.filterbarContrats, pick.tablewrapContrats, pick.pagination], 'Quatre onglets avec compteurs, barre de filtres à neuf selects sur deux lignes avec flèches de défilement, tableau, pagination.'],
  ['ecran-direct-trade', 'Direct Trade', '/orica/direct_trade', [pick.trContrat], 'Tableau à huit colonnes ; même structure de ligne que les contrats.'],
  ['ecran-geographie', 'Géographie', '/orica/geographie', [pick.headingOrigine, pick.selectFiliale, pick.emptyState], 'Un select « Origine » au-dessus des onglets ; état vide « Aucune région trouvée ».'],
  ['ecran-formulaire', 'Formulaire de création', '/orica/fournisseurs/ajouter', [pick.pageheadForm, pick.formcard], 'Page dédiée avec retour, carte de formulaire : libellés chakra-form__label, inputs, select année, choix Univers en boutons, boutons doux « Ajouter … », textarea.'],
  ['ecran-drawer', 'Panneau Filtres', '/orica/references/cafes', [pick.drawer], 'chakra-modal__content css-15u2225, 364 px, à droite ; groupes chakra-form-control avec radios et cases ; pied Réinitialiser / Appliquer.'],
];
for (const [id, title, url, parts, desc] of SCREENS) {
  page(id, 'Écrans Orica', title, desc, `${section('Composition servie', demo(parts, { grey: true, block: true, rules: 'ecrans', sep: '<div style="height:16px"></div>', wrap: id === 'ecran-drawer' ? 'min-height:640px' : '' }), `Relevé sur <code class="inline">${url}</code>. Chaque bloc est le HTML de l’écran, rendu avec ses règles.`)}`);
}

/* ---- composants ---- */
page('composants', 'Composants', 'Tous les composants', 'Les composants Chakra UI relevés dans Orica, par ordre alphabétique, avec leur classe racine.', '<div class="comp-grid" id="compGrid"></div>');
const COMP = [];
const comp = (id, title, lede, body, soon) => { COMP.push({ id, title, soon }); page(id, 'Composants', title, lede, body, soon); };

comp('bouton', 'Bouton', 'chakra-button : toutes les variantes relevées, avec le CSS Emotion de chacune (hover, active, focus-visible, disabled).',
  `${section('Primaire', demo([pick.btnPrimary, pick.btnPrimaryMenu], { rules: 'bouton' }), 'css-umgg81. Le second est un chakra-menu__menu-button : il ouvre un menu (Nouveau fournisseur / Nouveau prospect).')}
   ${section('Secondaires et boutons texte', demo([pick.btnFiltres, pick.btnImport, pick.btnGhost, pick.btnGhost2, pick.btnToggleAll]))}
   ${section('Formulaires', demo([pick.btnUnivers, pick.btnSoft, pick.btnSave, pick.btnOffre]))}
   ${section('Pied de drawer', demo([pick.btnReset, pick.btnSupprimer, pick.btnAppliquer]), 'Relevés tels quels : Supprimer et Appliquer portent l\u2019attribut disabled tant qu\u2019aucun filtre n\u2019est modifié (opacity .4 par la règle :disabled).')}
   ${section('Boutons icône', demo([pick.btnIconCopy, pick.btnIconPager, pick.btnIconScroll, pick.btnBack, pick.btnRail, ...pick.btnRowIcons]), 'Copie inline, pagination (disabled → opacity .4), défilement des filtres, retour, tuile du rail, actions de ligne.')}
   ${section('Onglet-bouton et avatar', demo([pick.btnTab, pick.btnAvatar]))}`);
comp('tabs', 'Tabs', 'chakra-tabs__tablist et chakra-tabs__tab : onglets soulignés, sélection en primary-500.',
  `${section('Liens (Références)', demo(pick.tabsRefs, { rules: 'tabs', block: true }))}
   ${section('Boutons avec compteurs (Contrats)', demo(pick.tabsContrats, { block: true }))}
   ${section('Plans d’achat', demo(pick.tabsPlans, { block: true }))}`);
comp('segmented', 'Segmented control', 'Radiogroup avec curseur animé (Framer Motion) : vue des plans d’achat et sélecteur d’univers de l’en-tête.',
  `${section('Vues', demo(pick.segmented, { rules: 'ecrans' }))}
   ${section('Univers (Café / Cacao)', demo(pick.univers))}`);
comp('select', 'Select', 'chakra-select : select natif stylé, chevron absolu.',
  `${section('Variantes', demo([pick.selectBasic, pick.selectOrigine, pick.selectFiliale, pick.selectAnnee], { rules: 'select' }))}`);
comp('menu', 'Menu déroulant', 'chakra-menu__menu-list : menu utilisateur, menu Power BI, liste de filtre à options cochables.',
  `${section('Menu utilisateur', demo(pick.menuUser, { rules: 'select' }))}
   ${section('Menu Power BI', demo(pick.menuPower))}
   ${section('Options cochables avec compteurs', demo(pick.menuOrigins), 'Liste réduite à trois options.')}`);
comp('champ-de-recherche', 'Champ de recherche', 'chakra-input__group avec élément gauche (loupe) et chakra-input.',
  `${section('Recherche', demo([pick.search, pick.search2], { rules: 'champs', block: true }))}`);
comp('champ-de-saisie', 'Champ de saisie', 'chakra-input, chakra-textarea, chakra-form__label et chakra-form-control.',
  `${section('Libellés', demo([pick.formlabel, pick.formlabel2], { rules: 'champs' }))}
   ${section('Input et textarea', demo([pick.inputForm, pick.inputDrawer, pick.textarea], { block: true }))}
   ${section('Form control (groupe de radios du drawer)', demo(pick.formcontrol, { block: true }))}
   ${section('Carte de formulaire complète', demo(pick.formcard, { block: true, grey: true }))}`);
comp('case-a-cocher', 'Case à cocher & radio', 'chakra-checkbox et chakra-radio avec leurs contrôles stylés.',
  `${section('Cases', demo([pick.checkbox, pick.checkbox2, pick.checkbox3], { rules: 'champs' }))}
   ${section('Radio', demo(pick.radio))}`);
comp('badge', 'Badge & tags', 'chakra-badge (compteurs) et chakra-wrap de tags (qualité, poids, rôles).',
  `${section('Badges compteurs', demo(pick.badges, { rules: 'badge' }))}
   ${section('Tags de référence', demo(pick.wrapTags))}
   ${section('Rôles (tableau fournisseurs)', demo(pick.wrapRoles))}`);
comp('avatar', 'Avatar', 'chakra-avatar : initiales de l’utilisateur (double anneau primary-500) et drapeau d’origine.',
  `${section('Variantes', demo([pick.avatarUser, pick.avatarFlag], { rules: 'ecrans' }))}`);
comp('heading', 'Heading & divider', 'chakra-heading (titre de page, titre de groupe) et chakra-divider.',
  `${section('Titres', demo([pick.headingPage, pick.headingDrawer, pick.headingOrigine], { block: true }))}
   ${section('Séparateurs', demo(pick.dividers, { block: true }))}`);
comp('tableau', 'Tableau', 'chakra-table__container, thead, lignes de fournisseurs et de contrats.',
  `${section('Tableau fournisseurs', demo(pick.tablewrap, { rules: 'tableau', block: true }))}
   ${section('Tableau contrats', demo(pick.tablewrapContrats, { block: true }))}
   ${section('Ligne de contrat', demo(pick.trContrat, { block: true, wrap: 'display:block' }), 'Rendue hors de son tableau : le HTML est celui de la ligne.')}`);
comp('ligne-de-reference', 'Ligne de référence', 'css-2g5t7v : la ligne riche de l’écran Références (drapeau ou icône, code, nom, tags, quantités).',
  `${section('Ligne', demo(pick.refrow, { rules: 'ecrans', block: true }))}`);
comp('pagination', 'Pagination', 'nav.chakra-stack css-17769tf : « n / N » et deux boutons icône.',
  `${section('Pager', demo([pick.pagination, pick.paginationRefs], { rules: 'tableau', block: true }))}`);
comp('carte-kpi', 'Carte KPI', 'css-qhm6ri : icône, titre, valeur, barre empilée, légendes, pied.',
  `${section('Carte', demo(pick.kpi, { rules: 'ecrans' }))}
   ${section('Grille complète', demo(pick.kpigrid, { block: true, grey: true }))}`);
comp('accordeon', 'Accordéon', 'chakra-accordion__item : groupes par origine, par UB, et bloc « Comparaison offres sur 3 crops ».',
  `${section('Par origine', demo(pick.accOrigine, { rules: 'ecrans', block: true }))}
   ${section('Par UB', demo(pick.accUB, { block: true }))}
   ${section('Comparaison', demo(pick.accComparaison, { block: true }))}`);
comp('drawer', 'Drawer de filtres', 'chakra-modal__content css-15u2225 sur chakra-modal__overlay.',
  `${section('Panneau', demo(pick.drawer, { rules: 'ecrans', block: true, grey: true, wrap: 'min-height:640px' }))}
   ${section('Overlay', demo(pick.overlay, { block: true, wrap: 'height:80px;position:relative' }))}`);
comp('barre-de-filtres', 'Barre de filtres', 'Recherche + selects + case + bouton Filtres, avec les flèches de défilement sur les barres longues.',
  `${section('Références', demo(pick.filterbarRefs, { rules: 'ecrans', block: true }))}
   ${section('Contrats', demo(pick.filterbarContrats, { block: true }))}`);
comp('coquille', 'Coquille & en-tête', 'Rail de navigation (aside css-1dn00vq) et en-têtes de page.',
  `${section('Rail', demo(pick.rail, { rules: 'ecrans', block: true, wrap: 'min-height:640px' }))}
   ${section('En-tête de liste', demo(pick.pagehead, { block: true, grey: true }))}
   ${section('En-tête de page de création', demo(pick.pageheadForm, { block: true, grey: true }))}`);
comp('etat-vide', 'État vide', 'chakra-stack css-1q63qd : « Aucune région trouvée ».', `${section('Vide', demo(pick.emptyState, { block: true }))}`);
comp('lien', 'Lien', 'chakra-link : item de menu (Impact) et lien-bouton (export du glossaire).', `${section('Liens', demo([pick.linkMenu, pick.linkBtn]))}`);
for (const [id, t] of [['toast','Toast'],['modal','Modal de confirmation'],['tooltip','Tooltip'],['switch','Switch'],['skeleton','Skeleton'],['date-picker','Date picker'],['kanban','Kanban'],['stepper','Stepper'],['breadcrumbs','Breadcrumbs'],['upload','Import de fichier'],['number-input','Number input'],['popover','Popover']]) {
  comp(id, t, 'Composant Chakra non rencontré dans les écrans parcourus.', `<div class="empty-page"><span class="display">Soon</span><p>Dès qu’un écran d’Orica le montre, il sera relevé avec son HTML et ses règles.</p></div>`, true);
}

const CHANGELOG_DEFAULT = [
  { date: '2026-11-05', version: 'v1.0', title: 'Relevé ISO', modified: [`Toute la documentation est reconstruite à partir du code servi : ${Object.keys(T).length} variables du thème Chakra, ${Object.keys(D.rulesByClass).length} classes Emotion avec leurs états, ${Object.keys(D.icons).length} icônes SVG, ${Object.keys(S).length} échantillons HTML sur ${D.screens.length} écrans. Les versions réécrites (v0.1) sont retirées.`], added: ['Fondations : Icônes. Composants : Segmented control, Menu déroulant, Heading & divider, Lien. Écrans : Panneau Filtres.'], removed: ['Chips de choix (c’étaient des chakra-button), Progression (c’est une barre empilée dans la carte KPI), Toggle vue (non relevé dans Orica).'] },
  { date: '2026-11-04', version: 'v0.1', title: 'Relevé visuel', added: ['Première version, composants réécrits à partir des styles calculés et de captures. Remplacée par la v1.0.'] },
];
let CHANGELOG = CHANGELOG_DEFAULT;
try { const j = JSON.parse(fs.readFileSync(path.join(OUT, 'changelog.json'), 'utf8')); if (Array.isArray(j) && j.length) { CHANGELOG = j; SRC.changelog = true; } } catch (e) { }
const fmtDate = d => { const [y, m, dd] = d.split('-'); return `${+dd} ${['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'][+m - 1]} ${y}`; };
const clList = (label, items, first) => items && items.length ? `<p class="label" style="margin:${first ? '0 0 6px' : '12px 0 6px'}">${label}</p><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '';
page('changelog', 'Suivi', 'Changelog', 'Ajouts, modifications et suppressions, par version. Source : changelog.json.', `${section('Historique', `<div class="changelog">
${CHANGELOG.map(e => { let first = true; const part = (l, it) => { const h = clList(l, it, first); if (h) first = false; return h; }; return `  <div><time datetime="${esc(e.date)}">${esc(fmtDate(e.date))}</time><div><h3>${esc(e.version)} · ${esc(e.title)}</h3>${part('Ajouté', e.added)}${part('Modifié', e.modified)}${part('Supprimé', e.removed)}</div></div>`; }).join('\n')}
</div>`)}`, false, true);

page('mcp', 'Outils', 'MCP', 'Les fichiers à donner à une IA ou à un futur serveur MCP : tokens, CSS des composants, icônes, règles.', `${section('Structure des fichiers', `<pre class="filetree">orica-design-system/
├── AGENTS.md           <span class="muted">← règles assemblées</span>
├── tokens.css          <span class="muted">← ${Object.keys(T).length} variables --chakra-* (:root)</span>
├── base.css            <span class="muted">← reset Chakra + @font-face + keyframes servis</span>
├── components.css      <span class="muted">← ${Object.keys(D.rulesByClass).length} classes Emotion avec leurs états</span>
├── icons.svg           <span class="muted">← ${Object.keys(D.icons).length} symboles</span>
├── samples/            <span class="muted">← HTML servi de chaque composant (${Object.keys(S).length} fichiers)</span>
└── rules/
${Object.keys(RULES).map((k, i, a) => `    ${i === a.length - 1 ? '└──' : '├──'} ${k}.md`).join('\n')}</pre>
<div class="bundle-actions"><button class="copy-btn" style="position:static" type="button" id="copyAgents">Copier AGENTS.md</button><button class="copy-btn" style="position:static" type="button" id="copyTokens">Copier tokens.css</button><button class="copy-btn" style="position:static" type="button" id="copyCss">Copier components.css</button></div>`)}
${section('AGENTS.md', `<div class="demo is-open"><div class="demo-code" style="border-top:0"><div class="demo-tabs"><span class="demo-file">AGENTS.md</span></div><div class="codewrap"><button class="copy-btn copy" type="button">Copier</button><pre><code id="agentsCode">${esc(agentsMd())}</code></pre></div></div></div>`)}`, false, true);
function agentsMd() {
  return `# Orica (Belco Hub) — règles pour les IA

Source : hub.belco-sandbox.synako.fr, module Orica, relevé ISO le 5 novembre 2026 (code servi, pas de réécriture).
Stack : React + Chakra UI v2 + Emotion. Tokens : variables CSS --chakra-* (tokens.css). Composants : classes chakra-* + classes Emotion .css-xxxx (components.css).
Fonte : CentraNo2 (400/500/700/800 servies). Fond de page gray-100 #f8f9fa, texte dark-500 #232930, accent primary-500 = orica-500 #127746.
Non relevés (ne pas produire sans capture) : toast, modal de confirmation, tooltip, switch, skeleton, date picker, kanban, stepper, breadcrumbs, import de fichier, number input, popover.

## Comment produire une interface Orica
1. Utiliser les composants Chakra du Hub (<Button>, <Tabs>, <Select>, <Input>, <Checkbox>, <Radio>, <Menu>, <Avatar>, <Table>, <Accordion>, <Drawer>) avec les variantes du thème : les classes Emotion de components.css sont générées par ce thème, ne pas les recopier à la main dans un autre projet.
2. Pour un prototype HTML statique, charger tokens.css + base.css + components.css et réutiliser le HTML de samples/ tel quel.
3. Ne jamais écrire une couleur, un rayon ou une taille en dur : var(--chakra-colors-…), var(--chakra-radii-md), var(--chakra-sizes-10).

## Sommaire
${Object.keys(RULES).map(k => `- rules/${k}.md`).join('\n')}

---
` + Object.values(RULES).join('\n\n---\n\n') + '\n';
}

/* ------------------------------------------------------------------ assemblage HTML */
const NAV = [
  { group: 'Fondations', home: 'introduction', items: PAGES.filter(p => p.group === 'Fondations') },
  { group: 'Écrans Orica', home: 'ecran-references', items: PAGES.filter(p => p.group === 'Écrans Orica') },
  { group: 'Composants', home: 'composants', items: PAGES.filter(p => p.group === 'Composants') },
];
const { buildAudit } = require('./audit-build.js');
const { AUDIT, APP_SCREENS } = buildAudit({ D, pick, g, renderable, COMP });
const shellCss = fs.readFileSync(path.join(DIR, 'shell.css'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'audit.css'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'chat.css'), 'utf8');
const belcoLogo = fs.readFileSync(path.join(DIR, 'belco-logo.svg'), 'utf8');
const pagesJson = JSON.stringify(PAGES.map(p => ({ id: p.id, group: p.group, title: p.title, lede: p.lede, body: p.body, soon: !!p.soon, nopager: p.group === 'Suivi' || p.group === 'Outils' })));
const compJson = JSON.stringify(COMP);
const html = `<title>Orica Design System</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap">
<style>
${shellCss}
</style>
<style id="prodFonts">${fontFaceCss}</style>
<script type="text/plain" id="prodShared">${sharedCss.replace(/<\/script/g, '<\\/script')}</script>
<script type="text/plain" id="prodComponents">${allComponentCss.replace(/<\/script/g, '<\\/script')}</script>
<div class="shell">
  <nav class="sidebar" id="sidebar" aria-label="Navigation de la documentation">
    <a class="brand" href="#introduction" id="brand">${belcoLogo}<span>Orica<small>Belco Hub · Design System · ISO</small></span></a>
    <div id="nav"></div>
  </nav>
  <div class="scrim" id="scrim"></div>
  <div class="content">
    <header class="topbar">
      <button class="menu-btn" id="menuBtn" type="button" aria-label="Ouvrir la navigation"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <label class="o-search" for="q"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Chercher un composant, une classe css-…" autocomplete="off"><span class="kbd">⌘K</span></label>
      <nav class="topnav" id="topnav" aria-label="Sections"><a href="#introduction" data-top="ds">Design System</a><a href="#changelog" data-top="changelog">Changelog</a><a href="#mcp" data-top="mcp">MCP</a></nav>
      <button class="chat-btn-top" id="chatBtn" type="button" title="Chat : questions et propositions d’évolution (pull requests)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z"/></svg>Chat</button>
      <button class="play-btn" id="playBtn" type="button" title="Mode audit : composants scorés et navigateur d’écrans"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>Play</button>
    </header>
    <main class="page" id="page"></main>
  </div>
</div>
<script>
const PAGES = ${pagesJson};
const COMP = ${compJson};
const NAV = ${JSON.stringify(NAV.map(n => ({ group: n.group, home: n.home, items: n.items.map(i => ({ id: i.id, label: i.id === 'introduction' ? 'Introduction' : i.title, soon: !!i.soon })) })))};
const TOKENS_CSS = ${JSON.stringify(tokensCss)};
const COMPONENTS_CSS = document.getElementById('prodComponents').textContent;
const SHARED_CSS = document.getElementById('prodShared').textContent;
const AGENTS = ${JSON.stringify(agentsMd())};
const AUDIT = ${JSON.stringify(AUDIT)};
const RULES_MD = ${JSON.stringify(RULES)};
const CHAT_ENABLED = false; // true sur la version GitHub Pages (les appels API directs sont bloqués dans l’artefact)
const APP_SCREENS = ${JSON.stringify(APP_SCREENS).replace(/<\/script/g, '<\\/script')};
${fs.readFileSync(path.join(DIR, 'shell.js'), 'utf8')}
${fs.readFileSync(path.join(DIR, 'audit.js'), 'utf8')}
${fs.readFileSync(path.join(DIR, 'chat.js'), 'utf8')}
</script>
`;
fs.writeFileSync(path.join(DIR, 'orica-iso.html'), html);
// bundle files → OUT (sources conservées : tokens.css, rules/*.md, changelog.json sont réécrits à l’identique ou créés s’ils manquent)
const out = OUT; fs.mkdirSync(path.join(out, 'rules'), { recursive: true }); fs.rmSync(path.join(out, 'samples'), { recursive: true, force: true }); fs.mkdirSync(path.join(out, 'samples'), { recursive: true }); fs.mkdirSync(path.join(out, 'prototypes'), { recursive: true });
fs.writeFileSync(path.join(out, 'tokens.css'), tokensCss);
fs.writeFileSync(path.join(out, 'base.css'), fontFaceCss + '\n' + D.base.join('\n') + '\n' + D.keyframes.join('\n') + '\n');
fs.writeFileSync(path.join(out, 'components.css'), allComponentCss + '\n');
fs.writeFileSync(path.join(out, 'icons.svg'), spriteSvg());
fs.writeFileSync(path.join(out, 'AGENTS.md'), agentsMd());
if (!SRC.changelog) fs.writeFileSync(path.join(out, 'changelog.json'), JSON.stringify(CHANGELOG, null, 2) + '\n');
for (const [k, v] of Object.entries(RULES)) fs.writeFileSync(path.join(out, 'rules', k + '.md'), v + '\n');
for (const [k, s] of Object.entries(S)) fs.writeFileSync(path.join(out, 'samples', k.replace(/[^a-z0-9_-]+/gi, '_') + '.html'), `<!-- ${k} · ${s.screen} -->\n` + pretty(inlineIcons(s.html)) + '\n');
try { const proto = require('./proto-dashboard.js'); fs.writeFileSync(path.join(out, 'prototypes', 'dashboard.html'), proto.head('pages') + proto.page('pages') + proto.foot('pages')); } catch (e) { console.warn('prototype non écrit :', e.message); }
// standalone page for GitHub Pages (same content, real document skeleton, noindex)
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<style>body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>
${html.replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n/, '').replace('const CHAT_ENABLED = false;', 'const CHAT_ENABLED = true;').replace(/^([\s\S]*?<\/style>\n<style id="prodFonts">[\s\S]*?<\/style>\n)/, '$1</head>\n<body>\n')}
</body>
</html>
`);
fs.writeFileSync(path.join(out, 'tokens.css'), tokensCss);
fs.writeFileSync(path.join(out, 'base.css'), fontFaceCss + '\n' + D.base.join('\n') + '\n' + D.keyframes.join('\n') + '\n');
fs.writeFileSync(path.join(out, 'components.css'), allComponentCss + '\n');
fs.writeFileSync(path.join(out, 'icons.svg'), spriteSvg());
fs.writeFileSync(path.join(out, 'AGENTS.md'), agentsMd());
for (const [k, v] of Object.entries(RULES)) fs.writeFileSync(path.join(out, 'rules', k + '.md'), v + '\n');
for (const [k, s] of Object.entries(S)) fs.writeFileSync(path.join(out, 'samples', k.replace(/[^a-z0-9_-]+/gi, '_') + '.html'), `<!-- ${k} · ${s.screen} -->\n` + pretty(inlineIcons(s.html)) + '\n');
console.log('built', (html.length / 1024).toFixed(0), 'KB; pages', PAGES.length, '; components', COMP.length, '; audit', AUDIT.length, 'scored, screens', APP_SCREENS.length, '; out', OUT, '; sources:', SRC.tokens ? 'tokens.css' : 'tokens(json)', SRC.rules.length + ' rules.md', SRC.changelog ? 'changelog.json' : 'changelog(default)');
if (process.env.VERBOSE) console.log(AUDIT.map(a => `${a.id}: ${a.score}`).join(', '));
