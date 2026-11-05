// Mode « Play » : audit UI. Calcule, à partir du CSS relevé, un score de fidélité par composant, et recompose les écrans
// d'Orica (rail + en-tête + contenu servi) pour le navigateur de droite. Rien n'est noté à la main : chaque sous-score
// est dérivé des règles Emotion des classes présentes dans les échantillons du composant.
const fs = require('fs'), path = require('path');

function buildAudit({ D, pick, g, renderable, COMP }) {
  const S = D.samples;
  const cmp = (id, fam, samples, o = {}) => ({ id, fam, samples: samples.map(g).filter(Boolean), interactive: !!o.interactive, selectable: !!o.selectable, note: o.note || '' });
  const DEF = [
    cmp('bouton', ['.chakra-button:not(.chakra-tabs__tab):not(.chakra-link):not(.chakra-modal__close-btn)'], [pick.btnPrimary, pick.btnPrimaryMenu, pick.btnFiltres, pick.btnReset, pick.btnSupprimer, pick.btnAppliquer, pick.btnGhost, pick.btnGhost2, pick.btnTab, pick.btnImport, pick.btnUnivers, pick.btnSoft, pick.btnSave, pick.btnOffre, pick.btnToggleAll, pick.btnAvatar, pick.btnIconPager, pick.btnIconCopy, pick.btnIconScroll, pick.btnRail, pick.btnBack, ...pick.btnRowIcons], { interactive: true }),
    cmp('tabs', ['.chakra-tabs__tablist'], [pick.tabsRefs, pick.tabsContrats, pick.tabsPlans], { interactive: true, selectable: true }),
    cmp('segmented', ['[role=radiogroup].css-1g55o27', '[role=radiogroup].css-1laeaix'], [pick.segmented, pick.univers], { interactive: true, selectable: true, note: 'Curseur animé par Framer Motion : sa position est figée dans le relevé.' }),
    cmp('select', ['.chakra-select__wrapper'], [pick.selectBasic, pick.selectOrigine, pick.selectFiliale, pick.selectAnnee], { interactive: true }),
    cmp('menu', ['.chakra-menu__menu-list'], [pick.menuUser, pick.menuPower, pick.menuOrigins], { interactive: true, selectable: true }),
    cmp('champ-de-recherche', ['.chakra-input__group'], [pick.search, pick.search2], { interactive: true }),
    cmp('champ-de-saisie', ['.chakra-form-control', '.chakra-textarea', '.chakra-input:not(.chakra-input__group .chakra-input)'], [pick.formlabel, pick.formlabel2, pick.inputForm, pick.inputDrawer, pick.textarea, pick.formcontrol], { interactive: true }),
    cmp('case-a-cocher', ['.chakra-checkbox', '.chakra-radio'], [pick.checkbox, pick.checkbox2, pick.checkbox3, pick.radio], { interactive: true, selectable: true }),
    cmp('badge', ['.chakra-badge', '.chakra-wrap', '.css-uc9ow7', '.css-1qu1bsf'], [...pick.badges, pick.wrapTags, pick.wrapRoles]),
    cmp('avatar', ['.chakra-avatar'], [pick.avatarUser, pick.avatarFlag]),
    cmp('heading', ['.chakra-heading', '.chakra-divider'], [pick.headingPage, pick.headingDrawer, pick.headingOrigine, ...pick.dividers]),
    cmp('tableau', ['.chakra-table__container'], [pick.tablewrap, pick.tablewrapContrats, pick.trContrat, pick.trFourn, pick.thead]),
    cmp('ligne-de-reference', ['.css-2g5t7v'], [pick.refrow], { interactive: true }),
    cmp('pagination', ['nav.css-17769tf'], [pick.pagination, pick.paginationRefs], { interactive: true }),
    cmp('carte-kpi', ['.css-qhm6ri'], [pick.kpi, pick.kpigrid]),
    cmp('accordeon', ['.chakra-accordion__item'], [pick.accOrigine, pick.accUB, pick.accComparaison], { interactive: true, selectable: true }),
    cmp('drawer', ['.chakra-modal__content'], [pick.drawer, pick.overlay]),
    cmp('barre-de-filtres', ['.css-1eyptcq'], [pick.filterbarRefs, pick.filterbarContrats]),
    cmp('coquille', ['aside.css-1dn00vq', 'header.css-1gknp9i'], [pick.rail, pick.pagehead, pick.pageheadForm], { interactive: true }),
    cmp('etat-vide', ['.chakra-stack.css-1q63qd'], [pick.emptyState]),
    cmp('lien', ['.chakra-link'], [pick.linkMenu, pick.linkBtn], { interactive: true }),
  ];

  /* ---- analyse des règles ---- */
  const THEMEABLE = /^(color|background|background-color|border(-(top|right|bottom|left|inline|block)(-(start|end))?)?(-color)?|outline-color|fill|stroke|box-shadow|border-radius|border-(top|bottom)-(left|right)-radius|border-(start|end)-(start|end)-radius|font-size|font-weight|font-family|letter-spacing|line-height|padding(-[a-z-]+)?|margin(-[a-z-]+)?|gap|row-gap|column-gap|width|height|min-width|min-height|max-width|max-height|--[a-z-]+)$/;
  const NEUTRAL = /^(inherit|initial|unset|revert|transparent|currentcolor|none|auto|0|0px|1px|100%|normal|fit-content|max-content|min-content|\d+%|1|0\.\d+|bold|normal|solid|hidden|visible|\d+(\.\d+)?em)$/i;
  const HARD = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b\d*\.?\d+(px|rem|em|vh|vw|ch)\b/i;
  function analyse(rules) {
    let tok = 0, hard = 0; const hardList = {};
    const states = { hover: false, focus: false, active: false, disabled: false, selected: false };
    for (const r of rules) {
      const sel = r.slice(0, r.indexOf('{'));
      if (/:hover/.test(sel)) states.hover = true;
      if (/:focus/.test(sel)) states.focus = true;
      if (/:active|\[data-active\]/.test(sel)) states.active = true;
      if (/:disabled|\[disabled\]|\[aria-disabled="?true"?\]|\[data-disabled\]/.test(sel)) states.disabled = true;
      if (/\[aria-selected="?true"?\]|\[data-checked\]|\[aria-expanded="?true"?\]|\[aria-checked="?true"?\]|\.active\b|\[data-selected\]/.test(sel)) states.selected = true;
      const body = r.slice(r.indexOf('{') + 1, r.lastIndexOf('}'));
      for (const decl of body.split(';')) {
        const i = decl.indexOf(':'); if (i < 0) continue;
        const prop = decl.slice(0, i).trim(), val = decl.slice(i + 1).trim();
        if (!THEMEABLE.test(prop)) continue;
        if (/var\(--/.test(val)) { tok++; continue; }
        if (NEUTRAL.test(val)) { tok++; continue; }
        if (HARD.test(val)) { hard++; const k = prop + ': ' + val; hardList[k] = (hardList[k] || 0) + 1; continue; }
        tok++;
      }
    }
    return { tok, hard, hardList, states };
  }
  const uniq = a => [...new Set(a)];
  const AUDIT = DEF.map(c => {
    const classes = uniq(c.samples.flatMap(s => s.classes || []));
    const rules = uniq(classes.flatMap(k => D.rulesByClass[k] || []));
    const a = analyse(rules);
    const tokensPct = a.tok + a.hard ? Math.round(100 * a.tok / (a.tok + a.hard)) : 100;
    const expected = c.interactive ? (c.selectable ? ['hover', 'focus', 'active', 'disabled', 'selected'] : ['hover', 'focus', 'active', 'disabled']) : [];
    const found = expected.filter(k => a.states[k]);
    const statesPct = expected.length ? Math.round(100 * found.length / expected.length) : null;
    const variants = uniq(c.samples.map(s => s.sig)).length;
    const consistency = variants <= 3 ? 100 : Math.max(40, 100 - (variants - 3) * 4);
    const notes = []; const penalties = [];
    if (c.samples.some(s => /<img[^>]+src="https?:/.test(s.html))) penalties.push('Images externes (drapeaux, sceaux) remplacées dans l’aperçu');
    if (c.samples.some(s => /éléments identiques/.test(s.html))) notes.push('Listes réduites à trois éléments dans le relevé');
    if (c.samples.some(s => /^<button[^>]*\sdisabled=""/.test(s.html))) notes.push('Certaines variantes relevées à l’état disabled');
    if (c.note) notes.push(c.note);
    const score = Math.max(0, Math.round((statesPct === null ? tokensPct * 0.7 + consistency * 0.3 : tokensPct * 0.5 + statesPct * 0.3 + consistency * 0.2) - penalties.length * 5));
    const meta = COMP.find(x => x.id === c.id) || {};
    return {
      id: c.id, title: meta.title || c.id, fam: c.fam, roots: uniq(c.samples.map(s => '.' + s.sig.trim().split(/\s+/).join('.'))),
      score, tokensPct, statesPct, consistency, variants, classes: classes.length, rules: rules.length, decl: a.tok + a.hard, hard: a.hard,
      hardTop: Object.entries(a.hardList).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([k, n]) => ({ k, n })),
      states: expected.map(k => ({ k, ok: a.states[k] })), notes, penalties,
      screens: uniq(c.samples.map(s => s.screen)),
    };
  });

  /* ---- écrans recomposés pour le navigateur ---- */
  const H = s => renderable(g(s));
  const rail = H(pick.rail);
  const banner = `<div class="css-mz90sz">Ceci est un environnement de démo</div>`;
  const universHtml = H(pick.univers);
  const header = (title, action) => `<div class="css-0"><div class="chakra-portal"><header class="css-1gknp9i"><h2 class="chakra-heading css-13e5vvr">${title}</h2><div class="css-19dx92s">${universHtml}</div>${action ? `<div class="css-d8cwxj">${action}</div>` : ''}</header></div></div>`;
  const outlet = parts => `<div class="outlet-container css-n0a32p"><div class="chakra-container css-ws0xbv"><div class="chakra-stack css-ojjdrs">${parts.join('')}</div></div></div>`;
  const shell = (head, parts, extra = '') => `<div class="css-12p9q9f">${rail}<main class="css-1su2qgr">${banner}${head}${outlet(parts)}</main>${extra}</div>`;
  const trWrap = h => `<div class="css-1ms5eys"><div class="chakra-table__container css-1nmizk2"><table class="chakra-table css-h1zm47"><tbody class="css-0">${h}</tbody></table></div></div>`;
  const refsParts = [H(pick.tabsRefs), H(pick.filterbarRefs), H(pick.refrow), H(pick.paginationRefs)];
  const screens = [
    { route: '/orica/references/cafes', title: 'Références', real: true, html: shell(H(pick.pagehead), refsParts) },
    { route: '/orica/references/cafes?filtres', title: 'Références · panneau Filtres', real: true, html: shell(H(pick.pagehead), refsParts, H(pick.overlay) + H(pick.drawer).replace(/transform: translateX\([^)]*\)/, 'transform: translateX(0)')) },
    { route: '/orica/fournisseurs/actifs', title: 'Fournisseurs', html: shell(header('Fournisseurs', H(pick.btnPrimaryMenu)), [H(pick.btnTab), H(pick.tablewrap)]) },
    { route: '/orica/plans_achat', title: 'Plans d’achat', html: shell(header('Plans d’achat'), [H(pick.segmented), H(pick.tabsPlans), H(pick.kpigrid), H(pick.accOrigine)]) },
    { route: '/orica/contrats_achat', title: 'Contrats d’achat', html: shell(header('Contrats d’achat'), [H(pick.tabsContrats), H(pick.filterbarContrats), H(pick.tablewrapContrats), H(pick.pagination)]) },
    { route: '/orica/direct_trade', title: 'Direct Trade', html: shell(header('Direct Trade'), [`<div class="css-1ms5eys">${H(pick.trContrat)}</div>`]) },
    { route: '/orica/geographie', title: 'Géographie', html: shell(header('Géographie'), [H(pick.headingOrigine), H(pick.selectFiliale), H(pick.emptyState)]) },
    { route: '/orica/fournisseurs/ajouter', title: 'Nouveau fournisseur', real: true, html: shell(H(pick.pageheadForm), [H(pick.formcard)]) },
  ];
  // prototype composé avec le bundle
  try {
    const proto = require('./proto-dashboard.js');
    let body = proto.page('artifact').replace(/<script>[\s\S]*<\/script>/, '');
    const thumb = 'data-thumb style="width:0;transform:translateX(3px)"';
    body = body.replace(thumb, 'data-thumb style="width:55px;transform:translateX(3px)"').replace(thumb, 'data-thumb style="width:100px;transform:translateX(3px)"');
    screens.push({ route: '/orica/prototypes/dashboard', title: 'Tableau de bord (prototype)', proto: true, html: body });
  } catch (e) { console.warn('prototype non inclus :', e.message); }
  return { AUDIT, APP_SCREENS: screens };
}
module.exports = { buildAudit };
