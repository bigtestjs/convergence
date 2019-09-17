import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.ts',
  external: ['mocha', 'chai', 'chai-as-promised'],
  output: {
    format: 'cjs',
    name: 'BigTest.Convergence',
    file: 'tmp/tests.js'
  },
  plugins: [
    multiEntry(),
    typescript(),
    babel()
  ]
};
