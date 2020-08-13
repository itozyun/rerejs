import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sucrase from '@rollup/plugin-sucrase';
import dts from 'rollup-plugin-dts';

const main = {
  input: 'index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
    },
    {
      file: 'lib/index.mjs',
      format: 'esm',
    },
  ],
  external: ['util'],
  plugins: [
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript'],
    }),
    commonjs(),
    resolve({ preferBuiltins: true }),
  ],
};

const browser = {
  input: 'index.ts',
  output: [
    {
      file: 'lib/index.browser.js',
      name: 'ReRE',
      format: 'umd',
    },
  ],
  plugins: [
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript'],
    }),
    commonjs(),
    alias({
      entries: [{ find: 'util', replacement: __dirname + '/tools/node-util-dummy.ts' }],
    }),
    resolve(),
  ],
};

const types = {
  input: 'out/index.d.ts',
  output: [
    {
      file: 'lib/index.d.ts',
      format: 'esm',
    },
  ],
  external: ['util'],
  plugins: [dts()],
};

export default [main, browser, types];
