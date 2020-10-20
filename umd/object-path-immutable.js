(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.objectPathImmutable = {}));
}(this, (function (exports) { 'use strict';

  /*!
   * isobject <https://github.com/jonschlinkert/isobject>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
  }

  /*!
   * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  function isObjectObject(o) {
    return isObject(o) === true
      && Object.prototype.toString.call(o) === '[object Object]';
  }

  function isPlainObject(o) {
    var ctor,prot;

    if (isObjectObject(o) === false) return false;

    // If has modified constructor
    ctor = o.constructor;
    if (typeof ctor !== 'function') return false;

    // If has modified prototype
    prot = ctor.prototype;
    if (isObjectObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }

    // Most likely a plain Object
    return true;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var objectPath = createCommonjsModule(function (module) {
  (function (root, factory){

    /*istanbul ignore next:cant test*/
    {
      module.exports = factory();
    }
  })(commonjsGlobal, function(){

    var toStr = Object.prototype.toString;
    function hasOwnProperty(obj, prop) {
      if(obj == null) {
        return false
      }
      //to handle objects with null prototypes (too edge case?)
      return Object.prototype.hasOwnProperty.call(obj, prop)
    }

    function isEmpty(value){
      if (!value) {
        return true;
      }
      if (isArray(value) && value.length === 0) {
          return true;
      } else if (typeof value !== 'string') {
          for (var i in value) {
              if (hasOwnProperty(value, i)) {
                  return false;
              }
          }
          return true;
      }
      return false;
    }

    function toString(type){
      return toStr.call(type);
    }

    function isObject(obj){
      return typeof obj === 'object' && toString(obj) === "[object Object]";
    }

    var isArray = Array.isArray || function(obj){
      /*istanbul ignore next:cant test*/
      return toStr.call(obj) === '[object Array]';
    };

    function isBoolean(obj){
      return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
    }

    function getKey(key){
      var intKey = parseInt(key);
      if (intKey.toString() === key) {
        return intKey;
      }
      return key;
    }

    function factory(options) {
      options = options || {};

      var objectPath = function(obj) {
        return Object.keys(objectPath).reduce(function(proxy, prop) {
          if(prop === 'create') {
            return proxy;
          }

          /*istanbul ignore else*/
          if (typeof objectPath[prop] === 'function') {
            proxy[prop] = objectPath[prop].bind(objectPath, obj);
          }

          return proxy;
        }, {});
      };

      var hasShallowProperty;
      if (options.includeInheritedProps) {
        hasShallowProperty = function () {
          return true
        };
      } else {
        hasShallowProperty = function (obj, prop) {
          return (typeof prop === 'number' && Array.isArray(obj)) || hasOwnProperty(obj, prop)
        };
      }

      function getShallowProperty(obj, prop) {
        if (hasShallowProperty(obj, prop)) {
          return obj[prop];
        }
      }

      function set(obj, path, value, doNotReplace){
        if (typeof path === 'number') {
          path = [path];
        }
        if (!path || path.length === 0) {
          return obj;
        }
        if (typeof path === 'string') {
          return set(obj, path.split('.').map(getKey), value, doNotReplace);
        }
        var currentPath = path[0];
        var currentValue = getShallowProperty(obj, currentPath);
        if (options.includeInheritedProps && (currentPath === '__proto__' ||
          (currentPath === 'constructor' && typeof currentValue === 'function'))) {
          throw new Error('For security reasons, object\'s magic properties cannot be set')
        }
        if (path.length === 1) {
          if (currentValue === void 0 || !doNotReplace) {
            obj[currentPath] = value;
          }
          return currentValue;
        }

        if (currentValue === void 0) {
          //check if we assume an array
          if(typeof path[1] === 'number') {
            obj[currentPath] = [];
          } else {
            obj[currentPath] = {};
          }
        }

        return set(obj[currentPath], path.slice(1), value, doNotReplace);
      }

      objectPath.has = function (obj, path) {
        if (typeof path === 'number') {
          path = [path];
        } else if (typeof path === 'string') {
          path = path.split('.');
        }

        if (!path || path.length === 0) {
          return !!obj;
        }

        for (var i = 0; i < path.length; i++) {
          var j = getKey(path[i]);

          if((typeof j === 'number' && isArray(obj) && j < obj.length) ||
            (options.includeInheritedProps ? (j in Object(obj)) : hasOwnProperty(obj, j))) {
            obj = obj[j];
          } else {
            return false;
          }
        }

        return true;
      };

      objectPath.ensureExists = function (obj, path, value){
        return set(obj, path, value, true);
      };

      objectPath.set = function (obj, path, value, doNotReplace){
        return set(obj, path, value, doNotReplace);
      };

      objectPath.insert = function (obj, path, value, at){
        var arr = objectPath.get(obj, path);
        at = ~~at;
        if (!isArray(arr)) {
          arr = [];
          objectPath.set(obj, path, arr);
        }
        arr.splice(at, 0, value);
      };

      objectPath.empty = function(obj, path) {
        if (isEmpty(path)) {
          return void 0;
        }
        if (obj == null) {
          return void 0;
        }

        var value, i;
        if (!(value = objectPath.get(obj, path))) {
          return void 0;
        }

        if (typeof value === 'string') {
          return objectPath.set(obj, path, '');
        } else if (isBoolean(value)) {
          return objectPath.set(obj, path, false);
        } else if (typeof value === 'number') {
          return objectPath.set(obj, path, 0);
        } else if (isArray(value)) {
          value.length = 0;
        } else if (isObject(value)) {
          for (i in value) {
            if (hasShallowProperty(value, i)) {
              delete value[i];
            }
          }
        } else {
          return objectPath.set(obj, path, null);
        }
      };

      objectPath.push = function (obj, path /*, values */){
        var arr = objectPath.get(obj, path);
        if (!isArray(arr)) {
          arr = [];
          objectPath.set(obj, path, arr);
        }

        arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
      };

      objectPath.coalesce = function (obj, paths, defaultValue) {
        var value;

        for (var i = 0, len = paths.length; i < len; i++) {
          if ((value = objectPath.get(obj, paths[i])) !== void 0) {
            return value;
          }
        }

        return defaultValue;
      };

      objectPath.get = function (obj, path, defaultValue){
        if (typeof path === 'number') {
          path = [path];
        }
        if (!path || path.length === 0) {
          return obj;
        }
        if (obj == null) {
          return defaultValue;
        }
        if (typeof path === 'string') {
          return objectPath.get(obj, path.split('.'), defaultValue);
        }

        var currentPath = getKey(path[0]);
        var nextObj = getShallowProperty(obj, currentPath);
        if (nextObj === void 0) {
          return defaultValue;
        }

        if (path.length === 1) {
          return nextObj;
        }

        return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
      };

      objectPath.del = function del(obj, path) {
        if (typeof path === 'number') {
          path = [path];
        }

        if (obj == null) {
          return obj;
        }

        if (isEmpty(path)) {
          return obj;
        }
        if(typeof path === 'string') {
          return objectPath.del(obj, path.split('.'));
        }

        var currentPath = getKey(path[0]);
        if (!hasShallowProperty(obj, currentPath)) {
          return obj;
        }

        if(path.length === 1) {
          if (isArray(obj)) {
            obj.splice(currentPath, 1);
          } else {
            delete obj[currentPath];
          }
        } else {
          return objectPath.del(obj[currentPath], path.slice(1));
        }

        return obj;
      };

      return objectPath;
    }

    var mod = factory();
    mod.create = factory;
    mod.withInheritedProps = factory({includeInheritedProps: true});
    return mod;
  });
  });

  var _hasOwnProperty = Object.prototype.hasOwnProperty;

  function isEmpty (value) {
    if (isNumber(value)) {
      return false
    }
    if (!value) {
      return true
    }
    if (isArray(value) && value.length === 0) {
      return true
    } else if (!isString(value)) {
      for (var i in value) {
        if (_hasOwnProperty.call(value, i)) {
          return false
        }
      }
      return true
    }
    return false
  }

  function isNumber (value) {
    return typeof value === 'number'
  }

  function isString (obj) {
    return typeof obj === 'string'
  }

  function isArray (obj) {
    return Array.isArray(obj)
  }

  function assignToObj (target, source) {
    for (var key in source) {
      if (_hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
    return target
  }

  function getKey (key) {
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey
    }
    return key
  }

  function clone (obj, createIfEmpty, assumeArray) {
    if (obj == null) {
      if (createIfEmpty) {
        if (assumeArray) {
          return []
        }

        return {}
      }

      return obj
    } else if (isArray(obj)) {
      return obj.slice()
    }

    return assignToObj({}, obj)
  }

  function _deepMerge (dest, src) {
    if (dest !== src && isPlainObject(dest) && isPlainObject(src)) {
      var merged = {};
      for (var key in dest) {
        if (_hasOwnProperty.call(dest, key)) {
          if (_hasOwnProperty.call(src, key)) {
            merged[key] = _deepMerge(dest[key], src[key]);
          } else {
            merged[key] = dest[key];
          }
        }
      }

      for (key in src) {
        if (_hasOwnProperty.call(src, key)) {
          merged[key] = _deepMerge(dest[key], src[key]);
        }
      }
      return merged
    }
    return src
  }

  function _changeImmutable (dest, src, path, changeCallback) {
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return src
    }
    if (isString(path)) {
      return _changeImmutable(dest, src, path.split('.').map(getKey), changeCallback)
    }
    var currentPath = path[0];

    if (!dest || dest === src) {
      dest = clone(src, true, isNumber(currentPath));
    }

    if (path.length === 1) {
      return changeCallback(dest, currentPath)
    }

    if (src != null) {
      src = src[currentPath];
    }

    dest[currentPath] = _changeImmutable(dest[currentPath], src, path.slice(1), changeCallback);

    return dest
  }

  var api = {};
  api.set = function set (dest, src, path, value) {
    if (isEmpty(path)) {
      return value
    }
    return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
      clonedObj[finalPath] = value;
      return clonedObj
    })
  };

  api.update = function update (dest, src, path, updater) {
    if (isEmpty(path)) {
      return updater(clone(src))
    }
    return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
      clonedObj[finalPath] = updater(clonedObj[finalPath]);
      return clonedObj
    })
  };

  api.push = function push (dest, src, path /*, values */) {
    var values = Array.prototype.slice.call(arguments, 3);
    if (isEmpty(path)) {
      if (!isArray(src)) {
        return values
      } else {
        return src.concat(values)
      }
    }
    return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
      if (!isArray(clonedObj[finalPath])) {
        clonedObj[finalPath] = values;
      } else {
        clonedObj[finalPath] = clonedObj[finalPath].concat(values);
      }
      return clonedObj
    })
  };

  api.insert = function insert (dest, src, path, value, at) {
    at = ~~at;
    if (isEmpty(path)) {
      if (!isArray(src)) {
        return [value]
      }

      var first = src.slice(0, at);
      first.push(value);
      return first.concat(src.slice(at))
    }
    return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
      var arr = clonedObj[finalPath];
      if (!isArray(arr)) {
        if (arr != null && typeof arr !== 'undefined') {
          throw new Error('Expected ' + path + 'to be an array. Instead got ' + typeof path)
        }
        arr = [];
      }

      var first = arr.slice(0, at);
      first.push(value);
      clonedObj[finalPath] = first.concat(arr.slice(at));
      return clonedObj
    })
  };

  api.del = function del (dest, src, path) {
    if (isEmpty(path)) {
      return undefined
    }
    return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
      if (Array.isArray(clonedObj)) {
        if (clonedObj[finalPath] !== undefined) {
          clonedObj.splice(finalPath, 1);
        }
      } else {
        if (_hasOwnProperty.call(clonedObj, finalPath)) {
          delete clonedObj[finalPath];
        }
      }
      return clonedObj
    })
  };

  api.assign = function assign (dest, src, path, source) {
    if (isEmpty(path)) {
      if (isEmpty(source)) {
        return src
      }
      return assignToObj(clone(src), source)
    }
    return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
      source = Object(source);
      var target = clone(clonedObj[finalPath], true);
      assignToObj(target, source);

      clonedObj[finalPath] = target;
      return clonedObj
    })
  };

  api.merge = function assign (dest, src, path, source) {
    if (isEmpty(path)) {
      if (isEmpty(source)) {
        return src
      }
      return _deepMerge(src, source)
    }
    return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
      source = Object(source);
      clonedObj[finalPath] = _deepMerge(clonedObj[finalPath], source);
      return clonedObj
    })
  };

  function wrap (src) {
    var dest = src;
    var committed = false;

    var transaction = Object.keys(api).reduce(function (proxy, prop) {
      /* istanbul ignore else */
      if (typeof api[prop] === 'function') {
        proxy[prop] = function () {
          var args = [dest, src].concat(Array.prototype.slice.call(arguments));

          if (committed) {
            throw new Error('Cannot call ' + prop + ' after `value`')
          }

          dest = api[prop].apply(null, args);

          return transaction
        };
      }

      return proxy
    }, {});

    transaction.value = function () {
      committed = true;
      return dest
    };

    return transaction
  }

  var set = api.set.bind(null, null);
  var update = api.update.bind(null, null);
  var push = api.push.bind(null, null);
  var insert = api.insert.bind(null, null);
  var del = api.del.bind(null, null);
  var assign = api.assign.bind(null, null);
  var merge = api.merge.bind(null, null);
  var get = objectPath.get;

  exports.assign = assign;
  exports.del = del;
  exports.get = get;
  exports.insert = insert;
  exports.merge = merge;
  exports.push = push;
  exports.set = set;
  exports.update = update;
  exports.wrap = wrap;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
