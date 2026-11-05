/* ---------- mode Play : audit UI (liste scorée à gauche, navigateur d'écrans à droite, surbrillance des instances) ---------- */
(function () {
  const A = AUDIT, SCR = APP_SCREENS;
  const byId = Object.fromEntries(A.map(c => [c.id, c]));
  const st = { open: false, lastHash: '#introduction', cur: null, scr: 0, hist: [], pos: -1, inspect: true, sort: 'score', filter: '', focus: 0 };
  let sh = null, wrap = null, raf = 0;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const grade = n => n >= 80 ? 'is-good' : n >= 60 ? 'is-mid' : 'is-low';
  const global = Math.round(A.reduce((s, c) => s + c.score, 0) / A.length);

  /* instances par écran, comptées une fois sur un DOM détaché */
  const counts = SCR.map(s => { const doc = new DOMParser().parseFromString('<div>' + s.html + '</div>', 'text/html'); const o = {}; A.forEach(c => { try { o[c.id] = doc.querySelectorAll(c.fam.join(',')).length; } catch (e) { o[c.id] = 0; } }); return o; });

  const ICON = {
    play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    fwd: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    reload: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    cursor: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3l14 8-6 2-3 6z"/></svg>',
  };

  const layer = document.createElement('div'); layer.id = 'audit'; layer.hidden = true; layer.setAttribute('aria-label', 'Audit UI');
  layer.innerHTML = `
  <div class="aud-top">
    <div class="aud-brand"><span class="aud-playdot">${ICON.play}</span><div><strong>Audit UI</strong><span>Orica · fidélité des composants au design system</span></div></div>
    <div class="aud-global"><div class="aud-ring ${grade(global)}" style="--p:${global}"><b>${global}</b></div><div><span class="label">Score global</span><small>${A.length} composants relevés · moyenne</small></div></div>
    <button class="aud-btn" type="button" id="audMethod">Méthode</button>
    <button class="aud-btn aud-quit" type="button" id="audQuit">Quitter <kbd>Esc</kbd></button>
  </div>
  <div class="aud-body">
    <aside class="aud-list">
      <div class="aud-tools"><input id="audFilter" type="search" placeholder="Filtrer les composants" autocomplete="off"><select id="audSort" aria-label="Tri"><option value="score">Score ↑</option><option value="scoreDesc">Score ↓</option><option value="name">Nom</option><option value="screen">Sur cet écran</option></select></div>
      <div class="aud-items" id="audItems"></div>
      <div class="aud-legend"><i class="is-good"></i>≥ 80<i class="is-mid"></i>60–79<i class="is-low"></i>&lt; 60</div>
    </aside>
    <section class="aud-detail" id="audDetail" hidden></section>
    <section class="aud-browser">
      <div class="aud-chrome">
        <div class="aud-navbtns"><button type="button" id="audBack" aria-label="Précédent" disabled>${ICON.back}</button><button type="button" id="audFwd" aria-label="Suivant" disabled>${ICON.fwd}</button><button type="button" id="audReload" aria-label="Recharger">${ICON.reload}</button></div>
        <div class="aud-url"><span class="aud-dot"></span><span class="aud-hostname">hub.belco-sandbox.synako.fr</span><select id="audRoute" aria-label="Écran">${SCR.map((s, i) => `<option value="${i}">${esc(s.route)} — ${esc(s.title)}</option>`).join('')}</select></div>
        <select class="aud-zoom" id="audZoom" aria-label="Zoom"><option value="fit">Ajuster</option><option value="1">100 %</option><option value="0.75">75 %</option><option value="0.5">50 %</option></select>
        <label class="aud-toggle"><input type="checkbox" id="audInspect" checked>${ICON.cursor} Inspecter</label>
      </div>
      <div class="aud-frame" id="audFrame">
        <div class="aud-host" id="audHost"></div>
        <div class="aud-overlay" id="audOverlay"><svg id="audDim" aria-hidden="true"></svg><div id="audBoxes"></div><div class="aud-hover" id="audHover" hidden></div></div>
        <div class="aud-toast" id="audToast" hidden></div>
        <div class="aud-screennote" id="audNote"></div>
      </div>
    </section>
  </div>
  <div class="aud-method" id="audMethodPanel" hidden>
    <div class="aud-method-card">
      <div class="aud-method-head"><h2>Comment le score est calculé</h2><button type="button" class="aud-btn" id="audMethodClose">${ICON.close}</button></div>
      <p>Chaque composant est noté à partir du CSS réellement servi par l’application, sans appréciation manuelle. Le score dit à quel point le composant respecte les règles du design system.</p>
      <dl>
        <dt>Utilise les tokens du thème · 50 %</dt><dd>Part des couleurs, ombres, rayons, typographies, espacements et tailles qui passent par un token du thème plutôt que par une valeur écrite en dur (un hex, des px). Une valeur en dur, c’est une valeur que le thème ne pilote plus.</dd>
        <dt>États dessinés · 30 %</dt><dd>Pour les composants avec lesquels on interagit : survol, focus clavier, clic, désactivé et, quand ça s’applique, sélection. Un état manquant, c’est un comportement laissé au hasard du navigateur. Les composants sans interaction n’ont pas ce critère (tokens 70 %, une seule façon de le faire 30 %).</dd>
        <dt>Une seule façon de le faire · 20 %</dt><dd>Nombre de versions différentes du même composant dans l’app. Jusqu’à trois, c’est maîtrisé ; au-delà, chaque version supplémentaire coûte 4 points (plancher 40). Beaucoup de versions, c’est un composant difficile à faire évoluer.</dd>
        <dt>Pénalités</dt><dd>−5 quand l’aperçu ne peut pas être exact (drapeaux et images remplacés par des visuels neutres). Les remarques sans effet visuel sont affichées mais ne comptent pas.</dd>
      </dl>
      <p class="muted">Les écrans du navigateur sont recomposés à partir du HTML servi (rail, en-tête, contenu), données neutralisées. Pour Fournisseurs, Plans d’achat, Contrats, Direct Trade et Géographie, le titre est réel mais l’action principale de l’en-tête n’a pas été relevée. Le « Tableau de bord » est un prototype composé avec le bundle.</p>
    </div>
  </div>`;
  document.body.appendChild(layer);
  const $ = s => layer.querySelector(s);
  const frame = $('#audFrame'), host = $('#audHost'), dim = $('#audDim'), boxes = $('#audBoxes'), hover = $('#audHover'), toast = $('#audToast'), items = $('#audItems'), detail = $('#audDetail'), routeSel = $('#audRoute'), note = $('#audNote');

  /* ---- liste ---- */
  function renderList() {
    const c = counts[st.scr]; const f = st.filter.toLowerCase();
    let list = A.filter(x => !f || x.title.toLowerCase().includes(f) || x.roots.join(' ').includes(f));
    const bySort = { score: (a, b) => a.score - b.score, scoreDesc: (a, b) => b.score - a.score, name: (a, b) => a.title.localeCompare(b.title, 'fr'), screen: (a, b) => (c[b.id] > 0) - (c[a.id] > 0) || c[b.id] - c[a.id] || a.title.localeCompare(b.title, 'fr') };
    list = list.slice().sort(bySort[st.sort] || bySort.score);
    items.innerHTML = list.map(x => `<button type="button" class="aud-row ${grade(x.score)}${st.cur === x.id ? ' is-on' : ''}${c[x.id] ? '' : ' is-absent'}" data-id="${x.id}"><span class="aud-name">${esc(x.title)}</span><span class="aud-count" title="Instances sur cet écran">${c[x.id] ? '× ' + c[x.id] : '—'}</span><span class="aud-bar"><i style="width:${x.score}%"></i></span><b class="aud-score">${x.score}</b></button>`).join('') || '<div class="aud-empty">Aucun composant.</div>';
  }
  items.addEventListener('click', e => { const r = e.target.closest('.aud-row'); if (!r) return; select(r.dataset.id === st.cur ? null : r.dataset.id); });
  $('#audFilter').addEventListener('input', e => { st.filter = e.target.value.trim(); renderList(); });
  $('#audSort').addEventListener('change', e => { st.sort = e.target.value; renderList(); });

  /* ---- détail ---- */
  const pct = (v, cls) => `<span class="aud-mbar ${cls || ''}"><i style="width:${v}%"></i></span>`;
  const STATE_FR = { hover: 'Survol', focus: 'Focus clavier', active: 'Clic', disabled: 'Désactivé', selected: 'Sélection' };
  const CAT_FR = { espacements: 'espacements', tailles: 'tailles', couleurs: 'couleurs', typographie: 'typographie', rayons: 'rayons', ombres: 'ombres', autres: 'autres' };
  function renderDetail() {
    const x = st.cur && byId[st.cur]; if (!x) { detail.hidden = true; layer.classList.remove('has-detail'); return; }
    const c = counts[st.scr]; const here = c[x.id] || 0;
    const presence = SCR.map((s, i) => ({ i, n: counts[i][x.id] || 0, s })).filter(p => p.n);
    const hardTxt = x.hard === 0 ? 'Tout passe par les tokens du thème : rien n’est écrit en dur.' : `${x.hard} valeur${x.hard > 1 ? 's' : ''} écrite${x.hard > 1 ? 's' : ''} en dur au lieu des tokens${x.hardCats && x.hardCats.length ? ' : ' + x.hardCats.slice(0, 3).map(h => `${CAT_FR[h.cat] || h.cat} (${h.values.join(', ')})`).join(', ') : ''}.`;
    const statesTxt = x.statesPct === null ? 'Ce composant n’a pas d’état interactif : ce critère ne s’applique pas.' : x.missing.length === 0 ? `Tous les états sont dessinés : ${x.states.map(s => STATE_FR[s.k].toLowerCase()).join(', ')}.` : `Il manque ${x.missing.length > 1 ? 'les états ' + x.missing.join(' et ') : 'l’état ' + x.missing[0]}.`;
    const varTxt = x.variants <= 1 ? 'Une seule version de ce composant dans l’app : c’est l’idéal.' : x.variants <= 3 ? `${x.variants} versions de ce composant dans l’app : c’est maîtrisé.` : `${x.variants} versions différentes de ce composant dans l’app. Plus il y en a, plus il est difficile à faire évoluer (objectif : 3 au plus).`;
    const notesFR = n => n.replace('Listes réduites à trois éléments dans le relevé', 'Les listes longues sont montrées avec trois éléments seulement').replace('Certaines variantes relevées à l’état disabled', 'Certaines versions ont été capturées désactivées (grisées), comme à l’écran ce jour-là').replace('Images externes (drapeaux, sceaux) remplacées dans l’aperçu', 'Les drapeaux et images sont remplacés par des visuels neutres dans l’aperçu');
    detail.innerHTML = `
      <div class="aud-dhead"><div><span class="label">Composant</span><h2>${esc(x.title)}</h2></div><div class="aud-big ${grade(x.score)}"><b>${x.score}</b><span>/100</span></div><button type="button" class="aud-btn aud-dclose" id="audDClose" aria-label="Fermer">${ICON.close}</button></div>
      <div class="aud-verdict ${grade(x.score)}"><strong>${esc(x.verdict)}</strong><span>${esc(x.why)}</span></div>
      <div class="aud-crit">
        <div class="aud-c"><div class="aud-c-top"><span>Utilise les tokens du thème</span>${pct(x.tokensPct, grade(x.tokensPct))}<b>${x.tokensPct} %</b></div><p>${esc(hardTxt)}</p></div>
        <div class="aud-c"><div class="aud-c-top"><span>États dessinés</span>${x.statesPct === null ? '<i class="aud-na">sans objet</i>' : pct(x.statesPct, grade(x.statesPct))}<b>${x.statesPct === null ? '—' : x.statesPct + ' %'}</b></div>${x.statesPct === null ? '' : `<div class="aud-states">${x.states.map(s => `<i class="${s.ok ? 'ok' : 'ko'}">${STATE_FR[s.k]}</i>`).join('')}</div>`}<p>${esc(statesTxt)}</p></div>
        <div class="aud-c"><div class="aud-c-top"><span>Une seule façon de le faire</span>${pct(x.consistency, grade(x.consistency))}<b>${x.consistency} %</b></div><p>${esc(varTxt)}</p></div>
        ${x.penalties.length ? `<div class="aud-pen">${x.penalties.map(p => `<span>−5 · ${esc(notesFR(p))}</span>`).join('')}</div>` : ''}
      </div>
      <div class="aud-section"><span class="label">Où il apparaît</span><div class="aud-chips">${presence.length ? presence.map(p => `<button type="button" class="aud-chip${p.i === st.scr ? ' is-on' : ''}" data-scr="${p.i}">${esc(p.s.title)} <b>${p.n}</b></button>`).join('') : '<span class="muted">Sur aucun des écrans relevés</span>'}</div>
        <div class="aud-inst">${here ? `<span><b>${here}</b> fois sur cet écran</span><span class="aud-instnav"><button type="button" class="aud-btn" id="audPrev" aria-label="Précédente">${ICON.back}</button><span id="audInstPos">${st.focus + 1}/${here}</span><button type="button" class="aud-btn" id="audNext" aria-label="Suivante">${ICON.fwd}</button></span>` : '<span class="muted">Pas sur cet écran</span>'}</div></div>
      ${x.notes.length ? `<div class="aud-section"><span class="label">À savoir sur le relevé</span><ul class="aud-notes">${x.notes.map(n => `<li>${esc(notesFR(n))}</li>`).join('')}</ul></div>` : ''}
      <details class="aud-tech"><summary>Détails techniques</summary>
        <div class="aud-tech-body">
          <p><span class="label">Classes racines</span><code>${esc(x.roots.join('  '))}</code></p>
          <p class="muted">${x.classes} classes Emotion · ${x.rules} règles CSS · ${x.decl} déclarations thémables, dont ${x.hard} en dur · ${x.variants} signature${x.variants > 1 ? 's' : ''} racine${x.variants > 1 ? 's' : ''}</p>
          ${x.hardTop.length ? `<ul class="aud-hard">${x.hardTop.map(h => `<li><code>${esc(h.k)}</code><span>× ${h.n}</span></li>`).join('')}</ul>` : ''}
        </div>
      </details>
      <a class="aud-open" href="#${x.id}">Ouvrir la fiche du composant ${ICON.fwd}</a>`;
    detail.hidden = false; layer.classList.add('has-detail');
  }
  detail.addEventListener('click', e => {
    if (e.target.closest('#audDClose')) { select(null); return; }
    const chip = e.target.closest('.aud-chip'); if (chip) { go(+chip.dataset.scr); return; }
    if (e.target.closest('#audPrev')) { stepFocus(-1); return; }
    if (e.target.closest('#audNext')) { stepFocus(1); return; }
    const a = e.target.closest('.aud-open'); if (a) { e.preventDefault(); quit(a.getAttribute('href')); }
  });
  function stepFocus(d) { const n = instances().length; if (!n) return; st.focus = (st.focus + d + n) % n; scrollToFocus(); const p = $('#audInstPos'); if (p) p.textContent = (st.focus + 1) + '/' + n; }
  function instances() { const x = st.cur && byId[st.cur]; if (!x || !wrap) return []; try { return [...wrap.querySelectorAll(x.fam.join(','))].filter(el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; }); } catch (e) { return []; } }
  function scrollToFocus() { const el = instances()[st.focus]; if (el) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' }); schedule(); }

  function select(id, opts = {}) {
    st.cur = id; st.focus = 0;
    if (id && !opts.stay && !(counts[st.scr][id] > 0)) { const i = counts.findIndex(c => c[id] > 0); if (i >= 0) go(i); }
    renderList(); renderDetail(); schedule();
    if (id && opts.scroll !== false) requestAnimationFrame(() => { if (instances().length) scrollToFocus(); });
  }

  /* ---- navigateur ---- */
  function ensureShadow() {
    if (sh) return;
    sh = host.attachShadow({ mode: 'open' });
    const [a, b, pv] = sheets();
    if (a && sh.adoptedStyleSheets !== undefined) sh.adoptedStyleSheets = [a, b, pv];
    else { const s = document.createElement('style'); s.textContent = SHARED_CSS.replace(/:root, :host/g, ':host') + '\n' + COMPONENTS_CSS; sh.appendChild(s); }
    wrap = document.createElement('div'); wrap.className = 'chakra-ui-light';
    wrap.style.cssText = 'font-family:var(--chakra-fonts-body);color:var(--chakra-colors-dark-500);font-size:var(--chakra-fontSizes-md);line-height:1.5;-webkit-font-smoothing:antialiased;text-rendering:optimizelegibility;font-feature-settings:"kern";position:relative;transform:translateZ(0);contain:layout paint;overflow:hidden;width:100%;height:100%;background:var(--chakra-colors-gray-100)';
    sh.appendChild(wrap);
    sh.addEventListener('scroll', schedule, true);
    sh.addEventListener('click', onFrameClick);
    sh.addEventListener('mousemove', onFrameMove);
    sh.addEventListener('mouseleave', () => { hover.hidden = true; });
    sh.addEventListener('submit', e => e.preventDefault());
    new ResizeObserver(() => applyZoom()).observe(frame);
  }
  function mount(i) {
    ensureShadow(); const s = SCR[i]; st.scr = i; st.focus = 0;
    wrap.innerHTML = s.html;
    wrap.querySelectorAll('a[href]').forEach(x => { x.setAttribute('data-href', x.getAttribute('href')); x.removeAttribute('href'); });
    wrap.scrollTop = 0; routeSel.value = String(i); applyZoom();
    note.textContent = s.proto ? 'Prototype composé avec le bundle — données fictives' : s.real ? 'Écran recomposé à partir du HTML servi — en-tête relevé' : 'Écran recomposé à partir du HTML servi — en-tête : titre réel, action non relevée';
    $('#audBack').disabled = st.pos <= 0; $('#audFwd').disabled = st.pos >= st.hist.length - 1;
    renderList(); renderDetail(); schedule();
  }
  function go(i, fromHist) {
    if (i < 0 || i >= SCR.length) return;
    if (!fromHist) { st.hist = st.hist.slice(0, st.pos + 1); st.hist.push(i); st.pos = st.hist.length - 1; }
    mount(i);
  }
  routeSel.addEventListener('change', e => go(+e.target.value));
  $('#audBack').addEventListener('click', () => { if (st.pos > 0) { st.pos--; go(st.hist[st.pos], true); } });
  $('#audFwd').addEventListener('click', () => { if (st.pos < st.hist.length - 1) { st.pos++; go(st.hist[st.pos], true); } });
  $('#audReload').addEventListener('click', () => mount(st.scr));
  $('#audInspect').addEventListener('change', e => { st.inspect = e.target.checked; hover.hidden = true; });
  const APP_MIN_WIDTH = 1140; // largeur de confort de l’app (rail + grille de 4 cartes KPI)
  function applyZoom() { if (!wrap) return; const w = frame.getBoundingClientRect().width; const z = st.zoom === 'fit' ? Math.min(1, w / APP_MIN_WIDTH) : +st.zoom; wrap.style.zoom = z === 1 ? '' : String(z); schedule(); }
  st.zoom = 'fit';
  $('#audZoom').addEventListener('change', e => { st.zoom = e.target.value; applyZoom(); });
  const ROUTES = [['/orica/references/cafes?filtres', '/orica/references/cafes?filtres'], ['/orica/references', '/orica/references/cafes'], ['/orica/fournisseurs/ajouter', '/orica/fournisseurs/ajouter'], ['/orica/fournisseurs', '/orica/fournisseurs/actifs'], ['/orica/plans_achat', '/orica/plans_achat'], ['/orica/contrats_achat', '/orica/contrats_achat'], ['/orica/direct_trade', '/orica/direct_trade'], ['/orica/geographie', '/orica/geographie'], ['/orica/prototypes/dashboard', '/orica/prototypes/dashboard'], ['/orica/', '/orica/references/cafes'], ['/orica', '/orica/references/cafes']];
  const idx = route => SCR.findIndex(s => s.route === route);
  function routeFor(href) { const m = ROUTES.find(([r]) => href === r || (r !== '/orica/' && r !== '/orica' && (href.startsWith(r + '/') || href.startsWith(r + '?')))); return m ? idx(m[1]) : -1; }
  function onFrameClick(e) {
    const path = e.composedPath();
    const el = path.find(n => n.nodeType === 1 && n !== wrap);
    const link = path.find(n => n.nodeType === 1 && n.hasAttribute && n.hasAttribute('data-href'));
    if (link) { e.preventDefault(); const href = link.getAttribute('data-href'); const i = routeFor(href); if (i >= 0) go(i); else say('Écran non relevé : ' + href); return; }
    const btn = path.find(n => n.nodeType === 1 && n.matches && n.matches('button'));
    if (btn) {
      const t = btn.textContent.trim();
      if (t === 'Filtres' && SCR[st.scr].route === '/orica/references/cafes') { go(idx('/orica/references/cafes?filtres')); return; }
      if (btn.matches('.chakra-modal__close-btn') || t === 'Appliquer' || t === 'Réinitialiser') { if (SCR[st.scr].route.endsWith('?filtres')) { go(idx('/orica/references/cafes')); return; } }
      if (btn.matches('[role=tab]')) { btn.parentElement.querySelectorAll('[role=tab]').forEach(o => o.setAttribute('aria-selected', o === btn)); }
    }
    if (path.find(n => n.nodeType === 1 && n.matches && n.matches('.chakra-modal__overlay'))) { go(idx('/orica/references/cafes')); return; }
    if (st.inspect && el) { const hit = hitTest(path); if (hit) { e.preventDefault(); select(hit.id, { stay: true, scroll: false }); st.focus = Math.max(0, instances().indexOf(hit.el)); renderDetail(); schedule(); } }
  }
  function hitTest(path) {
    for (const n of path) { if (n === wrap || n.nodeType !== 1 || !n.matches) break; for (const c of A) { try { if (n.matches(c.fam.join(','))) return { id: c.id, el: n }; } catch (e) { } } }
    return null;
  }
  function onFrameMove(e) {
    if (!st.inspect) return;
    const hit = hitTest(e.composedPath());
    if (!hit) { hover.hidden = true; return; }
    const fr = frame.getBoundingClientRect(), r = hit.el.getBoundingClientRect();
    hover.hidden = false; hover.style.cssText = `left:${r.left - fr.left}px;top:${r.top - fr.top}px;width:${r.width}px;height:${r.height}px`;
    hover.innerHTML = `<span>${esc(byId[hit.id].title)} · ${esc(rootClass(hit.el))}</span>`;
  }
  const rootClass = el => [...el.classList].filter(c => c.startsWith('css-')).slice(0, 1).join('') || el.tagName.toLowerCase();
  function say(t) { toast.textContent = t; toast.hidden = false; clearTimeout(say.t); say.t = setTimeout(() => { toast.hidden = true; }, 2200); }

  /* ---- surbrillance ---- */
  function schedule() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; draw(); }); }
  function draw() {
    if (!st.open || !wrap) return;
    const fr = frame.getBoundingClientRect(); const W = fr.width, H = fr.height;
    const x = st.cur && byId[st.cur]; const list = x ? instances() : [];
    const rects = list.map(el => { const r = el.getBoundingClientRect(); return { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height, el }; }).filter(b => b.y + b.h > 0 && b.y < H && b.x + b.w > 0 && b.x < W);
    dim.setAttribute('viewBox', `0 0 ${W} ${H}`); dim.setAttribute('width', W); dim.setAttribute('height', H);
    dim.innerHTML = x ? `<path fill="rgba(35,41,48,.42)" fill-rule="evenodd" d="M0 0H${W}V${H}H0Z ${rects.map(b => `M${b.x} ${b.y}h${b.w}v${b.h}h${-b.w}Z`).join(' ')}"/>` : '';
    const focusEl = list[st.focus];
    boxes.innerHTML = rects.map(b => `<div class="aud-box${b.el === focusEl ? ' is-focus' : ''}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px">${(b.el === focusEl || rects.length === 1) ? `<span>${esc(x.title)} · ${esc(rootClass(b.el))}</span>` : ''}</div>`).join('');
  }

  /* ---- ouverture / fermeture ---- */
  function open() {
    if (st.open) return; st.open = true; layer.hidden = false; document.body.classList.add('is-audit');
    if (st.pos < 0) go(0); else { mount(st.scr); }
    const from = st.lastHash.replace(/^#/, ''); if (byId[from] && !st.cur) select(from);
    renderList(); schedule();
  }
  function close() { if (!st.open) return; st.open = false; layer.hidden = true; document.body.classList.remove('is-audit'); hover.hidden = true; }
  function quit(to) { const target = to || st.lastHash || '#introduction'; if (location.hash === target) { close(); render(); } else location.hash = target; }
  $('#audQuit').addEventListener('click', () => quit());
  $('#audMethod').addEventListener('click', () => { $('#audMethodPanel').hidden = false; });
  $('#audMethodClose').addEventListener('click', () => { $('#audMethodPanel').hidden = true; });
  $('#audMethodPanel').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.hidden = true; });
  document.addEventListener('keydown', e => {
    if (!st.open) return;
    if (e.key === 'Escape') { if (!$('#audMethodPanel').hidden) { $('#audMethodPanel').hidden = true; return; } if (st.cur) { select(null); return; } quit(); }
    if (e.key === 'ArrowRight' && st.cur && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') stepFocus(1);
    if (e.key === 'ArrowLeft' && st.cur && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') stepFocus(-1);
  });
  window.__audit = { open, close, enter() { st.lastHash = (location.hash && location.hash !== '#audit') ? location.hash : '#introduction'; location.hash = 'audit'; }, setLast(h) { if (h && h !== '#audit') st.lastHash = h; } };
  const play = document.getElementById('playBtn'); if (play) play.addEventListener('click', () => window.__audit.enter());
  if ((location.hash || '').replace(/^#/, '') === 'audit') open(); // chargement direct sur #audit
})();
