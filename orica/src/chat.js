/* ---------- Chat : faire évoluer le design system depuis la documentation, sous garde-fous ----------
   - La documentation est un relevé ISO de la production : le chat ne modifie jamais rien directement.
   - Chaque changement devient une PROPOSITION (carte avec diff) puis, sur validation humaine, une PULL REQUEST sur le dépôt.
   - Aucune clé ne quitte le navigateur : les appels partent directement vers api.anthropic.com et api.github.com. */
(function () {
  if (typeof CHAT_ENABLED === 'undefined' || !CHAT_ENABLED) { const b = document.getElementById('chatBtn'); if (b) b.remove(); return; }
  const REPO = { owner: 'jeanmazoyer', name: 'belco-design-system', base: 'main', dir: 'orica' };
  const EDITABLE = [/^orica\/tokens\.css$/, /^orica\/rules\/[a-z0-9-]+\.md$/, /^orica\/changelog\.json$/];
  const READABLE = [...EDITABLE, /^orica\/AGENTS\.md$/, /^orica\/README\.md$/, /^README\.md$/];
  const MODELS = [['claude-sonnet-5-5', 'Sonnet 5.5 (défaut)'], ['claude-opus-5-5', 'Opus 5.5'], ['claude-haiku-5-5', 'Haiku 5.5']];
  const LS = 'orica.chat.settings', LSPR = 'orica.chat.prs';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  let settings = Object.assign({ anthropicKey: '', model: MODELS[0][0], githubToken: '', owner: REPO.owner, repo: REPO.name }, load(LS, {}));
  let prs = load(LSPR, []);
  const st = { open: false, busy: false, messages: [], proposals: [], abort: null, previewOn: null };

  /* ---- contexte donné au modèle ---- */
  const RULE_KEYS = Object.keys(RULES_MD);
  const SYSTEM = `Tu es l’assistant du design system Orica (module du Belco Hub, React + Chakra UI v2 + Emotion). Tu réponds en français, de façon concise et précise, en citant les tokens (--chakra-…), les classes (chakra-*, css-xxxx) et les fiches de règles concernées.

GARDE-FOUS, NON NÉGOCIABLES
1. Cette documentation est un relevé ISO de la production : tokens, CSS, HTML et icônes sont ceux servis par l’application. Tu ne modifies jamais rien directement et tu ne prétends jamais qu’un changement est appliqué.
2. Le seul chemin pour faire évoluer le design system : une PROPOSITION (outil proposer_modification) qu’un humain valide, puis une PULL REQUEST ouverte depuis la documentation. La fusion de la PR régénère la documentation. Tu n’ouvres pas de PR toi-même.
3. Fichiers modifiables : orica/tokens.css (valeurs des variables --chakra-*), orica/rules/<fiche>.md (règles IA) et orica/changelog.json (entrées du changelog : ajout / modification / suppression de composants, fondations ou marques). Tout le reste (components.css, base.css, icons.svg, samples/, index.html, AGENTS.md) est généré depuis la production et n’est pas éditable.
4. Toute proposition sur tokens.css doit expliquer l’impact sur le thème Chakra d’Orica (clé du thème, ex. colors.primary.500) : tant que la production n’a pas intégré le changement, la doc et la prod divergent et l’audit le signalera. Dis-le explicitement.
5. Rien n’est inventé : pas de composant, variante, token ou classe qui n’existe pas dans le relevé. Les composants marqués Soon ne sont pas documentés tant qu’un écran ne les montre pas. Si tu ne sais pas, dis-le.
6. Avant de proposer, lis l’état courant du fichier (lire_fichier) et renvoie le fichier COMPLET modifié, pas un extrait. Garde le format existant (tokens.css : « :root, :host { … } », une variable par ligne ; changelog.json : tableau d’objets {date, version, title, added, modified, removed}, nouvelle entrée en premier).

MÉTHODE
- Pour une question : réponds avec les outils de lecture (lire_tokens, lire_regles, rechercher_css, scores_audit) et cite tes sources.
- Pour une évolution : (a) reformule le besoin, (b) lis le fichier courant, (c) appelle proposer_modification avec un titre court, une justification, l’impact thème et le contenu complet des fichiers, (d) explique en deux phrases ce que l’humain doit vérifier avant d’ouvrir la PR.

Fiches de règles disponibles : ${RULE_KEYS.join(', ')}.
Scores d’audit (fidélité /100, calculés sur le CSS relevé : tokens 50 %, états 30 %, cohérence 20 %) : ${AUDIT.map(a => `${a.title} ${a.score}`).join(' · ')}.`;

  const TOOLS = [
    { name: 'lire_tokens', description: 'Lit les variables --chakra-* du thème (tokens.css). Filtre par préfixe (ex. "--chakra-colors-primary") ou par texte libre.', input_schema: { type: 'object', properties: { prefixe: { type: 'string' }, recherche: { type: 'string' } } } },
    { name: 'lire_regles', description: 'Lit une fiche de règles IA (rules/<fiche>.md).', input_schema: { type: 'object', properties: { fiche: { type: 'string', enum: RULE_KEYS } }, required: ['fiche'] } },
    { name: 'rechercher_css', description: 'Cherche dans components.css les règles Emotion d’une classe (ex. "css-umgg81" ou "chakra-button") ou contenant un texte (ex. "linear-gradient").', input_schema: { type: 'object', properties: { classe: { type: 'string' }, texte: { type: 'string' } } } },
    { name: 'scores_audit', description: 'Scores de fidélité de l’audit UI pour chaque composant, avec le détail (tokens, états, cohérence, valeurs en dur les plus fréquentes).', input_schema: { type: 'object', properties: { composant: { type: 'string' } } } },
    { name: 'lire_fichier', description: 'Lit le contenu courant d’un fichier du dépôt sur la branche main : orica/tokens.css, orica/rules/<fiche>.md, orica/changelog.json, orica/AGENTS.md, orica/README.md.', input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
    { name: 'proposer_modification', description: 'Enregistre une proposition de modification (contenu complet des fichiers). Elle sera affichée avec son diff et devra être validée par un humain, qui ouvrira la pull request. Fichiers autorisés : orica/tokens.css, orica/rules/<fiche>.md, orica/changelog.json.', input_schema: { type: 'object', properties: { titre: { type: 'string', description: 'Titre court de la PR, ex. « Tokens : primary-500 passe à #0F6B3F »' }, justification: { type: 'string' }, impact_theme: { type: 'string', description: 'Ce qui doit changer dans le thème Chakra d’Orica pour que la prod suive, ou « aucun » si la proposition ne touche que les règles/changelog.' }, fichiers: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, contenu: { type: 'string' } }, required: ['path', 'contenu'] } } }, required: ['titre', 'justification', 'impact_theme', 'fichiers'] } },
  ];

  /* ---- outils (exécutés dans la page) ---- */
  const cap = (s, n) => s.length > n ? s.slice(0, n) + `\n… (${s.length - n} caractères tronqués)` : s;
  const gh = async (p, opt = {}) => {
    const h = Object.assign({ Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opt.headers || {});
    if (settings.githubToken) h.Authorization = 'Bearer ' + settings.githubToken;
    const r = await fetch('https://api.github.com' + p, Object.assign({}, opt, { headers: h }));
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`GitHub ${r.status} : ${j.message || r.statusText}`);
    return j;
  };
  const b64utf8 = s => btoa(unescape(encodeURIComponent(s)));
  const fromB64 = s => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));
  async function readRepoFile(path) {
    if (!READABLE.some(re => re.test(path))) throw new Error('Fichier non lisible : ' + path);
    if (settings.githubToken) { const j = await gh(`/repos/${settings.owner}/${settings.repo}/contents/${path}?ref=${REPO.base}`); return { content: fromB64(j.content), sha: j.sha }; }
    const r = await fetch(`https://raw.githubusercontent.com/${settings.owner}/${settings.repo}/${REPO.base}/${path}?t=${Date.now()}`);
    if (!r.ok) throw new Error(`Lecture impossible (${r.status}) : ${path}`);
    return { content: await r.text(), sha: null };
  }
  const runTool = async (name, input) => {
    switch (name) {
      case 'lire_tokens': { const lines = TOKENS_CSS.split('\n').filter(l => l.includes('--chakra-')); const p = (input.prefixe || '').trim(), q = (input.recherche || '').trim().toLowerCase(); const out = lines.filter(l => (!p || l.trim().startsWith(p)) && (!q || l.toLowerCase().includes(q))); return out.length ? cap(out.slice(0, 150).join('\n'), 8000) + (out.length > 150 ? `\n… ${out.length - 150} autres lignes` : '') : 'Aucune variable ne correspond.'; }
      case 'lire_regles': return RULES_MD[input.fiche] || 'Fiche inconnue. Fiches : ' + RULE_KEYS.join(', ');
      case 'rechercher_css': { const c = (input.classe || '').replace(/^\./, '').trim(), t = (input.texte || '').trim(); if (!c && !t) return 'Donne une classe ou un texte.'; const rules = COMPONENTS_CSS.split('\n').filter(r => (!c || r.includes('.' + c)) && (!t || r.includes(t))); return rules.length ? cap(rules.slice(0, 40).join('\n'), 6000) + (rules.length > 40 ? `\n… ${rules.length - 40} autres règles` : '') : 'Aucune règle ne correspond.'; }
      case 'scores_audit': { const q = (input.composant || '').toLowerCase(); const list = AUDIT.filter(a => !q || a.id.includes(q) || a.title.toLowerCase().includes(q)); return JSON.stringify(list.map(a => ({ composant: a.title, id: a.id, score: a.score, tokens_pct: a.tokensPct, etats_pct: a.statesPct, coherence: a.consistency, variantes: a.variants, classes: a.classes, valeurs_en_dur: a.hardTop.slice(0, 4).map(h => `${h.k} ×${h.n}`), etats: a.states.map(s => `${s.k}:${s.ok ? 'oui' : 'non'}`), notes: a.notes, penalites: a.penalties })), null, 1); }
      case 'lire_fichier': { const f = await readRepoFile(input.path); return cap(f.content, 60000); }
      case 'proposer_modification': return await addProposal(input);
      default: return 'Outil inconnu.';
    }
  };

  /* ---- propositions & diff ---- */
  function diffLines(a, b) {
    const A = a.split('\n'), B = b.split('\n'); let s = 0; while (s < A.length && s < B.length && A[s] === B[s]) s++;
    let e = 0; while (e < A.length - s && e < B.length - s && A[A.length - 1 - e] === B[B.length - 1 - e]) e++;
    const ma = A.slice(s, A.length - e), mb = B.slice(s, B.length - e);
    const out = []; const ctx = 3;
    for (let i = Math.max(0, s - ctx); i < s; i++) out.push([' ', A[i]]);
    if (ma.length < 400 && mb.length < 400) { // LCS sur la zone modifiée
      const n = ma.length, m = mb.length; const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = ma[i] === mb[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      let i = 0, j = 0; while (i < n && j < m) { if (ma[i] === mb[j]) { out.push([' ', ma[i]]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) { out.push(['-', ma[i++]]); } else { out.push(['+', mb[j++]]); } }
      while (i < n) out.push(['-', ma[i++]]); while (j < m) out.push(['+', mb[j++]]);
    } else { ma.forEach(l => out.push(['-', l])); mb.forEach(l => out.push(['+', l])); }
    for (let i = A.length - e; i < Math.min(A.length, A.length - e + ctx); i++) out.push([' ', A[i]]);
    return { out, added: out.filter(x => x[0] === '+').length, removed: out.filter(x => x[0] === '-').length, before: s, after: e };
  }
  async function addProposal(input) {
    const files = Array.isArray(input.fichiers) ? input.fichiers : [];
    if (!files.length) return 'Refusé : aucun fichier.';
    const bad = files.filter(f => !EDITABLE.some(re => re.test(f.path)));
    if (bad.length) return 'Refusé : fichier(s) non modifiable(s) : ' + bad.map(f => f.path).join(', ') + '. Autorisés : orica/tokens.css, orica/rules/<fiche>.md, orica/changelog.json.';
    for (const f of files) { if (f.path.endsWith('.json')) { try { const j = JSON.parse(f.contenu); if (!Array.isArray(j)) throw 0; } catch (e) { return 'Refusé : ' + f.path + ' doit être un tableau JSON valide.'; } } if (f.path.endsWith('tokens.css') && !/^:root, :host \{/.test(f.contenu.trim())) return 'Refusé : tokens.css doit garder le bloc « :root, :host { … } ».'; }
    const current = {}; for (const f of files) { try { current[f.path] = await readRepoFile(f.path); } catch (e) { current[f.path] = { content: '', sha: null }; } }
    const diffs = files.map(f => ({ path: f.path, content: f.contenu, sha: current[f.path].sha, diff: diffLines(current[f.path].content, f.contenu) }));
    if (diffs.every(d => d.diff.added === 0 && d.diff.removed === 0)) return 'Refusé : le contenu proposé est identique au fichier courant.';
    const p = { id: st.proposals.length + 1, titre: input.titre || 'Proposition', justification: input.justification || '', impact: input.impact_theme || '', files: diffs, status: 'proposée', pr: null };
    st.proposals.push(p); renderProposal(p);
    return `Proposition #${p.id} enregistrée (${diffs.map(d => `${d.path} : +${d.diff.added} −${d.diff.removed}`).join(', ')}). Elle attend une validation humaine dans la documentation ; n’ouvre pas de PR toi-même et ne considère rien comme appliqué.`;
  }
  const tokenChanges = p => { const f = p.files.find(x => x.path.endsWith('tokens.css')); if (!f) return []; const cur = {}; for (const m of TOKENS_CSS.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) cur[m[1]] = m[2].trim(); const ch = []; for (const m of f.content.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) if (cur[m[1]] !== undefined && cur[m[1]] !== m[2].trim()) ch.push([m[1], cur[m[1]], m[2].trim()]); return ch; };
  function setPreview(p) {
    const ch = p ? tokenChanges(p) : [];
    st.previewOn = ch.length ? p.id : null;
    if (typeof setPreviewTokens === 'function') setPreviewTokens(ch.length ? ':host{' + ch.map(([k, , v]) => `${k}:${v};`).join('') + '}' : '');
    document.querySelectorAll('.chat-prop').forEach(el => el.classList.toggle('is-preview', +el.dataset.id === st.previewOn));
    document.body.classList.toggle('has-preview', !!st.previewOn);
    const bar = document.getElementById('previewBar'); if (bar) { bar.hidden = !st.previewOn; if (st.previewOn) bar.querySelector('span').textContent = `Aperçu de la proposition #${p.id} : ${ch.length} token${ch.length > 1 ? 's' : ''} modifié${ch.length > 1 ? 's' : ''} dans les aperçus (${ch.slice(0, 3).map(c => c[0].replace('--chakra-', '')).join(', ')}${ch.length > 3 ? '…' : ''})`; }
  }
  async function openPR(p, btn) {
    if (!settings.githubToken) { openSettings('Un jeton GitHub est nécessaire pour ouvrir la pull request.'); return; }
    btn.disabled = true; btn.textContent = 'Ouverture…';
    try {
      const { owner, repo } = settings; const base = REPO.base;
      const me = await gh('/user');
      const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/${base}`);
      const slug = p.titre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'proposition';
      const branch = `proposition/${new Date().toISOString().slice(0, 10)}-${slug}-${Math.random().toString(36).slice(2, 6)}`;
      await gh(`/repos/${owner}/${repo}/git/refs`, { method: 'POST', body: JSON.stringify({ ref: 'refs/heads/' + branch, sha: ref.object.sha }) });
      for (const f of p.files) {
        let sha = f.sha; if (!sha) { try { sha = (await gh(`/repos/${owner}/${repo}/contents/${f.path}?ref=${base}`)).sha; } catch (e) { sha = undefined; } }
        await gh(`/repos/${owner}/${repo}/contents/${f.path}`, { method: 'PUT', body: JSON.stringify({ message: `${p.titre} (${f.path})`, content: b64utf8(f.content), branch, sha: sha || undefined }) });
      }
      const body = `## Proposition ouverte depuis la documentation (chat)\n\n**Justification**\n${p.justification || '—'}\n\n**Impact sur le thème Chakra d’Orica**\n${p.impact || '—'}\n\n**Fichiers**\n${p.files.map(f => `- \`${f.path}\` (+${f.diff.added} / −${f.diff.removed})`).join('\n')}\n\n> ⚠️ **Garde-fou** — cette documentation est un relevé ISO de la production. Fusionner cette PR change la documentation et ses règles, pas l’application : le changement doit être répercuté dans le thème Chakra d’Orica, sinon le prochain relevé et l’audit signaleront l’écart.\n\n- [ ] Validé par un designer\n- [ ] Répercuté (ou planifié) dans le thème Orica : _lien_\n\n_Proposée par ${me.login} via le chat de la doc · modèle ${settings.model}_`;
      const pr = await gh(`/repos/${owner}/${repo}/pulls`, { method: 'POST', body: JSON.stringify({ title: p.titre, head: branch, base, body }) });
      p.status = 'pull request ouverte'; p.pr = { number: pr.number, url: pr.html_url, branch };
      prs.unshift({ number: pr.number, url: pr.html_url, title: p.titre, date: new Date().toISOString() }); prs = prs.slice(0, 20); save(LSPR, prs);
      renderProposal(p, true); renderPRs();
      pushMessage('assistant', `Pull request #${pr.number} ouverte : ${pr.html_url}\nÀ la fusion, la documentation est régénérée par GitHub Actions. Pense à répercuter le changement dans le thème Orica.`, { system: true });
      addToHistory('user', `[Système] L’humain a validé la proposition #${p.id} : pull request #${pr.number} ouverte (${pr.html_url}). Rien n’est encore fusionné.`);
    } catch (e) { btn.disabled = false; btn.textContent = 'Ouvrir la pull request'; pushMessage('assistant', 'Impossible d’ouvrir la pull request : ' + e.message, { error: true }); }
  }

  /* ---- UI ---- */
  const ICON = { chat: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z"/></svg>', close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>', gear: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>', send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>', warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>', pr: '<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/></svg>' };
  const panel = document.createElement('aside'); panel.id = 'chat'; panel.hidden = true; panel.setAttribute('aria-label', 'Chat du design system');
  panel.innerHTML = `
    <header class="chat-head"><span class="chat-badge">${ICON.chat}</span><div><strong>Chat du design system</strong><span>Orica · propositions → pull requests</span></div><button type="button" class="chat-ib" id="chatSettings" aria-label="Réglages">${ICON.gear}</button><button type="button" class="chat-ib" id="chatClose" aria-label="Fermer">${ICON.close}</button></header>
    <div class="chat-guard">${ICON.warn}<p><strong>Documentation synchronisée avec la production.</strong> Le chat ne modifie rien directement : chaque évolution devient une proposition, puis une pull request à valider.</p></div>
    <div class="chat-log" id="chatLog"></div>
    <div class="chat-prs" id="chatPRs" hidden></div>
    <form class="chat-form" id="chatForm"><textarea id="chatInput" rows="1" placeholder="Poser une question ou décrire une évolution…" aria-label="Message"></textarea><button type="submit" class="chat-send" id="chatSend" aria-label="Envoyer">${ICON.send}</button></form>
    <div class="chat-modal" id="chatModal" hidden><div class="chat-modal-card">
      <div class="chat-modal-head"><h2>Réglages</h2><button type="button" class="chat-ib" id="chatModalClose" aria-label="Fermer">${ICON.close}</button></div>
      <p class="chat-modal-note" id="chatModalNote" hidden></p>
      <p class="muted">Les clés restent dans ce navigateur (localStorage) et ne transitent que vers api.anthropic.com et api.github.com. Ne pas utiliser sur un poste partagé.</p>
      <label>Clé API Anthropic<input type="password" id="setKey" autocomplete="off" placeholder="sk-ant-…"></label>
      <label>Modèle<select id="setModel">${MODELS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
      <label>Jeton GitHub (fine-grained : Contents et Pull requests en écriture sur ${REPO.owner}/${REPO.name})<input type="password" id="setGh" autocomplete="off" placeholder="github_pat_…"></label>
      <div class="chat-row"><label>Propriétaire<input type="text" id="setOwner"></label><label>Dépôt<input type="text" id="setRepo"></label></div>
      <div class="chat-modal-actions"><button type="button" class="chat-btn" id="setTest">Tester GitHub</button><span id="setTestOut" class="muted"></span><button type="button" class="chat-btn chat-btn--primary" id="setSave">Enregistrer</button></div>
    </div></div>`;
  document.body.appendChild(panel);
  const bar = document.createElement('div'); bar.id = 'previewBar'; bar.hidden = true; bar.innerHTML = `${ICON.warn}<span></span><button type="button" id="previewOff">Retirer l’aperçu</button>`; document.body.appendChild(bar);
  bar.querySelector('#previewOff').addEventListener('click', () => setPreview(null));
  const $ = s => panel.querySelector(s); const log = $('#chatLog'), input = $('#chatInput'), sendBtn = $('#chatSend');

  function openSettings(note) { const m = $('#chatModal'); m.hidden = false; $('#setKey').value = settings.anthropicKey; $('#setModel').value = settings.model; $('#setGh').value = settings.githubToken; $('#setOwner').value = settings.owner; $('#setRepo').value = settings.repo; const n = $('#chatModalNote'); n.hidden = !note; n.textContent = note || ''; $('#setTestOut').textContent = ''; }
  $('#chatSettings').addEventListener('click', () => openSettings());
  $('#chatModalClose').addEventListener('click', () => { $('#chatModal').hidden = true; });
  $('#chatModal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.hidden = true; });
  $('#setSave').addEventListener('click', () => { settings = { anthropicKey: $('#setKey').value.trim(), model: $('#setModel').value, githubToken: $('#setGh').value.trim(), owner: $('#setOwner').value.trim() || REPO.owner, repo: $('#setRepo').value.trim() || REPO.name }; save(LS, settings); $('#chatModal').hidden = true; renderEmpty(); });
  $('#setTest').addEventListener('click', async () => { const o = $('#setTestOut'); o.textContent = 'Test…'; const prev = settings; settings = Object.assign({}, settings, { githubToken: $('#setGh').value.trim(), owner: $('#setOwner').value.trim() || REPO.owner, repo: $('#setRepo').value.trim() || REPO.name }); try { const me = await gh('/user'); const r = await gh(`/repos/${settings.owner}/${settings.repo}`); o.textContent = `OK : ${me.login} · ${r.full_name} · push ${r.permissions && r.permissions.push ? 'oui' : 'non'}`; } catch (e) { o.textContent = e.message; } finally { settings = prev; } });

  function openChat() { if (document.body.classList.contains('is-audit')) location.hash = ''; st.open = true; panel.hidden = false; document.body.classList.add('chat-open'); if (!log.children.length) renderEmpty(); renderPRs(); setTimeout(() => input.focus(), 50); }
  function closeChat() { st.open = false; panel.hidden = true; document.body.classList.remove('chat-open'); }
  $('#chatClose').addEventListener('click', closeChat);
  const btn = document.getElementById('chatBtn'); if (btn) btn.addEventListener('click', () => st.open ? closeChat() : openChat());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && st.open && !document.body.classList.contains('is-audit')) { if (!$('#chatModal').hidden) { $('#chatModal').hidden = true; return; } if (document.activeElement === input && input.value) return; closeChat(); } });

  const SUGGEST = ['Pourquoi Avatar est à 72 ?', 'Quelles valeurs en dur dans Bouton ?', 'Propose d’assombrir primary-500 pour le contraste', 'Ajoute à la fiche bouton : un seul bouton primaire par écran', 'Ajoute une entrée de changelog pour le mode Play'];
  function renderEmpty() {
    log.innerHTML = `<div class="chat-empty">${settings.anthropicKey ? '' : `<p class="chat-setup">${ICON.warn} Pas encore de clé API Anthropic : <button type="button" class="chat-link" id="chatGoSettings">ouvrir les réglages</button>.</p>`}<p class="label">Pour commencer</p><div class="chat-suggest">${SUGGEST.map(s => `<button type="button">${esc(s)}</button>`).join('')}</div><p class="muted">Lecture : tokens, règles, CSS relevé, scores d’audit. Évolution : proposition avec diff, aperçu dans la doc pour les tokens, puis pull request.</p></div>`;
    const g = $('#chatGoSettings'); if (g) g.addEventListener('click', () => openSettings());
    log.querySelectorAll('.chat-suggest button').forEach(b => b.addEventListener('click', () => { input.value = b.textContent; send(); }));
  }
  function md(t) { // rendu minimal : paragraphes, listes, code, gras, liens
    const blocks = t.split(/```/); let h = '';
    blocks.forEach((b, i) => {
      if (i % 2) { h += `<pre><code>${esc(b.replace(/^[a-z]*\n/, ''))}</code></pre>`; return; }
      const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      b.split(/\n{2,}/).forEach(par => { const lines = par.split('\n').filter(Boolean); if (!lines.length) return; if (lines.every(l => /^\s*[-*•]\s/.test(l))) h += `<ul>${lines.map(l => `<li>${inline(l.replace(/^\s*[-*•]\s/, ''))}</li>`).join('')}</ul>`; else if (lines.every(l => /^\s*\d+[.)]\s/.test(l))) h += `<ol>${lines.map(l => `<li>${inline(l.replace(/^\s*\d+[.)]\s/, ''))}</li>`).join('')}</ol>`; else h += `<p>${lines.map(inline).join('<br>')}</p>`; });
    });
    return h;
  }
  function pushMessage(role, text, opts = {}) {
    const empty = log.querySelector('.chat-empty'); if (empty) empty.remove();
    const el = document.createElement('div'); el.className = `chat-msg is-${role}${opts.error ? ' is-error' : ''}${opts.system ? ' is-system' : ''}`; el.innerHTML = md(text); log.appendChild(el); log.scrollTop = log.scrollHeight; return el;
  }
  function pushTool(name, input) { const el = document.createElement('div'); el.className = 'chat-tool'; const arg = Object.values(input || {}).find(v => typeof v === 'string') || ''; el.innerHTML = `<i></i>${esc({ lire_tokens: 'lit les tokens', lire_regles: 'lit la fiche', rechercher_css: 'cherche dans le CSS', scores_audit: 'consulte l’audit', lire_fichier: 'lit le fichier', proposer_modification: 'prépare une proposition' }[name] || name)} <code>${esc(String(arg).slice(0, 48))}</code>`; log.appendChild(el); log.scrollTop = log.scrollHeight; return el; }
  function renderProposal(p, replace) {
    let el = log.querySelector(`.chat-prop[data-id="${p.id}"]`); if (!el) { el = document.createElement('div'); el.className = 'chat-prop'; el.dataset.id = p.id; log.appendChild(el); }
    const tok = tokenChanges(p);
    el.innerHTML = `<div class="chat-prop-head"><span class="label">Proposition #${p.id} · ${esc(p.status)}</span><h3>${esc(p.titre)}</h3></div>
      <p>${esc(p.justification)}</p>
      <div class="chat-prop-impact"><span class="label">Impact thème Chakra</span><p>${esc(p.impact || '—')}</p></div>
      ${p.files.map(f => `<details class="chat-diff" open><summary><code>${esc(f.path)}</code><span class="add">+${f.diff.added}</span><span class="del">−${f.diff.removed}</span></summary><pre>${f.diff.before > 0 ? `<i>… ${f.diff.before} ligne${f.diff.before > 1 ? 's' : ''} inchangée${f.diff.before > 1 ? 's' : ''}</i>\n` : ''}${f.diff.out.map(([k, l]) => `<span class="${k === '+' ? 'add' : k === '-' ? 'del' : 'ctx'}">${k} ${esc(l)}</span>`).join('\n')}${f.diff.after > 0 ? `\n<i>… ${f.diff.after} ligne${f.diff.after > 1 ? 's' : ''} inchangée${f.diff.after > 1 ? 's' : ''}</i>` : ''}</pre></details>`).join('')}
      <div class="chat-prop-actions">${p.pr ? `<a class="chat-btn chat-btn--primary" href="${esc(p.pr.url)}" target="_blank" rel="noopener">${ICON.pr} Pull request #${p.pr.number}</a><span class="muted">branche <code>${esc(p.pr.branch)}</code></span>` : `${tok.length ? `<button type="button" class="chat-btn" data-act="preview">${st.previewOn === p.id ? 'Retirer l’aperçu' : 'Aperçu dans la doc'}</button>` : ''}<button type="button" class="chat-btn chat-btn--primary" data-act="pr">${ICON.pr} Ouvrir la pull request</button>`}</div>`;
    el.classList.toggle('is-preview', st.previewOn === p.id);
    el.querySelector('[data-act="preview"]')?.addEventListener('click', () => { setPreview(st.previewOn === p.id ? null : p); renderProposal(p, true); });
    el.querySelector('[data-act="pr"]')?.addEventListener('click', e => openPR(p, e.currentTarget));
    if (!replace) log.scrollTop = log.scrollHeight;
  }
  function renderPRs() { const box = $('#chatPRs'); if (!prs.length) { box.hidden = true; return; } box.hidden = false; box.innerHTML = `<span class="label">Pull requests ouvertes depuis la doc</span>${prs.slice(0, 5).map(p => `<a href="${esc(p.url)}" target="_blank" rel="noopener">${ICON.pr} #${p.number} ${esc(p.title)}</a>`).join('')}`; }

  /* ---- boucle modèle ---- */
  function addToHistory(role, content) { st.messages.push({ role, content }); }
  async function callModel() {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: st.abort.signal, headers: { 'content-type': 'application/json', 'x-api-key': settings.anthropicKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: settings.model, max_tokens: 4096, system: SYSTEM, tools: TOOLS, messages: st.messages }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((j.error && j.error.message) || `API ${r.status}`);
    return j;
  }
  async function send() {
    const text = input.value.trim(); if (!text || st.busy) return;
    if (!settings.anthropicKey) { openSettings('Renseigne une clé API Anthropic pour utiliser le chat.'); return; }
    input.value = ''; input.style.height = ''; pushMessage('user', text); addToHistory('user', text);
    st.busy = true; sendBtn.disabled = true; st.abort = new AbortController();
    const thinking = document.createElement('div'); thinking.className = 'chat-msg is-assistant is-thinking'; thinking.textContent = 'Réfléchit…'; log.appendChild(thinking); log.scrollTop = log.scrollHeight;
    try {
      for (let turn = 0; turn < 12; turn++) {
        const res = await callModel();
        const content = res.content || [];
        addToHistory('assistant', content);
        const texts = content.filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
        if (texts) { thinking.remove(); pushMessage('assistant', texts); }
        const uses = content.filter(c => c.type === 'tool_use');
        if (!uses.length || res.stop_reason !== 'tool_use') break;
        const results = [];
        for (const u of uses) { const chip = pushTool(u.name, u.input); let out; try { out = await runTool(u.name, u.input || {}); chip.classList.add('is-done'); } catch (e) { out = 'Erreur : ' + e.message; chip.classList.add('is-error'); } results.push({ type: 'tool_result', tool_use_id: u.id, content: String(out) }); }
        addToHistory('user', results);
        if (!log.contains(thinking)) { log.appendChild(thinking); } log.scrollTop = log.scrollHeight;
      }
    } catch (e) { thinking.remove(); if (e.name !== 'AbortError') pushMessage('assistant', 'Erreur : ' + e.message + (/401|authentication|api[- ]key/i.test(e.message) ? ' — vérifie la clé dans les réglages.' : /Failed to fetch/.test(e.message) ? ' — appel bloqué (réseau, extension ou CSP). Le chat fonctionne sur la version GitHub Pages de la doc.' : ''), { error: true }); }
    finally { thinking.remove(); st.busy = false; sendBtn.disabled = false; input.focus(); }
  }
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); send(); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  input.addEventListener('input', () => { input.style.height = ''; input.style.height = Math.min(160, input.scrollHeight) + 'px'; });
  window.__chat = { open: openChat, close: closeChat, runTool, diffLines, addProposal, get proposals() { return st.proposals; }, get settings() { return settings; } };
})();
