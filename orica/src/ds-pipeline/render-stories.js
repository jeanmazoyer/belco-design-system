// Rend chaque story du DS avec le vrai thème (SSR React + Emotion) → HTML + CSS + classes. Sortie : out/stories.json
const esbuild = require('esbuild'); const path = require('path'); const fs = require('fs');
process.env.NODE_ENV = 'production';
const SRC = process.argv[2]; const ONLY = process.argv[3];
const React = require('react'); const { renderToString } = require('react-dom/server');
const createCache = require('@emotion/cache').default; const { CacheProvider } = require('@emotion/react'); const createEmotionServer = require('@emotion/server/create-instance').default;
const { ChakraProvider } = require('@chakra-ui/react');
const theme = require('./out/theme.cjs').default;
require('framer-motion'); require('react-icons/fa6');
// Emotion et framer-motion ont été chargés SANS document : ils restent en mode SSR. Les globaux DOM viennent après, pour les composants qui lisent window au rendu.
// Globaux DOM (jsdom) pour les composants qui touchent window/document au rendu (framer-motion, mesures)
const { JSDOM } = require('jsdom'); const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document; global.navigator = dom.window.navigator; global.HTMLElement = dom.window.HTMLElement; global.SVGElement = dom.window.SVGElement; global.MutationObserver = dom.window.MutationObserver; global.DOMRect = dom.window.DOMRect || class { constructor(x=0,y=0,w=0,h=0){Object.assign(this,{x,y,width:w,height:h,top:y,left:x,right:x+w,bottom:y+h})} }; global.Element = dom.window.Element; global.Node = dom.window.Node; global.getComputedStyle = dom.window.getComputedStyle; global.requestAnimationFrame = cb => setTimeout(cb, 0); global.cancelAnimationFrame = clearTimeout;
window.matchMedia = window.matchMedia || (q => ({ matches: false, media: q, addListener() { }, removeListener() { }, addEventListener() { }, removeEventListener() { } }));
global.ResizeObserver = window.ResizeObserver = class { observe() { } unobserve() { } disconnect() { } };

const stubs = {
  name: 'stubs',
  setup(b) {
    b.onResolve({ filter: /^@storybook\/addon-actions$/ }, () => ({ path: 'actions', namespace: 'stub' }));
    b.onResolve({ filter: /^@storybook\// }, () => ({ path: 'storybook', namespace: 'stub' }));
    b.onResolve({ filter: /^@fontsource\//, }, () => ({ path: 'fontsource', namespace: 'stub' }));
    b.onResolve({ filter: /^front-shared$/ }, () => ({ path: 'front-shared', namespace: 'stub' }));
    b.onResolve({ filter: /^(api-types|@synako\/|react-quill|@nikolovlazar)/ }, args => ({ path: 'ext:' + args.path, namespace: 'stub' }));
    b.onResolve({ filter: /\.css$/ }, () => ({ path: 'css', namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: args.path === 'actions' ? 'exports.action = () => () => {};' : args.path === 'front-shared' ? "const React = require('react'); exports.useDebouncedEffect = (fn, deps, delay) => React.useEffect(() => { const t = setTimeout(fn, delay || 0); return () => clearTimeout(t); }, deps);" : args.path.startsWith('ext:') ? `throw new Error("dépendance absente : ${args.path.slice(4)}")` : 'module.exports = {};', loader: 'js' }));
  },
};
const files = [...walk(path.join(SRC, 'chakra', 'components')), ...walk(path.join(SRC, 'components'))].filter(f => f.endsWith('.stories.tsx') && (!ONLY || f.includes(ONLY)));
function walk(d) { let out = []; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) out = out.concat(walk(p)); else out.push(p); } return out; }
const results = []; const errors = [];
(async () => {
  for (const f of files) {
    const rel = path.relative(SRC, f); const outfile = path.join('out', 'stories', rel.replace(/[\/]/g, '__') + '.cjs');
    fs.mkdirSync(path.dirname(outfile), { recursive: true });
    try {
      await esbuild.build({ entryPoints: [f], bundle: true, platform: 'node', format: 'cjs', outfile, plugins: [stubs], external: ['@chakra-ui/*', 'react', 'react-dom', 'framer-motion', '@emotion/*', 'react-icons', 'react-icons/*', 'uri-template', 'sanitize-html', 'react-number-format', 'react-phone-number-input', 'react-phone-number-input/*', 'react-hook-form', 'react-country-flag', 'react-router-dom', '@ebay/nice-modal-react', 'http-link-header', 'react-file-icon', '@choc-ui/*'], jsx: 'automatic', logLevel: 'silent', target: 'node18' });
    } catch (e) { errors.push({ file: rel, step: 'bundle', error: e.message.split('\n')[0] }); continue; }
    let mod; try { mod = require(path.resolve(outfile)); } catch (e) { errors.push({ file: rel, step: 'load', error: e.message.split('\n')[0] }); continue; }
    const meta = mod.default || {}; const title = meta.title || rel;
    for (const [name, story] of Object.entries(mod)) {
      if (name === 'default' || typeof story !== 'function') continue;
      const args = Object.assign({}, meta.args || {}, story.args || {});
      const cache = createCache({ key: 'css' }); const { extractCritical } = createEmotionServer(cache);
      let html, css;
      try {
        const el = React.createElement(CacheProvider, { value: cache }, React.createElement(ChakraProvider, { theme, resetCSS: false, disableGlobalStyle: true }, React.createElement(story, args)));
        html = renderToString(el); const ex = extractCritical(html); css = ex.css; html = ex.html;
      } catch (e) { errors.push({ file: rel, story: name, step: 'render', error: e.message.split('\n')[0] }); continue; }
      const classes = [...new Set(html.match(/css-[a-z0-9]+/g) || [])];
      results.push({ file: rel, title, name, component: meta.component && (meta.component.displayName || meta.component.name) || null, args: story.args || null, html, css, classes });
    }
  }
  fs.writeFileSync('out/stories.json', JSON.stringify({ results, errors }, null, 1));
  console.log('stories rendered:', results.length, '; erreurs:', errors.length);
  const byFile = {}; results.forEach(r => { byFile[r.file] = (byFile[r.file] || 0) + 1; }); console.log(Object.entries(byFile).map(([f, n]) => `${f.replace(/.*\//, '')}:${n}`).join(' '));
  errors.slice(0, 40).forEach(e => console.log('  !', e.file, e.story || '', e.step, '→', e.error.slice(0, 140)));
})();
