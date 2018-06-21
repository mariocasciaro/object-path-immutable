(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.objectPathImmutable = factory());
}(this, (function () { 'use strict';

	var isMergeableObject = function isMergeableObject(value) {
		return isNonNullObject(value)
			&& !isSpecial(value)
	};

	function isNonNullObject(value) {
		return !!value && typeof value === 'object'
	}

	function isSpecial(value) {
		var stringValue = Object.prototype.toString.call(value);

		return stringValue === '[object RegExp]'
			|| stringValue === '[object Date]'
			|| isReactElement(value)
	}

	// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
	var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

	function isReactElement(value) {
		return value.$$typeof === REACT_ELEMENT_TYPE
	}

	function emptyTarget(val) {
		return Array.isArray(val) ? [] : {}
	}

	function cloneUnlessOtherwiseSpecified(value, options) {
		return (options.clone !== false && options.isMergeableObject(value))
			? deepmerge(emptyTarget(value), value, options)
			: value
	}

	function defaultArrayMerge(target, source, options) {
		return target.concat(source).map(function(element) {
			return cloneUnlessOtherwiseSpecified(element, options)
		})
	}

	function mergeObject(target, source, options) {
		var destination = {};
		if (options.isMergeableObject(target)) {
			Object.keys(target).forEach(function(key) {
				destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
			});
		}
		Object.keys(source).forEach(function(key) {
			if (!options.isMergeableObject(source[key]) || !target[key]) {
				destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
			} else {
				destination[key] = deepmerge(target[key], source[key], options);
			}
		});
		return destination
	}

	function deepmerge(target, source, options) {
		options = options || {};
		options.arrayMerge = options.arrayMerge || defaultArrayMerge;
		options.isMergeableObject = options.isMergeableObject || isMergeableObject;

		var sourceIsArray = Array.isArray(source);
		var targetIsArray = Array.isArray(target);
		var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

		if (!sourceAndTargetTypesMatch) {
			return cloneUnlessOtherwiseSpecified(source, options)
		} else if (sourceIsArray) {
			return options.arrayMerge(target, source, options)
		} else {
			return mergeObject(target, source, options)
		}
	}

	deepmerge.all = function deepmergeAll(array, options) {
		if (!Array.isArray(array)) {
			throw new Error('first argument should be an array')
		}

		return array.reduce(function(prev, next) {
			return deepmerge(prev, next, options)
		}, {})
	};

	var deepmerge_1 = deepmerge;

	var es = /*#__PURE__*/Object.freeze({
		default: deepmerge_1
	});

	var deepmerge$1 = ( es && deepmerge_1 ) || es;

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

	function overwriteMerge (destinationArray, sourceArray) {
	  return sourceArray
	}

	var objectPathImmutable = function (src) {
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
	};

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

	function changeImmutable (dest, src, path, changeCallback) {
	  if (isNumber(path)) {
	    path = [path];
	  }
	  if (isEmpty(path)) {
	    return src
	  }
	  if (isString(path)) {
	    return changeImmutable(dest, src, path.split('.').map(getKey), changeCallback)
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

	  dest[currentPath] = changeImmutable(dest[currentPath], src, path.slice(1), changeCallback);

	  return dest
	}

	var api = {};
	api.set = function set (dest, src, path, value) {
	  if (isEmpty(path)) {
	    return value
	  }
	  return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
	    clonedObj[finalPath] = value;
	    return clonedObj
	  })
	};

	api.update = function update (dest, src, path, updater) {
	  if (isEmpty(path)) {
	    return updater(clone(src))
	  }
	  return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
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
	  return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
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
	  return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
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
	    return void 0
	  }
	  return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
	    if (Array.isArray(clonedObj)) {
	      if (clonedObj[finalPath] !== undefined) {
	        clonedObj.splice(finalPath, 1);
	      }
	    } else {
	      if (clonedObj.hasOwnProperty(finalPath)) {
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
	  return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
	    source = Object(source);
	    var target = clone(clonedObj[finalPath], true);
	    assignToObj(target, source);

	    clonedObj[finalPath] = target;
	    return clonedObj
	  })
	};

	api.merge = function assign (dest, src, path, source, options) {
	  options = options || {};
	  if (options.arrayMerge === void 0) {
	    options.arrayMerge = overwriteMerge;
	  }

	  if (isEmpty(path)) {
	    if (isEmpty(source)) {
	      return src
	    }
	    return deepmerge$1(src, source, options)
	  }
	  return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
	    source = Object(source);
	    clonedObj[finalPath] = deepmerge$1(clonedObj[finalPath], source, options);
	    return clonedObj
	  })
	};

	var objectPathImmutable_1 = Object.keys(api).reduce(function (objectPathImmutable, method) {
	  objectPathImmutable[method] = api[method].bind(null, null);

	  return objectPathImmutable
	}, objectPathImmutable);

	return objectPathImmutable_1;

})));
