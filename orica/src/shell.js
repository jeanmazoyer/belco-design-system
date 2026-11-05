/* ---------- rendu ISO : chaque aperçu est un shadow root avec les règles de la prod ---------- */
let sharedSheet=null, compSheet=null, previewSheet=null;
function sheets(){
  if(sharedSheet) return [sharedSheet, compSheet, previewSheet];
  try{ sharedSheet=new CSSStyleSheet(); sharedSheet.replaceSync(SHARED_CSS.replace(/:root, :host/g,':host')); compSheet=new CSSStyleSheet(); compSheet.replaceSync(COMPONENTS_CSS); previewSheet=new CSSStyleSheet(); }catch(e){ sharedSheet=null; }
  return [sharedSheet, compSheet, previewSheet];
}
// aperçu d'une proposition de tokens : une feuille partagée par tous les shadow roots, vide par défaut
function setPreviewTokens(css){ const [,,pv]=sheets(); if(pv){ try{ pv.replaceSync(css||''); }catch(e){} } }
function mountShadows(root){
  root.querySelectorAll('[data-shadow-host]').forEach(host=>{
    if(host.shadowRoot) return;
    const tpl=host.nextElementSibling && host.nextElementSibling.matches('template[data-shadow]') ? host.nextElementSibling : null;
    if(!tpl) return;
    const sh=host.attachShadow({mode:'open'});
    const [a,b,pv]=sheets();
    if(a&&sh.adoptedStyleSheets!==undefined){ sh.adoptedStyleSheets=[a,b,pv]; }
    else { const st=document.createElement('style'); st.textContent=SHARED_CSS.replace(/:root, :host/g,':host')+'\n'+COMPONENTS_CSS; sh.appendChild(st); }
    const wrap=document.createElement('div'); wrap.className='chakra-ui-light'; wrap.style.cssText='font-family:var(--chakra-fonts-body);color:var(--chakra-colors-dark-500);font-size:var(--chakra-fontSizes-md);line-height:1.5;-webkit-font-smoothing:antialiased;text-rendering:optimizelegibility;font-feature-settings:"kern";position:relative;transform:translateZ(0);contain:layout paint;overflow:hidden;display:flex;flex-wrap:wrap;gap:14px;align-items:center;width:100%';
    if(host.style.minHeight) wrap.style.minHeight=host.style.minHeight;
    if(host.classList.contains('is-block')) wrap.style.cssText+=';display:block';
    wrap.innerHTML=tpl.innerHTML;
    // les liens et boutons ne doivent pas naviguer
    wrap.querySelectorAll('a[href]').forEach(x=>{x.setAttribute('data-href',x.getAttribute('href'));x.removeAttribute('href');});
    wrap.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>e.preventDefault()));
    sh.appendChild(wrap);
  });
}
/* ---------- shell ---------- */
const $=s=>document.querySelector(s);
const navEl=$('#nav'), pageEl=$('#page'), q=$('#q');
const FLAT=NAV.flatMap(g=>g.items.map(i=>({...i,group:g.group})));
const EXTRA=[{id:'changelog',label:'Changelog',top:'changelog'},{id:'mcp',label:'MCP',top:'mcp'}];
const chevL='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
const chevR='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
function buildNav(){
  navEl.innerHTML=NAV.map(g=>`<div class="nav-group"><a class="group-title" href="#${g.home}">${g.group}</a>${g.items.map(i=>`<a class="nav-item ${i.soon?'is-soon':''}" href="#${i.id}" data-id="${i.id}"><span>${i.label}</span>${i.soon?'<span class="soon">Soon</span>':''}</a>`).join('')}</div>`).join('')+'<div class="nav-empty" id="navEmpty" hidden>Aucun résultat.</div>';
}
function currentId(){const h=(location.hash||'').replace(/^#/,'');return PAGES.some(p=>p.id===h)?h:'introduction';}
function render(){
  if((location.hash||'').replace(/^#/,'')==='audit'){ if(window.__audit) window.__audit.open(); return; }
  if(window.__audit){ window.__audit.close(); window.__audit.setLast(location.hash||'#introduction'); }
  const id=currentId(); const p=PAGES.find(x=>x.id===id);
  const idx=FLAT.findIndex(i=>i.id===id); const prev=p.nopager?null:FLAT[idx-1], next=p.nopager?null:FLAT[idx+1];
  const top=(EXTRA.find(e=>e.id===id)||{}).top||'ds';
  document.querySelectorAll('.topnav a').forEach(a=>a.classList.toggle('is-active',a.dataset.top===top));
  pageEl.innerHTML=`<header class="page-head"><span class="label">${p.group}</span><div class="head-row"><h1>${p.title}</h1>${p.soon?'<span class="soon">Soon</span>':''}</div>${p.lede?`<p class="lede">${p.lede}</p>`:''}</header>${p.body||''}${p.nopager?'':`<nav class="pager" aria-label="Pages voisines">${prev?`<a class="prev" href="#${prev.id}"><span class="label">Précédent</span><strong>${chevL} ${prev.label}</strong></a>`:'<span></span>'}${next?`<a class="next" href="#${next.id}"><span class="label">Suivant</span><strong>${next.label} ${chevR}</strong></a>`:''}</nav>`}`;
  const grid=$('#compGrid'); if(grid) grid.innerHTML=COMP.map(c=>`<a href="#${c.id}" class="${c.soon?'is-soon':''}">${c.title}${c.soon?'<span class="soon">Soon</span>':chevR}</a>`).join('');
  document.querySelectorAll('.nav-item').forEach(a=>a.classList.toggle('is-active',a.dataset.id===id));
  mountShadows(pageEl);
  document.body.classList.remove('nav-open'); window.scrollTo({top:0});
  const active=document.querySelector('.nav-item.is-active'); if(active) active.scrollIntoView({block:'nearest'});
}
pageEl.addEventListener('click',e=>{
  const t=e.target.closest('.demo-toggle');
  if(t){const panel=t.nextElementSibling;if(panel&&panel.classList.contains('demo-panel')){panel.hidden=!panel.hidden;t.classList.toggle('is-on',!panel.hidden);if(t.dataset.panel==='code')t.querySelector('span').textContent=panel.hidden?'Afficher le code':'Masquer le code';}return;}
  const tab=e.target.closest('.demo-tabs button');
  if(tab){const panel=tab.closest('.demo-code');panel.querySelectorAll('.demo-tabs button').forEach(b=>b.classList.toggle('is-on',b===tab));const l=tab.dataset.lang;panel.querySelectorAll('pre').forEach(pre=>pre.hidden=!pre.hasAttribute('data-'+l));const file=panel.querySelector('.demo-tabs .demo-file');if(file)file.textContent=l==='css'?'components.css':l==='tokens'?'tokens.css':'samples/…html';return;}
  const cp=e.target.closest('.copy'); if(cp){const pre=[...cp.parentElement.querySelectorAll('pre')].find(p=>!p.hidden)||cp.parentElement.querySelector('pre');copyText(cp,pre.textContent,pre);return;}
  const b=e.target.closest('#copyAgents,#copyTokens,#copyCss'); if(b){copyText(b,b.id==='copyAgents'?AGENTS:b.id==='copyTokens'?TOKENS_CSS:COMPONENTS_CSS,$('#agentsCode'));return;}
});
function selectText(el){if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);}
function copyText(btn,txt,fb){const label=btn.textContent;const done=()=>{btn.textContent='Copié';setTimeout(()=>btn.textContent=label,1500);};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done).catch(()=>selectText(fb));else selectText(fb);}
$('#menuBtn').addEventListener('click',()=>document.body.classList.toggle('nav-open'));
$('#scrim').addEventListener('click',()=>document.body.classList.remove('nav-open'));
navEl.addEventListener('click',e=>{if(e.target.closest('.nav-item'))document.body.classList.remove('nav-open');});
q.addEventListener('input',()=>{const v=q.value.trim().toLowerCase();let n=0;document.querySelectorAll('.nav-item').forEach(a=>{const p=PAGES.find(x=>x.id===a.dataset.id);const hay=(a.textContent+' '+(p?p.body:'')).toLowerCase();const ok=!v||hay.includes(v);a.hidden=!ok;if(ok)n++;});document.querySelectorAll('.nav-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.nav-item')].some(a=>!a.hidden);});$('#navEmpty').hidden=n>0;if(v&&window.innerWidth<=900)document.body.classList.add('nav-open');});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();q.focus();q.select();}if(e.key==='Escape'){document.body.classList.remove('nav-open');if(document.activeElement===q){q.value='';q.dispatchEvent(new Event('input'));q.blur();}}});
buildNav(); window.addEventListener('hashchange',render); render();
