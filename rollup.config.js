import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default [{
  input: 'src/object-path-immutable.js',
  plugins: [
    commonjs(),
    resolve()
  ],
  output: [{
    name: 'objectPathImmutable',
    file: `umd/${pkg.name}.js`,
    format: 'umd'
  }]
}, {
  input: 'src/object-path-immutable.js',
  output: {
    file: `cjs/${pkg.name}.js`,
    format: 'cjs',
    esModule: false
  }
}, {
  input: 'src/object-path-immutable.js',
  output: {
    file: `esm/${pkg.name}.js`,
    format: 'esm'
  }
}]
