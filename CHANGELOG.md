Changelog
===========

### 3.0

  - **Possible breaking change** `merge` not does not accept options anymore
  - Removed dependency on `deepmerge`
  
### 2.0

  - **Possible breaking change** The library now has dependencies and is building with Rollup, therefore the UMD entry point is now `dist/object-path-immutable`. 
  If you are using this `object-path-immutable` with Node or another module bundler, this change should not affect you.
  - Added `merge` function
  
### 1.0

- **Breaking change**: The way the library handles empty paths has changed. Before this change,all the methods were returning the original object. The new behavior is as follows.
  -  `set(src, path, value)`: `value` is returned
  -  `update(src, path, updater)`: `value` will be passed to `updater()` and the result returned
  -  `set(src, path, ...values)`: `values` will be concatenated to `src` if `src` is an array, otherwise `values` will be returned
  -  `insert(src, path, value, at)`: if `src` is an array then it will be cloned and `value` will be inserted at `at`, otherwise `[value]` will be returned
  - `del(src, path)`: returns `undefined`
  - `assign(src, path, target)`: Target is assigned to a clone of `src` and returned
