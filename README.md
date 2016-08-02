object-path-immutable
===========

Tiny JS library to modify deep object properties without modifying the original object (immutability). 
Works great with React (especially when using `setState()`) and Redux (inside a reducer).

This can be seen as a simpler and more intuitive alternative to the *React Immutability Helpers* and *Immutable.js*

[![NPM version](https://badge.fury.io/js/object-path-immutable.png)](http://badge.fury.io/js/object-path-immutable)
[![Build Status](https://travis-ci.org/mariocasciaro/object-path-immutable.png)](https://travis-ci.org/mariocasciaro/object-path-immutable)
[![Coverage Status](https://coveralls.io/repos/mariocasciaro/object-path-immutable/badge.png)](https://coveralls.io/r/mariocasciaro/object-path-immutable)
[![devDependency Status](https://david-dm.org/mariocasciaro/object-path-immutable/dev-status.svg)](https://david-dm.org/mariocasciaro/object-path-immutable#info=devDependencies)
![Downloads](http://img.shields.io/npm/dm/object-path-immutable.svg)

## Install

### Node.js

```
npm install object-path-immutable --save
```

## Quick usage

The following, sets a property without modifying the original object. 
It will minimize the number of clones down the line. The resulting object is just a plain JS object literal, 
so be warned that it will not be protected against property mutations (like `Immutable.js`)

```javascript
var obj = {
  a: {
    b: 'c',
    c: ['d', 'f']
  }
}

//set a deep property
var newObj = immutable.set(obj, 'a.b', 'f')
//returns
//var obj = {
//  a: {
//    b: 'f',
//    c: ['d', 'f']
//  }
//}

//obj !== newObj
//obj.a !== newObj.a
//obj.b !== newObj.b

//However:
//obj.c === newObj.c
```


## API

```javascript

var obj = {
  a: {
    b: 'c',
    c: ['d', 'f']
  }
}

var immutable = require("object-path-immutable")

//set deep property
var newObj = immutable.set(obj, 'a.b', 'f')
//returns
//var obj = {
//  a: {
//    b: 'f',
//    c: ['d', 'f']
//  }
//}

//it can also use an array to describe the path
var newObj = immutable.set(obj, ['a', 'b'], 'f')

//if the path is specified as a string, then numbers are automatically interpreted as array indexes
var newObj = immutable.set(obj, 'a.c.1', 'fooo')
//returns
//var obj = {
//  a: {
//    b: 'f',
//    c: ['d', 'fooo']
//  }
//}


//push into a deep array (it will create intermediate objects/arrays if necessary)
var newObj = immutable.push(obj, 'a.d', 'f')
//returns
//var obj = {
//  a: {
//    b: 'f',
//    c: ['d', 'f'],
//    d: ['f']
//  }
//}

//delete a deep property
var newObj = immutable.del(obj, 'a.c')
//returns
//var obj = {
//  a: {
//    b: 'f'
//  }
//}

//delete a deep array item (splice)
var newObj = immutable.del(obj, 'a.c.0')
//var obj = {
//  a: {
//    b: 'f',
//    c: ['f']
//  }
//}

//shallow copy properties
var newObj = immutable.assign(obj, 'a', { b: 'f', g: 'h' })
//returns
//var obj = {
//  a: {
//    b: 'f',
//    c: ['d, 'f'],
//    g: 'h'
//  }
//}

//Chaining mode. value() at the end of the chain is used to retrieve the resulting object
var newObj = immutable(obj).set('a.b', 'f').del('a.c.0').value()

```

## Equivalent library with side effects

[object-path](https://github.com/mariocasciaro/object-path)

### Credits

* [Mario Casciaro](https://github.com/mariocasciaro) - Author
