import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'index.js',
  plugins: [
    commonjs(),
    resolve()
  ],
  output: [{
    name: 'objectPathImmutable',
    file: 'dist/object-path-immutable.js',
    format: 'umd'
  }]
}
