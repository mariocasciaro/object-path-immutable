(function (root, factory){
  'use strict';
  
  /*istanbul ignore next:cant test*/
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.objectPath = factory();
  }
})(this, function(){
  'use strict';
  var _hasOwnProperty = Object.prototype.hasOwnProperty
  
  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
      return true;
    } else if (!isString(value)) {
      for (var i in value) {
        if (_hasOwnProperty.call(value, i)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  
  function isNumber(value){
    return typeof value === 'number';
  }
  
  function isString(obj){
    return typeof obj === 'string';
  }
  
  function isArray(obj){
    return Array.isArray(obj)
  }
  
  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }
  
  var objectPathImmutable = function(obj) {
    var newOp = Object.keys(objectPathImmutable).reduce(function(proxy, prop) {
      /*istanbul ignore else*/
      if (typeof objectPathImmutable[prop] === 'function') {
        proxy[prop] = function() {
          var args = Array.prototype.slice.call(arguments).concat([obj])
          return objectPathImmutable(objectPathImmutable[prop].apply(objectPathImmutable, args))
        }
      }
      
      return proxy;
    }, {})
    
    newOp.value = function() {
      return obj
    }
    
    return newOp
  };
  
  function clone(obj, createIfEmpty, assumeArray) {
    if(obj == null) {
      if(createIfEmpty) {
        if(assumeArray) {
          return []
        }
        
        return {}
      }
      
      return obj
    } else if(isArray(obj)) {
      return obj.slice()
    }
    
    var res = {}
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        res[key] = obj[key]
      }
    }
    
    return res
  }
  
  
  function changeImmutable(obj, path, changeCallback) {
    if (isNumber(path)) {
      path = [path]
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isString(path)) {
      return changeImmutable(obj, path.split('.').map(getKey), changeCallback);
    }
    var currentPath = path[0]
    var clonedObj = clone(obj, true, isNumber(currentPath))
    if (path.length === 1) {
      return changeCallback(clonedObj, currentPath)
    }
  
    clonedObj[currentPath] = changeImmutable(clonedObj[currentPath], path.slice(1), changeCallback)
    return clonedObj
  }
  
  objectPathImmutable.set = function(obj, path, value) {
    return changeImmutable(obj, path, function(clonedObj, finalPath) {
      clonedObj[finalPath] = value
      return clonedObj
    })
  }
  
  objectPathImmutable.push = function (obj, path /*, values */) {
    var values = Array.prototype.slice.call(arguments, 2)
    return changeImmutable(obj, path, function(clonedObj, finalPath) {
      if (!isArray(clonedObj[finalPath])) {
        clonedObj[finalPath] = values
      } else {
        clonedObj[finalPath] = clonedObj[finalPath].concat(values)
      }
      return clonedObj
    })
  }
  
  objectPathImmutable.del = function (obj, path, value, at){
    return changeImmutable(obj, path, function(clonedObj, finalPath) {
      if(Array.isArray(clonedObj)) {
        if(clonedObj[finalPath]) {
          clonedObj.splice(finalPath, 1)
        }
      } else {
        if(clonedObj.hasOwnProperty(finalPath)) {
          delete clonedObj[finalPath]
        }
      }
      return clonedObj
    })
  }
  
  return objectPathImmutable
})