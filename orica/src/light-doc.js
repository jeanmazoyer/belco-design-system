// Édition designers : une documentation plus légère, limitée aux composants réellement présents sur les écrans d’Orica,
// rendus avec le CSS servi (ISO), sans code ni classes. Même shell, pas de mode Play, pas de chat, pas de MCP.
const fs = require('fs'), path = require('path');

const VARIANT_FR = { solid: 'plein', outline: 'contour', ghost: 'texte', clear: 'texte', inverted: 'inversé', link: 'lien', unstyled: 'nu', base: 'standard', filled: 'rempli', flushed: 'souligné', subtle: 'discret', simple: 'simple', striped: 'rayé', card: 'carte', line: 'souligné', button: 'bouton', default: 'standard', module: 'module', panel: 'panneau', border: 'bordure', text: 'texte' };
const SCHEME_FR = { primary: 'primaire', brand: 'marque', gray: 'gris', darkGray: 'gris foncé', white: 'blanc', dark: 'noir', sand: 'sable', lightGreen: 'vert clair', darkGreen: 'vert foncé', kaki: 'kaki', green: 'vert', red: 'rouge', blue: 'bleu', cacao: 'cacao' };
const SIZE_FR = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL', '2xs': 'XXS', '2xl': 'XXL', full: 'plein' };

function buildLight(ctx) {
  const { D, S, pick, g, renderable, inlineIcons, esc, section, T, DS, SCREENS, CHANGELOG, fmtDate, spriteSvg, shellCss, lightCss, belcoLogo, fontFaceCss, sharedCss, allComponentCss, tokensCss, shellJs, DIR, OUT } = ctx;
  const prodNames = (DS && DS.prodNames) || {};
  const screenTitle = url => { const s = SCREENS.find(x => x[2] === url || (url || '').startsWith(x[2].split('?')[0])); return s ? s[1] : (url || '').replace('/orica/', ''); };
  let demoId = 0;

  /* nom DS d’un échantillon (classe racine → props de la matrice) */
  function dsName(sample) {
    const cls = (sample.sig.match(/css-[a-z0-9]+/g) || []); for (const c of cls) { const n = prodNames[c]; if (n) { const p = n.props; const parts = [n.component]; if (p.variant) parts.push(p.variant); if (p.size) parts.push(p.size); if (p.colorScheme) parts.push(p.colorScheme); return { label: parts.join(' · '), exact: n.exact, fr: [p.variant && VARIANT_FR[p.variant], p.size && SIZE_FR[p.size], p.colorScheme && SCHEME_FR[p.colorScheme]].filter(Boolean).join(' · ') }; } } return null;
  }
  /* carte d’aperçu : un échantillon, une légende */
  function card(sample, label, opts = {}) {
    const s = g(sample); if (!s) return '';
    const n = dsName(s);
    const id = 'l' + (++demoId);
    return `<figure class="vcard${opts.block ? ' is-block' : ''}${opts.grey ? ' is-grey' : ''}" data-demo="${id}"><div class="vcard-preview${opts.block ? ' is-block' : ''}" data-shadow-host style="${esc(opts.wrap || '')}"></div><template data-shadow>${renderable(s)}</template><figcaption><b>${esc(label)}</b>${n ? `<span class="dsname" title="${n.exact ? 'Exactement ce composant du Design System Hub' : 'Correspondance approchée avec ce composant du Design System Hub'}">${n.exact ? '' : '≈ '}DS : ${esc(n.label)}</span>` : ''}</figcaption></figure>`;
  }
  const grid = (items, opts = {}) => `<div class="vgrid${opts.block ? ' is-block' : ''}">${items.map(([smp, label, o]) => card(smp, label, Object.assign({}, opts, o || {}))).join('')}</div>`;
  /* bande d’états : le même élément avec les attributs d’état que le CSS servi stylise (data-hover, data-active, data-focus-visible, disabled…) */
  function states(sample, kind) {
    const s = g(sample); if (!s) return '';
    const html = renderable(s);
    const inject = (h, attr, target) => { if (!attr) return h; if (target === 'input') return h.replace(/<input\s/, `<input ${attr} `); if (target === 'select') return h.replace(/<select\s/, `<select ${attr} `); if (target === 'control') return h.replace(/(<span[^>]*chakra-(checkbox|radio)__control[^>]*)/, `$1 ${attr}`).replace(/(<input[^>]*class="chakra-(checkbox|radio)__input[^"]*")/, `$1 ${attr.startsWith('data-checked') ? 'checked' : ''}`); if (target === 'tab') return h.replace(/<(a|button)([^>]*role="tab"[^>]*)>/, (m, t, a) => `<${t}${a.replace(/aria-selected="[^"]*"/, '')} ${attr}>`); return h.replace(/^<([a-z]+)/, `<$1 ${attr}`); };
    const KINDS = {
      button: [['Repos', ''], ['Survol', 'data-hover'], ['Clic', 'data-active'], ['Focus clavier', 'data-focus-visible'], ['Désactivé', 'disabled']],
      input: [['Repos', '', 'input'], ['Survol', 'data-hover', 'input'], ['Focus', 'data-focus-visible', 'input'], ['Erreur', 'aria-invalid="true"', 'input'], ['Désactivé', 'disabled', 'input']],
      select: [['Repos', '', 'select'], ['Survol', 'data-hover', 'select'], ['Focus', 'data-focus-visible', 'select'], ['Désactivé', 'disabled', 'select']],
      control: [['Décoché', '', 'control'], ['Coché', 'data-checked', 'control'], ['Coché, survol', 'data-checked data-hover', 'control'], ['Désactivé', 'data-disabled', 'control']],
      tab: [['Repos', '', 'tab'], ['Survol', 'data-hover', 'tab'], ['Sélectionné', 'aria-selected="true"', 'tab'], ['Désactivé', 'disabled', 'tab']],
      link: [['Repos', ''], ['Survol', 'data-hover'], ['Focus clavier', 'data-focus-visible']],
    };
    const list = KINDS[kind] || KINDS.button;
    const cap = n => `<span style="font:600 10px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#777a7f;display:block;margin-bottom:8px">${esc(n)}</span>`;
    const inner = list.map(([name, attr, target]) => `<div style="display:flex;flex-direction:column;align-items:flex-start;min-width:120px">${cap(name)}${inject(html, attr, target || 'root')}</div>`).join('');
    const id = 'l' + (++demoId);
    return `<figure class="vcard is-states" data-demo="${id}"><div class="vcard-preview" data-shadow-host style="gap:28px;align-items:flex-start"></div><template data-shadow>${inner}</template><figcaption><b>États</b><span class="muted">rendus avec les règles d’état du CSS servi</span></figcaption></figure>`;
  }
  const usage = items => `<ul class="usage">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const seen = samples => { const urls = [...new Set(samples.map(g).filter(Boolean).map(s => s.screen))]; return urls.length ? `<p class="seen"><span class="label">Où on le voit</span>${urls.map(u => { const sc = SCREENS.find(x => x[2] === u); return sc ? `<a href="#${sc[0]}">${esc(sc[1])}</a>` : `<span>${esc(screenTitle(u))}</span>`; }).join('')}</p>` : ''; };
  const flat = x => (Array.isArray(x) ? x : [x]);

  /* ------------------------------------------------------------- pages */
  const PAGES = [];
  const page = (id, group, title, lede, body) => PAGES.push({ id, group, title, lede, body });
  const COMP = [];
  const comp = (id, title, lede, body, samplesForSeen) => { COMP.push({ id, title }); page(id, 'Composants', title, lede, body + (samplesForSeen ? seen(samplesForSeen) : '')); };

  page('introduction', 'Fondations', 'Orica, pour les designers',
    'Les composants d’Orica tels qu’ils sont à l’écran, et seulement ceux-là. Rien n’est dessiné à la main : chaque aperçu est l’interface réelle, rendue avec ses propres styles. Les noms entre parenthèses sont ceux du Design System Hub, pour parler le même langage que les développeurs.',
    `<div class="bento">
      <a href="#couleurs"><div class="bento-preview"><div class="bars">${['dark-500','gray-700','gray-300','primary-500','primary-100','green-900','sand-500','terroir-500','label-500'].map(k => `<i style="background:${T['--chakra-colors-'+k]}"></i>`).join('')}</div></div><h3>Couleurs</h3><p>La palette Orica, par usage : texte, fonds, accent, statuts, qualités.</p></a>
      <a href="#composants"><div class="bento-preview is-shadow" data-shadow-host></div><template data-shadow>${inlineIcons(g(pick.btnPrimary).html)} ${inlineIcons(g(pick.tabsPlans).html)}</template><h3>Composants</h3><p>${COMPONENTS.length} composants réellement utilisés, avec leurs variantes et leurs états.</p></a>
      <a href="#ecran-references"><div class="bento-preview is-shadow" data-shadow-host style="align-items:flex-start"></div><template data-shadow>${inlineIcons(g(pick.pagehead).html)}</template><h3>Écrans</h3><p>Les ${SCREENS.length} écrans d’Orica, pour voir les composants en situation.</p></a>
      <a href="#typographie"><div class="bento-preview"><div style="display:flex;flex-direction:column;gap:6px;align-items:center;font-family:CentraNo2,system-ui,sans-serif"><span style="font-size:25px;font-weight:700;line-height:1.2">CentraNo2</span><span style="font-size:13px;color:#777a7f">13 px de base · 4 graisses</span></div></div><h3>Typographie</h3><p>Une seule famille, une échelle courte.</p></a>
    </div>
    ${section('Comment lire cette doc', `<p>Chaque composant montre ses variantes (les cas réellement rencontrés sur les écrans), ses états (repos, survol, clic, focus, désactivé) et quelques règles d’usage observées. Les aperçus sont vivants : on peut les survoler. Pour le code, le CSS, l’audit et le chat de propositions, voir la <a href="../">version complète</a>.</p>`)}`);

  page('couleurs', 'Fondations', 'Couleurs', 'La palette d’Orica, par usage. Les valeurs sont celles de l’interface.',
    `${section('Accent et marque', `<div class="sw-row">${[['primary-500', 'Accent Orica : boutons primaires, onglet actif, liens'], ['primary-700', 'Accent foncé : fin du dégradé des boutons'], ['primary-100', 'Accent clair : fonds discrets'], ['primary-50', 'Accent très clair : survols, fonds de sélection'], ['green-900', 'Vert forêt Belco'], ['sand-500', 'Sable Belco']].map(([k, u]) => swatch(k, u)).join('')}</div>`, 'Le bouton primaire est un dégradé du 600 au 400, qui passe au 700 → 500 au survol.')}
    ${section('Texte et fonds', `<div class="sw-row">${[['dark-500', 'Texte courant et titres'], ['dark-400', 'Texte secondaire'], ['gray-700', 'Texte atténué, placeholders'], ['gray-100', 'Fond de page'], ['white', 'Fond des cartes, champs, tableaux'], ['gray-200', 'Filets, séparateurs, boutons secondaires'], ['gray-300', 'Filets plus marqués (onglets)'], ['gray-500', 'Bordures de champs au survol']].map(([k, u]) => swatch(k, u)).join('')}</div>`)}
    ${section('Statuts', `<div class="sw-row">${[['success-500', 'Succès'], ['warning-500', 'Avertissement (fond)'], ['error-500', 'Erreur, obligatoire, se déconnecter'], ['status-prospect-500', 'Prospect'], ['status-fournisseur-500', 'Fournisseur'], ['status-inactif-500', 'Inactif'], ['statuteOffreAchat-recue', 'Offre reçue'], ['statuteOffreAchat-negociation', 'Offre en négociation'], ['statuteOffreAchat-achetee', 'Offre achetée'], ['statuteOffreAchat-nogo', 'Offre no go']].map(([k, u]) => swatch(k, u)).join('')}</div>`, 'Chaque statut a une version claire (100) pour les fonds de badge et une version pleine (500) pour le texte ou la pastille.')}
    ${section('Qualités de café', `<div class="sw-row">${[['terroir-500', 'Terroir'], ['label-500', 'Label'], ['labelplus-500', 'Label +'], ['estate-500', 'Estate'], ['microlot-500', 'Microlot'], ['prestige-500', 'Prestige'], ['classic-500', 'Classic'], ['blend-500', 'Blend']].map(([k, u]) => swatch(k, u)).join('')}</div>`, 'Les tags de qualité des références utilisent la version claire en fond et la version pleine en texte.')}`);

  page('typographie', 'Fondations', 'Typographie', 'Une seule famille, CentraNo2, et une échelle courte.',
    `${section('Échelle', `<div class="type-scale">${[['5xl', 'Grand chiffre (valeur d’une carte KPI)'], ['4xl', 'Titre de page'], ['3xl', '—'], ['2xl', 'Titre de groupe'], ['xl', 'Titre de section, nom en gras'], ['lg', 'Boutons, onglets, libellés'], ['md', 'Texte courant (défaut)'], ['sm', 'Texte secondaire, compteurs'], ['xs', 'Mentions, badges']].map(([k, u]) => `<div class="type-row"><div class="meta"><b>${T['--chakra-fontSizes-'+k]}</b><small>${esc(u)}</small></div><div class="spec" style="font-family:CentraNo2,system-ui,sans-serif;font-size:${T['--chakra-fontSizes-'+k]};line-height:1.3">Sourcing et importation de cafés verts</div></div>`).join('')}</div>`)}
    ${section('Graisses', `<div class="type-scale">${[['Book', 400, 'Texte courant'], ['Medium', 500, 'Boutons, onglets, noms'], ['Semibold', 600, 'Libellés de formulaire (interpolé : aucune fonte 600 n’est servie)'], ['Bold', 700, 'Titres, valeurs'], ['Extrabold', 800, 'Grands chiffres']].map(([k, w, u]) => `<div class="type-row"><div class="meta"><b>${k} ${w}</b><small>${esc(u)}</small></div><div class="spec" style="font-family:CentraNo2,system-ui,sans-serif;font-size:18px;font-weight:${w}">Entre 150 et 300 cafés disponibles toute l’année</div></div>`).join('')}</div>`, 'Les fichiers de fonte sont sous licence : cette page affiche CentraNo2 si elle est installée sur ton poste, sinon la police système.')}`);

  page('matieres', 'Fondations', 'Matières', 'Rayons, ombres et espacements, tels qu’on les voit.',
    `${section('Rayons', `<div class="preset-grid">${[['sm', 'Cases à cocher, petits éléments'], ['md', 'Boutons, champs, selects'], ['xl', 'Cartes'], ['full', 'Avatars, pastilles, badges']].map(([k, u]) => `<div class="preset"><div class="box" style="background:#fff;border:1px solid ${T['--chakra-colors-gray-300']};border-radius:${T['--chakra-radii-'+k]}"></div><b>${/rem/.test(T['--chakra-radii-'+k]) ? Math.round(parseFloat(T['--chakra-radii-'+k])*13) + ' px' : 'plein'}</b><small>${esc(u)}</small></div>`).join('')}</div>`)}
    ${section('Ombres', `<div class="preset-grid">${[['xs', 'Cartes posées (KPI)'], ['sm', 'Menus, barres flottantes'], ['md', 'Panneaux'], ['lg', 'Drawer de filtres']].map(([k, u]) => `<div class="preset"><div class="box" style="background:#fff;border-radius:${T['--chakra-radii-md']};box-shadow:${T['--chakra-shadows-'+k]}"></div><b>${k}</b><small>${esc(u)}</small></div>`).join('')}</div>`, 'Toutes les ombres sont très légères (5 % d’opacité) : elles séparent, elles ne décorent pas.')}
    ${section('Espacements', `<div class="space-row">${['1','2','3','4','5','6','8','10','12'].map(k => `<figure><i style="width:${T['--chakra-space-'+k]};height:${T['--chakra-space-'+k]};background:${T['--chakra-colors-primary-500']}"></i><figcaption>${Math.round(parseFloat(T['--chakra-space-'+k])*13)} px</figcaption></figure>`).join('')}</div>`, 'Grille de 3,25 px (un quart du corps de 13 px) : 6,5 · 9,75 · 13 · 16 · 19,5 · 26 · 32,5 px. Les contrôles font 32,5 px de haut.')}`);

  page('icones', 'Fondations', 'Icônes', `${Object.keys(D.icons).length} icônes utilisées dans les écrans : Font Awesome en majorité, quelques icônes Chakra.`,
    `${section('Jeu', `<div class="icon-grid">${Object.entries(D.icons).map(([id, ic]) => `<div class="icon-cell" title="${id}"><svg viewBox="${ic.viewBox || '0 0 24 24'}" style="width:22px;height:22px;color:#232930">${ic.inner}</svg></div>`).join('')}</div>`, 'Les icônes prennent la couleur du texte qui les entoure.')}`);

  for (const [id, title, url, parts, desc] of SCREENS) page(id, 'Écrans Orica', title, desc.replace(/\(css-[^)]*\)/g, '').replace(/css-[a-z0-9]+/g, '').replace(/chakra-[a-z_-]+/g, 'tableau'), `<p class="route"><span class="label">Adresse</span><code class="inline">${esc(url)}</code></p>` + parts.map(p => card(p, screenPartLabel(p), { block: true, grey: /drawer|rail|pagehead/.test(pickKey(p)) ? true : false, wrap: /drawer|rail/.test(pickKey(p)) ? 'min-height:640px' : '' })).join(''));

  /* ------------------------------------------------------------- composants réellement utilisés */
  page('composants', 'Composants', 'Tous les composants', `${COMPONENTS.length} composants, ceux que l’on rencontre vraiment sur les écrans d’Orica.`, '<div class="comp-grid" id="compGrid"></div>');
  const C = pick;
  comp('bouton', 'Bouton', 'Le bouton d’Orica : un primaire par en-tête de page, des secondaires gris ou en contour, des boutons texte pour les actions discrètes, des boutons icône pour les actions de ligne.',
    `${section('Variantes', grid([[C.btnPrimary, 'Primaire'], [C.btnPrimaryMenu, 'Primaire avec menu'], [C.btnFiltres, 'Secondaire « Filtres »'], [C.btnImport, 'Contour « Importer Excel »'], [C.btnSave, 'Grand « Enregistrer »'], [C.btnOffre, '« Nouvelle offre »'], [C.btnSoft, 'Doux « Ajouter »'], [C.btnGhost, 'Texte « Parcours prospect »'], [C.btnToggleAll, 'Texte « Tout ouvrir »'], [C.btnUnivers, 'Choix d’univers'], [C.btnTab, 'Onglet-bouton avec compteur']]))}
     ${section('États', states(C.btnPrimary, 'button') + states(C.btnImport, 'button'))}
     ${section('Boutons icône', grid([[C.btnIconCopy, 'Copier'], [C.btnIconPager, 'Page suivante'], [C.btnIconScroll, 'Défiler les filtres'], [C.btnBack, 'Retour'], [C.btnRail, 'Tuile du rail'], ...flat(C.btnRowIcons).map((b, i) => [b, 'Action de ligne ' + (i + 1)])]))}
     ${section('Pied de drawer', grid([[C.btnReset, 'Réinitialiser'], [C.btnSupprimer, 'Supprimer (désactivé)'], [C.btnAppliquer, 'Appliquer (désactivé)']]), 'Supprimer et Appliquer restent désactivés tant qu’aucun filtre n’a changé.')}
     ${section('Usage', usage(['Un seul bouton primaire par en-tête de page, à droite du titre, avec l’icône « + » à gauche.', 'Les actions secondaires sont en gris ou en contour ; les actions discrètes en texte.', 'Désactivé = 40 % d’opacité, le dessin ne change pas.', 'Hauteur fixe de 32,5 px, coins arrondis de 10 px, libellé en Medium 14.']))}`,
    [C.btnPrimary, C.btnFiltres, C.btnSave, C.btnIconPager, C.btnReset, C.btnTab]);
  comp('lien', 'Lien', 'Un lien texte, souligné au survol : items de menu et lien-bouton.',
    `${section('Variantes', grid([[C.linkMenu, 'Item de menu'], [C.linkBtn, 'Lien-bouton']]))}
     ${section('États', states(C.linkMenu, 'link'))}`, [C.linkMenu, C.linkBtn]);
  comp('tabs', 'Onglets', 'Des onglets soulignés sous l’en-tête de page ; l’actif est en couleur d’accent. Ils peuvent porter un compteur.',
    `${section('Variantes', grid([[C.tabsRefs, 'Liens (Références)'], [C.tabsContrats, 'Avec compteurs (Contrats)'], [C.tabsPlans, 'Plans d’achat']], { block: true }))}
     ${section('États', states(C.tabsPlans, 'tab'))}
     ${section('Usage', usage(['Toujours sous l’en-tête de page, avant la barre de filtres. Un seul niveau.', 'Un seul onglet sélectionné ; pas d’onglet désactivé rencontré.']))}`, [C.tabsRefs, C.tabsContrats, C.tabsPlans]);
  comp('segmented', 'Segmented control', 'Un choix exclusif entre deux ou trois vues, avec un curseur qui glisse : vues des plans d’achat, univers Café / Cacao de l’en-tête.',
    `${section('Variantes', grid([[C.segmented, 'Vues « Par origines / Par UB / Kanban »'], [C.univers, 'Univers « Café / Cacao »']]))}
     ${section('Usage', usage(['Deux à trois options courtes, jamais plus.', 'Pour un choix qui change toute la page (vue, univers) ; pour filtrer, utiliser un select ou la barre de filtres.']))}`, [C.segmented, C.univers]);
  comp('select', 'Select', 'Le menu déroulant natif, habillé : blanc, bordure fine, chevron à droite.',
    `${section('Variantes', grid([[C.selectBasic, 'Standard'], [C.selectOrigine, 'Origine'], [C.selectFiliale, 'Filiale'], [C.selectAnnee, 'Année']]))}
     ${section('États', states(C.selectBasic, 'select'))}
     ${section('Usage', usage(['Pour un choix simple parmi une liste courte ; pour un multi-choix avec compteurs, c’est le menu à options.', 'Même hauteur et mêmes coins que les boutons et les champs.']))}`, [C.selectBasic, C.selectOrigine]);
  comp('menu', 'Menu déroulant', 'Le panneau qui s’ouvre sous un bouton : menu utilisateur, menu Power BI, liste d’options cochables avec compteurs.',
    `${section('Variantes', grid([[C.menuUser, 'Menu utilisateur'], [C.menuPower, 'Menu Power BI'], [C.menuOrigins, 'Options cochables avec compteurs']], { block: true }))}
     ${section('Usage', usage(['Les menus à options servent aux filtres multi-choix ; une coche et un compteur par option.', 'Le menu utilisateur regroupe la langue et la déconnexion (en rouge).']))}`, [C.menuUser, C.menuPower, C.menuOrigins]);
  comp('champ-de-recherche', 'Champ de recherche', 'Un champ avec une loupe à gauche, en tête de la barre de filtres.',
    `${section('Variantes', grid([[C.search, 'Recherche'], [C.search2, 'Recherche (variante)']], { block: true }))}
     ${section('États', states(C.search, 'input'))}
     ${section('Usage', usage(['Une recherche par liste, toujours en premier dans la barre de filtres.', 'Le placeholder dit sur quoi on cherche (« Filtrer par origine, fournisseur, BTB… »).']))}`, [C.search, C.search2]);
  comp('champ-de-saisie', 'Champ de saisie', 'Libellé au-dessus en semi-gras, champ blanc à bordure fine, zone de texte pour les contenus longs.',
    `${section('Variantes', grid([[C.formlabel, 'Libellé'], [C.formlabel2, 'Libellé obligatoire'], [C.inputForm, 'Champ'], [C.inputDrawer, 'Champ (drawer)'], [C.textarea, 'Zone de texte']], { block: true }))}
     ${section('États', states(C.inputForm, 'input'))}
     ${section('En situation', grid([[C.formcontrol, 'Groupe de radios (drawer)'], [C.formcard, 'Carte de formulaire']], { block: true, grey: true }))}
     ${section('Usage', usage(['Libellé toujours au-dessus, astérisque rouge pour l’obligatoire.', 'Au focus, la bordure passe en accent et le fond en gris très clair.', 'Aucun message d’erreur n’a été rencontré sur les écrans : l’état « Erreur » ci-dessus est la bordure rouge prévue par le style.']))}`, [C.inputForm, C.textarea, C.formcard]);
  comp('case-a-cocher', 'Case à cocher & radio', 'Case carrée aux coins doux, cochée en accent ; radio ronde.',
    `${section('Variantes', grid([[C.checkbox, 'Case'], [C.checkbox2, 'Case (filtre)'], [C.checkbox3, 'Case (drawer)'], [C.radio, 'Radio']]))}
     ${section('États', states(C.checkbox, 'control'))}
     ${section('Usage', usage(['Case pour un choix multiple, radio pour un choix unique.', 'Le libellé est cliquable et reste en Book 13.']))}`, [C.checkbox, C.radio]);
  comp('badge', 'Badge & tags', 'Petits compteurs après un libellé, tags de qualité des références, rôles dans le tableau fournisseurs.',
    `${section('Variantes', grid([...flat(C.badges).map((b, i) => [b, 'Compteur ' + (i + 1)]), [C.wrapTags, 'Tags de référence'], [C.wrapRoles, 'Rôles']]))}
     ${section('Usage', usage(['Un badge informe, il ne se clique pas.', 'Les tags de qualité (Terroir, Label, Microlot…) ont chacun leur couleur ; ordre : type de sourcing, label, poids.']))}`, [...flat(C.badges), C.wrapTags, C.wrapRoles]);
  comp('avatar', 'Avatar', 'Initiales de l’utilisateur dans un double anneau, drapeau d’origine dans les listes.',
    `${section('Variantes', grid([[C.avatarUser, 'Utilisateur'], [C.avatarFlag, 'Drapeau d’origine']]))}`, [C.avatarUser, C.avatarFlag]);
  comp('heading', 'Titres & séparateurs', 'Titre de page, titre de panneau, titre de groupe ; séparateurs fins.',
    `${section('Variantes', grid([[C.headingPage, 'Titre de page'], [C.headingDrawer, 'Titre de panneau'], [C.headingOrigine, 'Titre de groupe'], ...flat(C.dividers).map((d, i) => [d, 'Séparateur ' + (i + 1)])], { block: true }))}
     ${section('Usage', usage(['Pas de majuscules sur les titres, une seule famille de police.']))}`, [C.headingPage, C.headingDrawer, C.headingOrigine]);
  comp('tableau', 'Tableau', 'Lignes blanches sans bordures verticales : identité à gauche (drapeau + nom), actions à droite.',
    `${section('Variantes', grid([[C.tablewrap, 'Fournisseurs'], [C.tablewrapContrats, 'Contrats'], [C.trContrat, 'Ligne de contrat']], { block: true }))}
     ${section('Usage', usage(['Première colonne = identité, dernière = actions.', 'Les statuts sont des pastilles colorées, les compteurs des badges.']))}`, [C.tablewrap, C.tablewrapContrats]);
  comp('ligne-de-reference', 'Ligne de référence', 'La ligne riche de l’écran Références : drapeau ou icône, code, nom, tags de qualité, quantités et prix.',
    `${section('Ligne', grid([[C.refrow, 'Références']], { block: true }))}
     ${section('Usage', usage(['Une ligne = une référence ; les listes se chargent en continu au défilement.']))}`, [C.refrow]);
  comp('pagination', 'Pagination', '« n / N » et deux flèches.',
    `${section('Variantes', grid([[C.pagination, 'Contrats'], [C.paginationRefs, 'Références']], { block: true }))}
     ${section('Usage', usage(['Alignée à droite sous la liste ; la flèche inapplicable est désactivée.']))}`, [C.pagination, C.paginationRefs]);
  comp('carte-kpi', 'Carte KPI', 'Icône, titre, grand chiffre, barre empilée et légendes : les indicateurs des plans d’achat.',
    `${section('Variantes', grid([[C.kpi, 'Carte'], [C.kpigrid, 'Grille de quatre cartes']], { block: true, grey: true }))}
     ${section('Usage', usage(['Quatre cartes par ligne sur grand écran, deux en dessous.', 'La barre empilée reprend les couleurs de la légende ; une pastille par segment.']))}`, [C.kpi, C.kpigrid]);
  comp('accordeon', 'Accordéon', 'Groupes repliables des plans d’achat : par origine, par UB, comparaison sur trois crops.',
    `${section('Variantes', grid([[C.accOrigine, 'Par origine'], [C.accUB, 'Par UB'], [C.accComparaison, 'Comparaison']], { block: true }))}`, [C.accOrigine, C.accUB, C.accComparaison]);
  comp('drawer', 'Drawer de filtres', 'Le panneau de filtres qui glisse depuis la droite, sur un voile sombre.',
    `${section('Panneau', grid([[C.drawer, 'Filtres']], { block: true, grey: true, wrap: 'min-height:640px' }))}
     ${section('Usage', usage(['364 px de large, en pied : Réinitialiser à gauche, Supprimer et Appliquer à droite.', 'Les groupes de filtres sont des titres en semi-gras suivis de radios ou de cases.']))}`, [C.drawer]);
  comp('barre-de-filtres', 'Barre de filtres', 'Recherche, selects, case et bouton Filtres sur une ligne ; des flèches font défiler les barres trop longues.',
    `${section('Variantes', grid([[C.filterbarRefs, 'Références'], [C.filterbarContrats, 'Contrats']], { block: true }))}
     ${section('Usage', usage(['Ordre : recherche, selects, case « Inclure en sommeil », bouton Filtres.', 'Toujours entre les onglets et la liste.']))}`, [C.filterbarRefs, C.filterbarContrats]);
  comp('coquille', 'Rail & en-tête', 'Le rail de navigation à gauche (64 px, tuiles, avatar en bas) et les en-têtes de page.',
    `${section('Variantes', grid([[C.rail, 'Rail'], [C.pagehead, 'En-tête de liste'], [C.pageheadForm, 'En-tête de page de création']], { block: true, grey: true }))}
     ${section('Usage', usage(['Ordre d’un écran : en-tête, onglets, filtres, contenu, pagination.', 'L’en-tête porte le titre, le choix d’univers et l’action primaire à droite ; sur une page de création, un bouton Retour précède le titre.']))}`, [C.rail, C.pagehead, C.pageheadForm]);
  comp('etat-vide', 'État vide', '« Aucune région trouvée » : un message centré, sans illustration.',
    `${section('Vide', grid([[C.emptyState, 'Aucun résultat']], { block: true }))}`, [C.emptyState]);

  page('changelog', 'Suivi', 'Changelog', 'Ce qui a changé, par version.', `${section('Historique', `<div class="changelog">${CHANGELOG.map(e => { let first = true; const part = (l, it) => { if (!it || !it.length) return ''; const h = `<p class="label" style="margin:${first ? '0 0 6px' : '12px 0 6px'}">${l}</p><ul>${it.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`; first = false; return h; }; return `<div><time datetime="${esc(e.date)}">${esc(fmtDate(e.date))}</time><div><h3>${esc(e.version)} · ${esc(e.title)}</h3>${part('Ajouté', e.added)}${part('Modifié', e.modified)}${part('Supprimé', e.removed)}</div></div>`; }).join('')}</div>`)}`);

  /* ------------------------------------------------------------- helpers tardifs */
  function swatch(k, use) { const v = T['--chakra-colors-' + k]; if (!v) return ''; return `<div class="swc"><i style="background:${v}"></i><b>${esc(k.replace(/-500$/, '').replace(/statuteOffreAchat-/, 'offre '))}</b><small>${esc(use)}</small><code>${esc(v)}</code></div>`; }
  function pickKey(sample) { for (const [k, v] of Object.entries(pick)) if (v === sample) return k; return ''; }
  function screenPartLabel(sample) { const k = pickKey(sample); return ({ pagehead: 'En-tête', pageheadForm: 'En-tête', tabsRefs: 'Onglets', tabsContrats: 'Onglets', tabsPlans: 'Onglets', filterbarRefs: 'Barre de filtres', filterbarContrats: 'Barre de filtres', refrow: 'Lignes de références', paginationRefs: 'Pagination', pagination: 'Pagination', btnTab: 'Onglet-bouton', tablewrap: 'Tableau', tablewrapContrats: 'Tableau', segmented: 'Segmented', kpigrid: 'Cartes KPI', accOrigine: 'Accordéon', trContrat: 'Ligne', headingOrigine: 'Titre', selectFiliale: 'Select', emptyState: 'État vide', formcard: 'Formulaire', drawer: 'Panneau Filtres', overlay: 'Voile', rail: 'Rail' })[k] || k; }

  const NAV = [
    { group: 'Fondations', home: 'introduction', items: PAGES.filter(p => p.group === 'Fondations') },
    { group: 'Écrans Orica', home: 'ecran-references', items: PAGES.filter(p => p.group === 'Écrans Orica') },
    { group: 'Composants', home: 'composants', items: PAGES.filter(p => p.group === 'Composants') },
  ];
  const pagesJson = JSON.stringify(PAGES.map(p => ({ id: p.id, group: p.group, title: p.title, lede: p.lede, body: p.body, soon: false, nopager: p.group === 'Suivi' })));
  const html = `<title>Orica pour les designers</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap">
<style>
${shellCss}
${lightCss}
</style>
<style id="prodFonts">${fontFaceCss}</style>
<script type="text/plain" id="prodShared">${sharedCss.replace(/<\/script/g, '<\\/script')}</script>
<script type="text/plain" id="prodComponents">${allComponentCss.replace(/<\/script/g, '<\\/script')}</script>
<div class="shell is-light">
  <nav class="sidebar" id="sidebar" aria-label="Navigation de la documentation">
    <a class="brand" href="#introduction" id="brand">${belcoLogo}<span>Orica<small>Design System · édition designers</small></span></a>
    <div id="nav"></div>
  </nav>
  <div class="scrim" id="scrim"></div>
  <div class="content">
    <header class="topbar">
      <button class="menu-btn" id="menuBtn" type="button" aria-label="Ouvrir la navigation"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <label class="o-search" for="q"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Chercher un composant…" autocomplete="off"><span class="kbd">⌘K</span></label>
      <nav class="topnav" id="topnav" aria-label="Sections"><a href="#introduction" data-top="ds">Design System</a><a href="#changelog" data-top="changelog">Changelog</a><a href="../" data-top="full" title="Code, CSS, audit, chat">Version complète</a></nav>
    </header>
    <main class="page" id="page"></main>
  </div>
</div>
<script>
const PAGES = ${pagesJson};
const COMP = ${JSON.stringify(COMP)};
const NAV = ${JSON.stringify(NAV.map(n => ({ group: n.group, home: n.home, items: n.items.map(i => ({ id: i.id, label: i.id === 'introduction' ? 'Introduction' : i.title, soon: false, ds: false })) })))};
const TOKENS_CSS = ${JSON.stringify(tokensCss)};
const COMPONENTS_CSS = document.getElementById('prodComponents').textContent;
const DS_CSS = '';
const SHARED_CSS = document.getElementById('prodShared').textContent;
const AGENTS = '';
const AUDIT = [];
const RULES_MD = {};
const DS_TOKENS_CSS = '';
const DS_COMPONENTS = null;
const CHAT_ENABLED = false;
const APP_SCREENS = [];
${shellJs}
</script>
`;
  fs.writeFileSync(path.join(DIR, 'orica-light.html'), html);
  fs.mkdirSync(path.join(OUT, 'designers'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'designers', 'index.html'), `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<style>body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>
${html.replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n/, '').replace(/^([\s\S]*?<\/style>\n<style id="prodFonts">[\s\S]*?<\/style>\n)/, '$1</head>\n<body>\n')}
</body>
</html>
`);
  return { pages: PAGES.length, components: COMP.length, size: html.length };
}
const COMPONENTS = ['bouton', 'lien', 'tabs', 'segmented', 'select', 'menu', 'champ-de-recherche', 'champ-de-saisie', 'case-a-cocher', 'badge', 'avatar', 'heading', 'tableau', 'ligne-de-reference', 'pagination', 'carte-kpi', 'accordeon', 'drawer', 'barre-de-filtres', 'coquille', 'etat-vide'];
module.exports = { buildLight };
