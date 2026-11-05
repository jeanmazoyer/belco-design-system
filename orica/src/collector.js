// Runs in the Orica page. Collects, for the current screen: all stylesheet rules, the chakra->emotion class map,
// and one HTML+CSS sample per distinct component (deduped by emotion class signature). Stores in window.__iso.
(function(){
const rules=[];for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch(e){continue}for(const r of rs){if(r.type===1)rules.push(r.cssText);else if(r.type===4){for(const rr of r.cssRules)if(rr.type===1)rules.push('@media '+r.conditionText+' { '+rr.cssText+' }')}else if(r.type===7)rules.push(r.cssText)}}
const byClass={};rules.forEach(r=>{const m=r.match(/\.css-[a-z0-9]+/g);if(!m)return;[...new Set(m)].forEach(c=>{(byClass[c.slice(1)]=byClass[c.slice(1)]||[]).push(r)})});
const cssFor=el=>[...el.classList].filter(c=>c.startsWith('css-')).flatMap(c=>byClass[c]||[]);
const collect=root=>{const set=new Set();[root,...root.querySelectorAll('*')].forEach(e=>cssFor(e).forEach(r=>set.add(r)));return [...set]};
const sig=el=>[...el.classList].filter(c=>c.startsWith('css-')||c.startsWith('chakra-')).join(' ');
const html=el=>el.outerHTML;
const targets={
 button:'.chakra-button',tabs:'.chakra-tabs__tablist',select:'.chakra-select__wrapper',input:'.chakra-input__group, .chakra-input:not(.chakra-input__group .chakra-input)',textarea:'.chakra-textarea',checkbox:'.chakra-checkbox',radio:'.chakra-radio',switch:'.chakra-switch',menu:'.chakra-menu__menu-list',menuitem:'.chakra-menu__menuitem, .chakra-menu__menuitem-option',avatar:'.chakra-avatar',heading:'.chakra-heading',divider:'.chakra-divider',badge:'.chakra-badge',tag:'.chakra-tag',table:'.chakra-table__container, .chakra-table',thead:'.chakra-table thead',tr:'.chakra-table tbody tr',card:'.chakra-card',progress:'.chakra-progress',accordion:'.chakra-accordion__item',modal:'.chakra-modal__content',drawer:'.chakra-slide, .chakra-modal__content-container',tooltip:'.chakra-tooltip',alert:'.chakra-alert',toast:'.chakra-toast',formlabel:'.chakra-form__label',formcontrol:'.chakra-form-control',breadcrumb:'.chakra-breadcrumb',skeleton:'.chakra-skeleton',spinner:'.chakra-spinner',link:'.chakra-link',stat:'.chakra-stat',popover:'.chakra-popover__content',numberinput:'.chakra-numberinput',pininput:'.chakra-pin-input',tagLike:'[class*="chakra-tag"]',wrap:'.chakra-wrap'
};
const samples={};
for(const [name,q] of Object.entries(targets)){let els;try{els=[...document.querySelectorAll(q)]}catch(e){continue}
 const seen={};els.forEach(el=>{const s=sig(el);if(!s||seen[s])return;if(el.offsetHeight===0&&!el.closest('.chakra-portal')&&name!=='menu')return;seen[s]=1;const h=html(el);if(h.length>12000)return;samples[name+'|'+s]={name,sig:s,text:el.textContent.trim().replace(/\s+/g,' ').slice(0,60),html:h,rules:collect(el)}})}
// page-level scaffolding: sidebar rail, header, env banner — by position
const rail=[...document.querySelectorAll('nav,aside,div')].find(e=>{const r=e.getBoundingClientRect();return r.left===0&&r.width>50&&r.width<120&&r.height>400});
if(rail)samples['rail|'+sig(rail)]={name:'rail',sig:sig(rail),html:html(rail).slice(0,20000),rules:collect(rail)};
const header=[...document.querySelectorAll('header,div')].find(e=>{const r=e.getBoundingClientRect();return r.top<30&&r.height>50&&r.height<90&&r.width>800&&e.querySelector('h1,h2,.chakra-heading')});
if(header)samples['pagehead|'+sig(header)]={name:'pagehead',sig:sig(header),html:html(header).slice(0,20000),rules:collect(header)};
const env=[...document.querySelectorAll('div')].find(e=>{const r=e.getBoundingClientRect();return r.top===0&&r.height<30&&r.width>800&&e.textContent.trim().length>5&&e.children.length<4});
if(env)samples['env|'+sig(env)]={name:'env',sig:sig(env),html:html(env),rules:collect(env)};
window.__iso={url:location.pathname,rules,samples,byClassCount:Object.keys(byClass).length};
return JSON.stringify({url:location.pathname,rules:rules.length,samples:Object.keys(samples).length,names:[...new Set(Object.values(samples).map(s=>s.name))]});
})()
