import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [{
    format: 'umd',
    name: 'BigTest.Convergence',
    file: pkg.main,
    exports: 'named'
  }, {
    format: 'es',
    file: pkg.module
  }],
  plugins: [
    typescript(),
    babel()
  ]
};
