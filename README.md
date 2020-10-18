object-path-immutable-rowrowrowrow
===========

This repo is based on https://github.com/mariocasciaro/object-path-immutable with added features. Namely the following:

1. Get method is not imported from https://github.com/mariocasciaro/object-path.
2. Support performing some methods recursively on all items in a deepset array.
3. Adds an ensureExists method which does not mutate the source if the target property is set.

Please checkout mariocasciaro's repo for more information.

Tiny JS library to modify deep object properties without modifying the original object (immutability).
Works great with React (especially when using `setState()`) and Redux (inside a reducer).

This can be seen as a simpler and more intuitive alternative to the *React Immutability Helpers* and *Immutable.js*.

## Changelog

[View Changelog](CHANGELOG.md)

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
// obj.a.b !== newObj.a.b

// However:
// obj.a.c === newObj.a.c
```

### Wrap mode

You can also chain the api's and call `value()` at the end to retrieve the resulting object.

```javascript
const newObj = immutable.wrap(obj).set('a.b', 'f').del('a.c.0').value()
```

## API

```javascript
// Premises

const obj = {
  a: {
    b: 'c',
    c: ['d', 'f']
  }
}

import * as immutable from 'object-path-immutable'
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

### Getters (not available in wrap mode)

#### get (object, path, defaultValue)

Not mported from [object-path](https://github.com/mariocasciaro/object-path) so as to allow recursive get on deepset arrays.
