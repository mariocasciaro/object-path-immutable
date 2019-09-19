[![build](https://img.shields.io/travis/mariocasciaro/object-path-immutable.svg?style=flat-square)](https://travis-ci.org/mariocasciaro/object-path-immutable)
[![coverage](https://img.shields.io/coveralls/mariocasciaro/object-path-immutable.svg?style=flat-square)](https://coveralls.io/r/mariocasciaro/object-path-immutable)
[![downloads](https://img.shields.io/npm/dm/object-path-immutable.svg?style=flat-square)](https://www.npmjs.com/package/object-path-immutable)
[![version](https://img.shields.io/npm/v/object-path-immutable.svg?style=flat-square)](https://www.npmjs.com/package/object-path-immutable)
[![deps](https://img.shields.io/david/mariocasciaro/object-path-immutable.svg?style=flat-square)](https://david-dm.org/mariocasciaro/object-path-immutable)
[![devdeps](https://img.shields.io/david/dev/mariocasciaro/object-path-immutable.svg?style=flat-square)](https://david-dm.org/mariocasciaro/object-path-immutable#info=devDependencies)

object-path-immutable-rowrowrowrow
===========

This repo is based on https://github.com/mariocasciaro/object-path-immutable with added features. Please checkout that repo for more information.

Tiny JS library to modify deep object properties without modifying the original object (immutability).
Works great with React (especially when using `setState()`) and Redux (inside a reducer).

This can be seen as a simpler and more intuitive alternative to the *React Immutability Helpers* and *Immutable.js*.

## Please see the basis for this repo

[object-path-immutable](https://github.com/mariocasciaro/object-path-immutable)

## Install

    npm install object-path-immutable-rowrowrowrow --save

## Quick usage

The following, sets a property without modifying the original object.
It will minimize the number of clones down the line. The resulting object is just a plain JS object literal,
so be warned that it will not be protected against property mutations (like `Immutable.js`)

```javascript
const obj = {
  a: {
    b: 'c',
    c: ['d', 'f']
  }
}

const newObj = immutable.set(obj, 'a.b', 'f')
// {
//   a: {
//     b: 'f',
//     c: ['d', 'f']
//   }
// }

// obj !== newObj
// obj.a !== newObj.a
// obj.b !== newObj.b

// However:
// obj.c === newObj.c
```

Note that you can also chain the api's and call `value()` at the end to retrieve the resulting object.

```javascript
const newObj = immutable(obj).set('a.b', 'f').del('a.c.0').value()
```

## API

```javascript
// Premises

const obj = {
  a: {
    b: 'f',
    c: ['d', 'f'],
    'MAP': [
      {
        g: 'h1',
        i: 'j1'
      },
      {
        g: 'h2',
        i: 'j2'
      },
    ]
  }
};

import immutable from 'object-path-immutable'
```
#### get (initialObject, path, defaultValue, matchThenMap)

Return an object property or array of object properties.

- Path can be either a string or an array.
- matchThenMap is an array of keys that once matched in the object will propogate the path, defaultValue, and matchThenMap to all array values returning an array of values.

```javascript
const existingObject1 = immutable.get(obj, 'a.MAP.g', 'f',['MAP'])

// ['h1','h2']

const existingObject2 = immutable.get(obj, ['a', 'MAP','i'], 'f',['MAP'])

// ['j1','j2']
```

#### set (initialObject, path, value)

Changes an object property.

- Path can be either a string or an array.

```javascript
const newObj1 = immutable.set(obj, 'a.b', 'f')
const newObj2 = immutable.set(obj, ['a', 'b'], 'f')

// {
//   a: {
//     b: 'f',
//     c: ['d', 'f']
//   }
// }

// Note that if the path is specified as a string, numbers are automatically interpreted as array indexes.

const newObj = immutable.set(obj, 'a.c.1', 'fooo')
// {
//   a: {
//     b: 'f',
//     c: ['d', 'fooo']
//   }
// }
```

#### update (initialObject, path, updater)

Updates an object property.

```javascript
const obj = {
  a: {
    b: 1
  }
}

const newObj = immutable.update(obj, ['a', 'b'], v => v + 1)

// {
//   a: {
//     b: 2,
//   }
// }
```

#### push (initialObject, path, value)

Push into a deep array (it will create intermediate objects/arrays if necessary).

```javascript
const newObj = immutable.push(obj, 'a.d', 'f')
// {
//   a: {
//     b: 'f',
//     c: ['d', 'f'],
//     d: ['f']
//   }
// }
```

#### del (initialObject, path)

Deletes a property.

```javascript
const newObj = immutable.del(obj, 'a.c')
// {
//   a: {
//     b: 'f'
//   }
// }
```

Can also delete a deep array item using splice

```javascript
const newObj = immutable.del(obj, 'a.c.0')
// {
//   a: {
//     b: 'f',
//     c: ['f']
//   }
// }
```

#### assign (initialObject, path, payload)

Shallow copy properties.

```javascript
const newObj = immutable.assign(obj, 'a', { b: 'f', g: 'h' })
// {
//   a: {
//     b: 'f',
//     c: ['d, 'f'],
//     g: 'h'
//   }
// }
```

#### insert (initialObject, path, payload, position)

Insert property at the specific array index.

```javascript
const newObj = immutable.insert(obj, 'a.c', 'k', 1)
// var obj = {
//   a: {
//     b: 'c',
//     c: ['d, 'k' 'f'],
//   }
// }
```


#### merge (initialObject, path, value)

Deep merge properties.

```javascript
const newObj = immutable.merge(obj, 'a.c', {b: 'd'})
```

#### ensureExists (initialObject, path, defaultValue, matchThenMap)

Checks if an objects value exists, if not return a new object with the updated value, else return the source object without changes.

- Path can be either a string or an array.
- matchThenMap is an array of keys that once matched in the object will propogate the path, defaultValue, and matchThenMap to all array values returning an array of values.

```javascript
const newObject1 = immutable.ensureExists(obj, 'a.z', 'f')

// {
//   a: {
//     b: 'f',
//     c: ['d', 'f'],
//     'MAP': [
//       {
//         g: 'h1',
//         i: 'j1'
//       },
//       {
//         g: 'h2',
//         i: 'j2'
//       },
//     ],
//     z: 'f'
//   }
// }

const newObject2 = immutable.ensureExists(obj, 'a.MAP.z', 'f',['MAP'])

// {
//   a: {
//     b: 'f',
//     c: ['d', 'f'],
//     'MAP': [
//       {
//         g: 'h1',
//         i: 'j1',
//         z:'f'
//       },
//       {
//         g: 'h2',
//         i: 'j2',
//         z:'f'
//       },
//     ],
//     z: 'f'
//   }
// }

const unchangedObject = immutable.get(obj, ['a', 'MAP','g'], 'f',['MAP'])

// {
//   a: {
//     b: 'f',
//     c: ['d', 'f'],
//     'MAP': [
//       {
//         g: 'h1',
//         i: 'j1'
//       },
//       {
//         g: 'h2',
//         i: 'j2'
//       },
//     ]
//   }
// }
```
