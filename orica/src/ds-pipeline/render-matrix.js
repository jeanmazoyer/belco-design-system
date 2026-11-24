// Rend chaque combinaison variant × size × colorScheme des composants du thème pour nommer les classes servies en prod
// avec leurs props DS (ex. css-umgg81 → Button solid md primary). Sortie : out/matrix.json { "css-xxx": { component, props } }
process.env.NODE_ENV = 'production';
const fs = require('fs');
const React = require('react'); const { renderToString } = require('react-dom/server');
const createCache = require('@emotion/cache').default; const { CacheProvider } = require('@emotion/react'); const createEmotionServer = require('@emotion/server/create-instance').default;
const C = require('@chakra-ui/react'); const theme = require('./out/theme.cjs').default;
const { chromium } = require('playwright');
const T = theme.components;
const schemes = ['primary', 'brand', 'gray', 'darkGray', 'white', 'dark', 'sand', 'lightGreen', 'darkGreen', 'kaki', 'green', 'red', 'blue', 'cacao'];
const combos = (name, Comp, dims, mk) => { const out = []; const vs = dims.variant ? (T[name].variants ? Object.keys(T[name].variants) : [undefined]) : [undefined]; const ss = dims.size ? (T[name].sizes ? Object.keys(T[name].sizes) : [undefined]) : [undefined]; const cs = dims.colorScheme ? schemes : [undefined]; for (const v of vs) for (const s of ss) for (const c of cs) { const props = {}; if (v) props.variant = v; if (s) props.size = s; if (c) props.colorScheme = c; out.push({ component: name, props, el: mk(props) }); } return out; };
const h = React.createElement;
const list = [
  ...combos('Button', C.Button, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Button, p, 'Bouton')),
  ...combos('Button', C.IconButton, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.IconButton, { ...p, 'aria-label': 'x', icon: h('svg') })).map(x => ({ ...x, component: 'IconButton' })),
  ...combos('Tag', C.Tag, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Tag, p, 'Tag')),
  ...combos('Badge', C.Badge, { variant: 1, colorScheme: 1 }, p => h(C.Badge, p, '12')),
  ...combos('Input', C.Input, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Input, p)),
  ...combos('Select', C.Select, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Select, p)),
  ...combos('Textarea', C.Textarea, { variant: 1, size: 1 }, p => h(C.Textarea, p)),
  ...combos('Tabs', C.Tabs, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Tabs, p, h(C.TabList, null, h(C.Tab, null, 'A'), h(C.Tab, null, 'B')))),
  ...combos('Checkbox', C.Checkbox, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Checkbox, p, 'Case')),
  ...combos('Radio', C.Radio, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Radio, p, 'Radio')),
  ...combos('Switch', C.Switch, { size: 1, colorScheme: 1 }, p => h(C.Switch, p)),
  ...combos('Avatar', C.Avatar, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Avatar, { ...p, name: 'A B' })),
  ...combos('Heading', C.Heading, { size: 1 }, p => h(C.Heading, p, 'Titre')),
  ...combos('Table', C.Table, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.TableContainer, null, h(C.Table, p, h(C.Thead, null, h(C.Tr, null, h(C.Th, null, 'a'))), h(C.Tbody, null, h(C.Tr, null, h(C.Td, null, 'b')))))),
  ...combos('Accordion', C.Accordion, { variant: 1 }, p => h(C.Accordion, p, h(C.AccordionItem, null, h(C.AccordionButton, null, 'x'), h(C.AccordionPanel, null, 'y')))),
  ...combos('Progress', C.Progress, { variant: 1, size: 1, colorScheme: 1 }, p => h(C.Progress, { ...p, value: 40 })),
  ...combos('Link', C.Link, {}, p => h(C.Link, p, 'lien')),
  ...combos('FormLabel', C.FormLabel, { size: 1 }, p => h(C.FormControl, null, h(C.FormLabel, p, 'Libellé'))),
  ...combos('Divider', C.Divider, { variant: 1 }, p => h(C.Divider, p)),
  ...combos('Menu', C.Menu, { variant: 1 }, p => h(C.Menu, { ...p, isOpen: true }, h(C.MenuButton, null, 'm'), h(C.MenuList, null, h(C.MenuItem, null, 'i')))),
];
(async () => {
  const b = await chromium.launch(); const page = await b.newPage(); await page.setContent('<!doctype html><html><head></head><body></body></html>');
  const matrix = {}; const rulesByClass = {};
  for (const it of list) {
    const cache = createCache({ key: 'css' }); const { extractCritical } = createEmotionServer(cache);
    let html, css; try { const out = extractCritical(renderToString(h(CacheProvider, { value: cache }, h(C.ChakraProvider, { theme, resetCSS: false, disableGlobalStyle: true }, it.el)))); html = out.html; css = out.css; } catch (e) { continue; }
    const cls = [...new Set(html.match(/css-[a-z0-9]+/g) || [])];
    // la classe « porteuse » = celle de l’élément qui porte la classe chakra-<component>
    const comp = it.component === 'IconButton' ? 'button' : it.component.toLowerCase();
    const m = [...html.matchAll(/class="([^"]+)"/g)].map(x => x[1].split(/\s+/)).find(cs => cs.some(c => c === 'chakra-' + comp || c === 'chakra-tabs__tab' && it.component === 'Tabs' || c === 'chakra-checkbox__control' && it.component === 'Checkbox' || c === 'chakra-radio__control' && it.component === 'Radio' || c === 'chakra-form__label' && it.component === 'FormLabel' || c === 'chakra-menu__menu-list' && it.component === 'Menu' || c === 'chakra-table' && it.component === 'Table'));
    const carrier = m ? m.find(c => c.startsWith('css-')) : null;
    for (const c of cls) if (!matrix[c]) matrix[c] = { component: it.component, props: it.props, carrier: c === carrier };
    if (carrier && (!matrix[carrier] || !matrix[carrier].carrier)) matrix[carrier] = { component: it.component, props: it.props, carrier: true };
    const rules = await page.evaluate(css => { const st = document.createElement('style'); st.textContent = css.replace(/:host,:root,\[data-theme\]\{[^}]*\}/g, ''); document.head.appendChild(st); const o = []; for (const r of st.sheet.cssRules) if (r.type === 1) o.push(r.cssText); st.remove(); return o; }, css);
    for (const r of rules) { const mm = r.match(/\.css-[a-z0-9]+/g); if (!mm) continue; for (const c of new Set(mm)) { const k = c.slice(1); rulesByClass[k] = rulesByClass[k] || []; if (!rulesByClass[k].includes(r)) rulesByClass[k].push(r); } }
  }
  await b.close();
  fs.writeFileSync('out/matrix.json', JSON.stringify({ matrix, rulesByClass }));
  console.log('combinaisons rendues:', list.length, '; classes:', Object.keys(matrix).length, '; porteuses:', Object.values(matrix).filter(m => m.carrier).length);
})();
