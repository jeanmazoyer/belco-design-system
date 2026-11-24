// Bundle du thème Chakra du DS (src/chakra) en CommonJS, sans les CSS fontsource ni le reste de utils/.
const esbuild = require('esbuild'); const path = require('path');
const SRC = process.argv[2];
const stubs = {
  name: 'stubs',
  setup(b) {
    b.onResolve({ filter: /^@fontsource\// }, () => ({ path: 'fontsource', namespace: 'stub' }));
    b.onResolve({ filter: /\/utils$/ }, args => args.importer.includes(path.join('src', 'chakra')) ? { path: path.join(SRC, 'utils', 'detectNavigator.ts') } : undefined);
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'module.exports = {};', loader: 'js' }));
  },
};
esbuild.build({
  entryPoints: [path.join(SRC, 'chakra', 'index.ts')], bundle: true, platform: 'node', format: 'cjs', outfile: 'out/theme.cjs',
  plugins: [stubs], external: ['@chakra-ui/*', 'react', 'react-dom', 'framer-motion', '@emotion/*'], logLevel: 'warning', target: 'node18',
}).then(() => console.log('theme bundled')).catch(e => { console.error(e.message); process.exit(1); });
