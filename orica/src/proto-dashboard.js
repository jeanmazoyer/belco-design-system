// Prototype « Tableau de bord » composé uniquement avec le bundle ISO d’Orica (orica/tokens.css, base.css, components.css,
// samples/*.html). Aucune classe inventée : chaque classe vient de components.css, chaque fragment de markup d’un sample.
// Usage : node proto-dashboard.js  → écrit dashboard.html (artefact, flags en data-URI) et dashboard-pages.html (GitHub Pages, flags jsDelivr comme en prod).
const fs = require('fs'), path = require('path');
const B = process.env.ORICA_OUT || path.join(__dirname, '..'); // dossier du design system (samples/, components.css)
const S = n => fs.readFileSync(path.join(B, 'samples', n + '.html'), 'utf8');
const svgs = html => html.match(/<svg[\s\S]*?<\/svg>/g) || [];
const strip = s => s.replace(/\s*\n\s*/g, ' ').replace(/>\s+</g, '><').trim();

// --- icônes prises telles quelles dans les samples -------------------------------------------------------------
const pagehead = S('pagehead_css-0');
const ICON = {
  plus: strip(svgs(pagehead)[0]),                                   // bouton primaire « Nouvelle référence »
  bars: strip(svgs(S('kpigrid_manual'))[0]),                        // icône carte KPI « Funnel offres »
  info: strip(svgs(S('kpigrid_manual'))[1]),                        // (i) des cartes KPI
  lab: strip(svgs(S('kpi_manual'))[0]),                             // icône Qualité (Le Lab)
  search: strip(svgs(S('filterbar_contrats'))[0]),                  // loupe du champ de filtre
  chevron: strip(svgs(S('select_chakra-select__wrapper_css-1vh7n41'))[0]), // chevron du select natif
  prev: strip(svgs(S('pagination_references'))[0]),
  next: strip(svgs(S('pagination_references'))[1]),
};
const rail = strip(S('rail_css-1dn00vq').replace(/^<!--.*?-->\n/, ''));
const tr = S('tr_css-4tz101');
const rowSvgs = svgs(tr).map(strip); // [0] icône fournisseur, [1] icône second fournisseur…
const dateIcon = rowSvgs[0], shipIcon = rowSvgs[1] || rowSvgs[0];

// --- données fictives (prototype) ------------------------------------------------------------------------------
const origins = [
  { cc: 'br', name: 'Brésil', t: 412, parts: [0.62, 0.08, 0.30] },
  { cc: 'et', name: 'Éthiopie', t: 236, parts: [0.45, 0.15, 0.40] },
  { cc: 'co', name: 'Colombie', t: 198, parts: [0.70, 0.05, 0.25] },
  { cc: 'hn', name: 'Honduras', t: 164, parts: [0.38, 0.22, 0.40] },
  { cc: 'rw', name: 'Rwanda', t: 97, parts: [0.80, 0.10, 0.10] },
  { cc: 'pe', name: 'Pérou', t: 61, parts: [0.52, 0.18, 0.30] },
];
const statuts = [
  ['Reçue', 'recue', 34], ['Négociation', 'negociation', 21], ['Achat à valider', 'achat_a_valider', 9],
  ['Contrat à faire', 'contrat_a_faire', 7], ['Achetée', 'achetee', 38], ['No go', 'nogo', 9],
];
const contrats = [
  ['04/11/26', 'br', 'BRA26CAF012', 'Fazenda Santa Clara', 'Cooperativa Sul de Minas', 'FOB', 'Déc. 2026', 'Santos / Le Havre', ['3 produits', '57,60 t', '214 300 $'], ['Finalisé', 'blue-100', 'blue-800']],
  ['03/11/26', 'et', 'ETH26CAF007', 'Guji Hambela G1', 'Addis Trading Union', 'FOB', 'Jan. 2027', 'Djibouti / Anvers', ['2 produits', '19,20 t', '131 900 $'], ['En cours', 'yellow-100', 'yellow-800']],
  ['31/10/26', 'co', 'COL26CAF019', 'Huila Supremo', 'Expocafé', 'FOB', 'Nov. 2026', 'Buenaventura / Le Havre', ['4 produits', '38,40 t', '171 100 $'], ['Finalisé', 'blue-100', 'blue-800']],
  ['29/10/26', 'hn', 'HND26CAF004', 'Marcala SHG EP', 'Comsa', 'FOB', 'Fév. 2027', 'Puerto Cortés / Anvers', ['1 produit', '17,25 t', '69 800 $'], ['Brouillon', 'gray-200', 'gray-900']],
  ['27/10/26', 'rw', 'RWA26CAF002', 'Nyamasheke Lot 14', 'Rwanda Trading Co.', 'CIF', 'Mars 2027', 'Mombasa / Le Havre', ['2 produits', '12,00 t', '58 400 $'], ['En cours', 'yellow-100', 'yellow-800']],
];
const flag = (cc, mode) => mode === 'pages'
  ? `https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${cc}.svg`
  : 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#d8dee7"/><rect width="4" height="1" fill="#c5cad2"/><rect y="2" width="4" height="1" fill="#c5cad2"/></svg>');

// --- briques (classes relevées) --------------------------------------------------------------------------------
const seg = (name, items, checked) => `<div role="radiogroup" class="${name === 'univers' ? 'css-1laeaix' : 'css-1g55o27'}">
  <div aria-hidden="true" draggable="false" class="${name === 'univers' ? 'css-19sgq5y' : 'css-1cie2pn'}" data-thumb style="width:0;transform:translateX(3px)"></div>
  ${items.map((it, i) => `<label class="${i === checked ? 'css-jr8qiq' : 'css-12f4m5z'}"><input aria-label="${it}" type="radio" name="${name}" value="${it}"${i === checked ? ' checked=""' : ''} style="border:0;clip:rect(0 0 0 0);height:1px;width:1px;margin:-1px;padding:0;overflow:hidden;white-space:nowrap;position:absolute"><span${i === checked ? ' data-checked=""' : ''} aria-hidden="true" class="${name === 'univers' ? 'css-1287ah6' : 'css-1o0ooyh'}"><span class="chakra-text css-0">${it}</span></span></label>`).join('')}
</div>`;

const kpi = ({ icon, iconBox, title, value, sub, bar, legend }) => `<div class="css-qhm6ri">
  <div class="chakra-stack css-s5d1lq">
    <div class="chakra-stack css-g9cw6v"><div class="${iconBox}">${icon}</div><p class="chakra-text css-84p1k4">${title}</p><span class="css-1n6duke">${ICON.info}</span></div>
    <div class="chakra-stack css-1h3nfwc"><div class="chakra-stack css-1chfeb8"><p class="chakra-text css-1vcnt04">${value}</p>${sub ? `<p class="chakra-text css-j964ez">${sub}</p>` : ''}</div></div>
    <div class="css-dkxf9s"><div class="css-3v11dv"><div class="chakra-stack css-sm2y2r">${bar.map(([f, c]) => `<div class="css-18iytlf" style="flex:${f} 0 0px;background:var(--chakra-colors-${c})"></div>`).join('')}</div></div></div>
    <div class="chakra-stack css-1h3nfwc">${legend.map(([l, v, c]) => `<div class="chakra-stack css-nhuekp"><div class="chakra-stack css-1h0kgh1"><div class="css-whcp1a" style="background:var(--chakra-colors-${c})"></div><p class="chakra-text css-zm3ud3">${l}</p></div><p class="chakra-text css-1flgzno">${v}</p></div>`).join('')}</div>
  </div>
</div>`;

const panel = (title, body, extra = '') => `<div class="css-1ms5eys" style="padding:19px 24px">
  <div class="chakra-stack css-1h3nfwc" style="gap:var(--chakra-space-4)">
    <div class="chakra-stack css-1chfeb8"><h2 class="chakra-heading css-btg4an">${title}</h2>${extra}</div>
    ${body}
  </div>
</div>`;

const originRows = (mode) => origins.map(o => `<div class="chakra-stack css-g9cw6v" style="gap:var(--chakra-space-3)">
  <div class="css-1snwon0"><img src="${flag(o.cc, mode)}" alt="" style="display:block;width:100%;height:100%;object-fit:cover"></div>
  <p class="chakra-text css-1flgzno" style="width:96px">${o.name}</p>
  <div class="css-1d4uand"><div class="css-3v11dv"><div class="chakra-stack css-sm2y2r">${o.parts.map((f, i) => `<div class="css-18iytlf" style="flex:${f} 0 0px;background:var(--chakra-colors-${['planAchat-pipeline', 'yellow-600', 'green-500'][i]})"></div>`).join('')}</div></div></div>
  <p class="chakra-text css-j964ez" style="width:64px;text-align:right">${o.t} t</p>
</div>`).join('');

const statutRows = statuts.map(([l, k, n]) => `<div class="chakra-stack css-nhuekp">
  <div class="chakra-stack css-1h0kgh1" style="gap:var(--chakra-space-2)"><span class="css-uc9ow7" style="--badge-bg:var(--chakra-colors-statuteOffreAchat-${k});--badge-color:var(--chakra-colors-white)">${l}</span></div>
  <div class="chakra-stack css-g9cw6v" style="gap:var(--chakra-space-3);flex:1;justify-content:flex-end"><div class="css-1d4uand" style="max-width:160px"><div class="css-3v11dv"><div class="chakra-stack css-sm2y2r"><div class="css-18iytlf" style="flex:${(n / 38).toFixed(2)} 0 0px;background:var(--chakra-colors-statuteOffreAchat-${k})"></div><div class="css-18iytlf" style="flex:${(1 - n / 38).toFixed(2)} 0 0px;background:transparent"></div></div></div></div><span class="chakra-badge css-gb6hna">${n}</span></div>
</div>`).join('');

const table = (mode) => `<div class="css-1ms5eys"><div class="chakra-table__container css-1nmizk2"><table class="chakra-table css-h1zm47">
  <thead class="css-0"><tr class="css-2u3ppd">${['Créé le', 'Origine', 'BTB', 'Désignation', 'Fournisseur', 'Incoterm', 'Embarquement', 'POL / POD', 'Produits · Volume · Montant', 'Statut'].map(h => `<th class="css-15hkk5x">${h}</th>`).join('')}</tr></thead>
  <tbody class="css-0">${contrats.map(([d, cc, btb, des, four, inco, emb, pol, [np, vol, amt], [st, bg, fg]]) => `<tr class="css-4tz101">
    <td class="css-1htw708"><div class="css-1ez0csj"><p class="chakra-text css-epvm6">${d}</p></div></td>
    <td class="css-1ch0huz"><div class="css-1ez0csj"><div class="css-1snwon0"><img src="${flag(cc, mode)}" alt="" style="display:block;width:100%;height:100%;object-fit:cover"></div></div></td>
    <td class="css-14qd1df"><div class="css-1ez0csj"><div class="chakra-stack css-1snn0hc"><p class="chakra-text css-1vlf9fm">${btb}</p></div></div></td>
    <td class="css-mr1n2x"><div class="css-1ez0csj"><div class="chakra-stack css-8i8jvo"><p class="chakra-text css-3dyfbw">${des}</p><p class="chakra-text css-2gtw9c">Café vert · Arabica</p></div></div></td>
    <td class="css-mr1n2x"><div class="css-1ez0csj"><div class="chakra-stack css-8i8jvo"><p class="chakra-text css-2v3cuo">${four}</p></div></div></td>
    <td class="css-1htw708"><div class="css-1ez0csj"><p class="chakra-text css-epvm6">${inco}</p></div></td>
    <td class="css-1htw708"><div class="css-1ez0csj"><div class="chakra-stack css-fr839f">${dateIcon}<p class="chakra-text css-xris7m">${emb}</p></div></div></td>
    <td class="css-1htw708"><div class="css-1ez0csj"><div class="chakra-stack css-fr839f">${shipIcon}<p class="chakra-text css-xris7m">${pol}</p></div></div></td>
    <td class="css-1htw708"><div class="css-1ez0csj"><div class="chakra-stack css-g9cw6v"><span class="css-1qu1bsf" style="--badge-bg:var(--chakra-colors-gray-200);--badge-color:var(--chakra-colors-dark-500)">D</span><div class="chakra-stack css-1h3nfwc"><span class="chakra-text css-lek11n">${np} · ${vol}</span><p class="chakra-text css-1vlf9fm">${amt}</p></div></div></div></td>
    <td class="css-1htw708"><div class="css-1ez0csj"><span class="css-uc9ow7" style="--badge-bg:var(--chakra-colors-${bg});--badge-color:var(--chakra-colors-${fg})">${st}</span></div></td>
  </tr>`).join('')}</tbody>
</table></div></div>`;

const pagination = `<nav class="chakra-stack css-17769tf"><p class="chakra-text css-ebjc71">1 / 8</p><div class="chakra-stack css-11x43j">
  <button type="button" class="chakra-button css-39ivzn" aria-label="Précédent" disabled="">${ICON.prev}</button>
  <button type="button" class="chakra-button css-39ivzn" aria-label="Suivant">${ICON.next}</button></div></nav>`;

const page = (mode) => `<div class="css-12p9q9f">
  ${rail}
  <main class="css-1su2qgr">
    <div class="css-mz90sz">Prototype — données fictives · composé avec le design system Orica (relevé ISO du 5 nov. 2026)</div>
    <div class="css-0"><div class="chakra-portal"><header class="css-1gknp9i">
      <h2 class="chakra-heading css-13e5vvr">Tableau de bord</h2>
      <div class="css-19dx92s">${seg('univers', ['Café', 'Cacao'], 0)}</div>
      <div class="css-d8cwxj">
        <div class="chakra-select__wrapper css-1vh7n41"><select class="chakra-select css-mfnris" aria-label="Crop"><option>Crop 2026/2027</option><option>Crop 2025/2026</option><option>Crop 2024/2025</option></select><div class="chakra-select__icon-wrapper css-iohxn1">${ICON.chevron}</div></div>
        <button type="button" class="chakra-button css-umgg81"><span class="chakra-button__icon css-1wh2kri">${ICON.plus}</span>Nouvelle référence</button>
      </div>
    </header></div></div>
    <div class="outlet-container css-n0a32p"><div class="chakra-container css-ws0xbv">
      <div class="chakra-tabs css-13o7eu2">
        <div role="tablist" aria-orientation="horizontal" class="chakra-tabs__tablist css-1q9h0zz">${['Vue d’ensemble', 'Achats', 'Qualité', 'Logistique'].map((t, i) => `<button type="button" role="tab" tabindex="${i ? -1 : 0}" aria-selected="${i === 0}" class="chakra-tabs__tab css-1e8kyhm" data-index="${i}">${t}</button>`).join('')}</div>
        <div class="chakra-tabs__tab-panels css-8atqhb"><div role="tabpanel" class="chakra-tabs__tab-panel css-uu8pij"><div class="chakra-stack css-ojjdrs">
          <div class="chakra-stack css-1chfeb8" style="align-items:center">${seg('vue', ['Par origines', 'Par UB', 'Kanban'], 0)}<div class="chakra-input__group css-15qbqmr" data-group="true" style="max-width:320px"><div class="chakra-input__left-element css-1op0vdd">${ICON.search}</div><input name="q" placeholder="Filtrer par origine, fournisseur, BTB..." class="chakra-input css-gpd2jp" value=""></div></div>
          <div class="css-123lq1y">
            ${kpi({ icon: ICON.bars, iconBox: 'css-1ikk8b3', title: 'Volume contractualisé', value: '1 168 T.', sub: '42 contrats', bar: [[0.46, 'planAchat-pipeline'], [0.14, 'yellow-600'], [0.40, 'green-500']], legend: [['En cours', '537 T.', 'planAchat-pipeline'], ['À contractualiser', '164 T.', 'yellow-600'], ['Contractualisé', '467 T.', 'green-500']] })}
            ${kpi({ icon: ICON.bars, iconBox: 'css-1ikk8b3', title: 'Offres reçues', value: '118', sub: '+12 % vs N-1', bar: [[0.29, 'statuteOffreAchat-recue'], [0.18, 'statuteOffreAchat-negociation'], [0.45, 'statuteOffreAchat-achetee'], [0.08, 'statuteOffreAchat-nogo']], legend: [['Reçues', '34', 'statuteOffreAchat-recue'], ['En négociation', '21', 'statuteOffreAchat-negociation'], ['Achetées', '54', 'statuteOffreAchat-achetee'], ['No go', '9', 'statuteOffreAchat-nogo']] })}
            ${kpi({ icon: ICON.lab, iconBox: 'css-1ujg3mc', title: 'Qualité', value: '87,5&nbsp;%', sub: 'Taux d’analyse', bar: [[0.875, 'lab-500'], [0.125, 'lab-100']], legend: [['Analysés', '203', 'lab-500'], ['À analyser', '29', 'lab-100']] })}
            ${kpi({ icon: ICON.bars, iconBox: 'css-1ikk8b3', title: 'Fournisseurs', value: '64', sub: '9 prospects', bar: [[0.72, 'status-fournisseur-500'], [0.14, 'status-prospect-500'], [0.14, 'status-inactif-500']], legend: [['Actifs', '64', 'status-fournisseur-500'], ['Prospects', '9', 'status-prospect-500'], ['Inactifs', '12', 'status-inactif-500']] })}
          </div>
          <div class="css-123lq1y" style="grid-template-columns:3fr 2fr">
            ${panel('Volumes par origine', `<div class="chakra-stack css-1h3nfwc" style="gap:var(--chakra-space-3)">${originRows(mode)}</div>`, `<div class="chakra-stack css-g9cw6v" style="gap:var(--chakra-space-3)">${[['En cours', 'planAchat-pipeline'], ['À contractualiser', 'yellow-600'], ['Contractualisé', 'green-500']].map(([l, c]) => `<div class="chakra-stack css-1h0kgh1"><div class="css-whcp1a" style="background:var(--chakra-colors-${c})"></div><p class="chakra-text css-zm3ud3">${l}</p></div>`).join('')}</div>`)}
            ${panel('Offres par statut', `<div class="chakra-stack css-1h3nfwc" style="gap:var(--chakra-space-3)">${statutRows}</div>`, `<span class="chakra-badge css-li4vr2">118</span>`)}
          </div>
          <div class="chakra-stack css-1chfeb8" style="align-items:center"><h2 class="chakra-heading css-btg4an">Derniers contrats d’achat</h2><button type="button" class="chakra-button css-dvj57b">Voir tous les contrats</button></div>
          ${table(mode)}
          ${pagination}
        </div></div></div>
      </div>
    </div></div>
  </main>
</div>
<script>
// Les segmented controls de prod déplacent un « thumb » absolu sous l’option cochée ; même mécanique, en 12 lignes.
document.querySelectorAll('[role=radiogroup]').forEach(g => {
  const thumb = g.querySelector('[data-thumb]');
  const place = () => { const l = g.querySelector('input:checked')?.closest('label'); if (!l || !thumb) return; thumb.style.width = l.offsetWidth + 'px'; thumb.style.transform = 'translateX(' + (l.offsetLeft) + 'px)'; };
  g.querySelectorAll('input').forEach(i => i.addEventListener('change', () => { g.querySelectorAll('label').forEach(l => l.className = l.contains(i) ? 'css-jr8qiq' : 'css-12f4m5z'); g.querySelectorAll('label > span').forEach(s => s.toggleAttribute('data-checked', s.closest('label').contains(i))); place(); }));
  requestAnimationFrame(place); setTimeout(place, 400);
});
document.querySelectorAll('[role=tab]').forEach(t => t.addEventListener('click', () => { t.parentElement.querySelectorAll('[role=tab]').forEach(o => o.setAttribute('aria-selected', o === t)); }));
document.querySelector('form')?.addEventListener('submit', e => e.preventDefault());
</script>`;

const head = (mode) => mode === 'pages'
  ? `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Tableau de bord — prototype Orica</title>
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../base.css">
<link rel="stylesheet" href="../components.css">
</head>
<body>
`
  : `<title>Orica Dashboard Prototype</title>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
`;
const foot = (mode) => mode === 'pages' ? '\n</body>\n</html>\n' : '\n';
module.exports = { page, head, foot };
if (require.main !== module) return;
fs.writeFileSync(path.join(__dirname, 'dashboard.html'), head('artifact') + page('artifact') + foot('artifact'));
fs.writeFileSync(path.join(__dirname, 'dashboard-pages.html'), head('pages') + page('pages') + foot('pages'));
// vérification : toutes les classes css-* utilisées existent dans components.css
const comp = fs.readFileSync(path.join(B, 'components.css'), 'utf8');
const used = [...new Set((page('artifact').match(/css-[a-z0-9]+/g) || []))];
const missing = used.filter(c => c !== 'css-0' && !comp.includes('.' + c + ' ') && !comp.includes('.' + c + ':') && !comp.includes('.' + c + ','));
console.log('classes utilisées:', used.length, '; absentes de components.css:', missing);
