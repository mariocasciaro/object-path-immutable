import { isPlainObject } from 'is-plain-object'

var _hasOwnProperty = Object.prototype.hasOwnProperty

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

function isInArray (value, array) {
  return array.indexOf(value) > -1
}

function hasShallowProperty (obj, prop) {
  return !!((isNumber(prop) && isArray(obj)) || _hasOwnProperty.call(obj, prop))
}

function getShallowProperty (obj, prop) {
  if (hasShallowProperty(obj, prop)) {
    return obj[prop]
  }
}

function assignToObj (target, source) {
  for (var key in source) {
    if (_hasOwnProperty.call(source, key)) {
      target[key] = source[key]
    }
  }
  return target
}

function getKey (key) {
  var intKey = parseInt(key)
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
    var merged = {}
    for (var key in dest) {
      if (_hasOwnProperty.call(dest, key)) {
        if (_hasOwnProperty.call(src, key)) {
          merged[key] = _deepMerge(dest[key], src[key])
        } else {
          merged[key] = dest[key]
        }
      }
    }

    for (key in src) {
      if (_hasOwnProperty.call(src, key)) {
        merged[key] = _deepMerge(dest[key], src[key])
      }
    }
    return merged
  }
  return src
}

function _changeImmutable (dest, src, path, changeCallback, matchThenMap) {
  if (isNumber(path)) {
    path = [path]
  }
  if (isEmpty(path)) {
    return src
  }
  if (isString(path)) {
    return _changeImmutable(dest, src, path.split('.').map(getKey), changeCallback, matchThenMap)
  }
  var currentPath = path[0]

  if (!dest || dest === src) {
    dest = clone(src, true, isNumber(currentPath))
  }

  if (path.length === 1) {
    return changeCallback(dest, currentPath)
  }

  if (src != null) {
    src = src[currentPath]
  }

  if (!isEmpty(matchThenMap) && isArray(src) && isInArray(currentPath, matchThenMap)) {
    path.shift()
    dest[currentPath] = src
      .map(i => {
        return _changeImmutable(dest[currentPath], src, path.slice(1), changeCallback, matchThenMap)
      })
  } else {
    dest[currentPath] = _changeImmutable(dest[currentPath], src, path.slice(1), changeCallback, matchThenMap)
  }

  return dest
}

var api = {}

api.get = function get (src, path, defaultValue, matchThenMap) {
  if (isEmpty(src)) {
    return defaultValue
  }
  if (isNumber(path)) {
    path = [path]
  }
  if (isEmpty(path)) {
    return src
  }
  if (isString(path)) {
    return api.get(src, path.split('.'), defaultValue, matchThenMap)
  }

  var currentPath = path[0]

  if (!isEmpty(matchThenMap) && isArray(src) && isInArray(currentPath, matchThenMap)) {
    path.shift()
    return src
      .map(i => {
        return api.get(i, path, defaultValue, matchThenMap)
      })
  }

  var nextObj = getShallowProperty(src, currentPath)

  if (nextObj === undefined) {
    return defaultValue
  }

  if (path.length === 1) {
    return nextObj
  }

  return api.get(src[currentPath], path.slice(1), defaultValue, matchThenMap)
}

api.set = function set (dest, src, path, value, matchThenMap) {
  if (isEmpty(path)) {
    return value
  }
  return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
    clonedObj[finalPath] = value
    return clonedObj
  }, matchThenMap)
}

api.ensureExists = function ensureExists (dest, src, path, defaultValue, matchThenMap) {
  if (isEmpty(path)) {
    return src
  }
  var currentValue = api.get(src, path, undefined, matchThenMap)
  if (currentValue === undefined) {
    return api.set(dest, src, path, defaultValue, matchThenMap)
  } else {
    return src
  }
}

api.update = function update (dest, src, path, updater, matchThenMap) {
  if (isEmpty(path)) {
    return updater(clone(src))
  }
  return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
    clonedObj[finalPath] = updater(clonedObj[finalPath])
    return clonedObj
  }, matchThenMap)
}

api.push = function push (dest, src, path /*, values */) {
  var values = Array.prototype.slice.call(arguments, 3)
  if (isEmpty(path)) {
    if (!isArray(src)) {
      return values
    } else {
      return src.concat(values)
    }
  }
  return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
    if (!isArray(clonedObj[finalPath])) {
      clonedObj[finalPath] = values
    } else {
      clonedObj[finalPath] = clonedObj[finalPath].concat(values)
    }
    return clonedObj
  })
}

api.insert = function insert (dest, src, path, value, at) {
  at = ~~at
  if (isEmpty(path)) {
    if (!isArray(src)) {
      return [value]
    }

    var first = src.slice(0, at)
    first.push(value)
    return first.concat(src.slice(at))
  }
  return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
    var arr = clonedObj[finalPath]
    if (!isArray(arr)) {
      if (arr != null && typeof arr !== 'undefined') {
        throw new Error('Expected ' + path + 'to be an array. Instead got ' + typeof path)
      }
      arr = []
    }

    var first = arr.slice(0, at)
    first.push(value)
    clonedObj[finalPath] = first.concat(arr.slice(at))
    return clonedObj
  })
}

api.del = function del (dest, src, path) {
  if (isEmpty(path)) {
    return undefined
  }
  return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
    if (Array.isArray(clonedObj)) {
      if (clonedObj[finalPath] !== undefined) {
        clonedObj.splice(finalPath, 1)
      }
    } else {
      if (_hasOwnProperty.call(clonedObj, finalPath)) {
        delete clonedObj[finalPath]
      }
    }
    return clonedObj
  })
}

api.assign = function assign (dest, src, path, source) {
  if (isEmpty(path)) {
    if (isEmpty(source)) {
      return src
    }
    return assignToObj(clone(src), source)
  }
  return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
    source = Object(source)
    var target = clone(clonedObj[finalPath], true)
    assignToObj(target, source)

    clonedObj[finalPath] = target
    return clonedObj
  })
}

api.merge = function assign (dest, src, path, source) {
  if (isEmpty(path)) {
    if (isEmpty(source)) {
      return src
    }
    return _deepMerge(src, source)
  }
  return _changeImmutable(dest, src, path, function (clonedObj, finalPath) {
    source = Object(source)
    clonedObj[finalPath] = _deepMerge(clonedObj[finalPath], source)
    return clonedObj
  })
}

export function wrap (src) {
  var dest = src
  var committed = false

  var transaction = Object.keys(api).reduce(function (proxy, prop) {
    /* istanbul ignore else */
    if (typeof api[prop] === 'function') {
      proxy[prop] = function () {
        var args = [dest, src].concat(Array.prototype.slice.call(arguments))

        if (committed) {
          throw new Error('Cannot call ' + prop + ' after `value`')
        }

        dest = api[prop].apply(null, args)

        return transaction
      }
    }

    return proxy
  }, {})

  transaction.value = function () {
    committed = true
    return dest
  }

  return transaction
}

export var set = api.set.bind(null, null)
export var ensureExists = api.ensureExists.bind(null, null)
export var update = api.update.bind(null, null)
export var push = api.push.bind(null, null)
export var insert = api.insert.bind(null, null)
export var del = api.del.bind(null, null)
export var assign = api.assign.bind(null, null)
export var merge = api.merge.bind(null, null)
export var get = api.get
