/* globals describe, it */

'use strict'

var expect = require('chai').expect
var op = require('./index.js')

describe('set', function () {
  it('should set a deep key without modifying the original object', function () {
    var obj = {
      a: {
        b: 1
      },
      c: {
        d: 2
      }
    }

    var newObj = op.set(obj, 'a.b', 3)

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({b: 1})
    // this should be the same
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a.b).to.be.equal(3)
  })

  it('should set a deep array', function () {
    var obj = {
      a: {
        b: [1, 2, 3]
      },
      c: {
        d: 2
      }
    }

    var newObj = op.set(obj, 'a.b.1', 4)

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.a.b).not.to.be.equal(obj.a.b)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a.b).to.be.eql([1, 4, 3])
  })

  it('should create intermediate objects and array', function () {
    var obj = {
      a: {},
      c: {
        d: 2
      }
    }

    var newObj = op.set(obj, 'a.b.1.f', 'a')

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({})
    expect(newObj.a).to.be.eql({b: [, {f: 'a'}]}) // eslint-disable-line no-sparse-arrays
  })

  it('should return the input value if passed an empty path', function () {
    var obj = {}

    expect(op.set(obj, '', 'yo')).to.be.equal('yo')
  })

  it('should set at a numeric path', function () {
    expect(op.set([], 0, 'yo')).to.deep.equal(['yo'])
  })
})

describe('update', function () {
  it('should update a deep key', function () {
    var obj = {
      a: {
        b: 1
      },
      c: {
        d: 2
      }
    }

    var newObj = op.update(obj, 'a.b', function (value) {
      return value + 1
    })

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({b: 1})
    // this should be the same
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a.b).to.be.equal(2)
  })

  it('should work on empty path', function () {
    var obj = {
      a: {
        b: 1
      },
      c: {
        d: 2
      }
    }

    var newObj = op.update(obj, [], function (value) {
      value.e = 3
      return value
    })

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).to.be.equal(obj.a)
    expect(obj.a).to.be.eql({b: 1})
    // this should be the same
    expect(newObj.c).to.be.equal(obj.c)
    expect(newObj.a.b).to.be.equal(1)
    expect(newObj.e).to.be.equal(3)
  })
})

describe('insert', function () {
  it('should insert value into existing array without modifying the object', function () {
    var obj = {
      a: ['a'],
      c: {}
    }

    var newObj = op.insert(obj, 'a', 'b', 0)

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql(['b', 'a'])
  })

  it('should create intermediary array', function () {
    var obj = {
      a: [],
      c: {}
    }

    var newObj = op.insert(obj, 'a.0.1', 'b')

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql([[, ['b']]]) // eslint-disable-line no-sparse-arrays
  })

  it('should insert in another index', function () {
    var obj = {
      a: 'b',
      b: {
        c: [],
        d: ['a', 'b'],
        e: [{}, {f: 'g'}],
        f: 'i'
      }
    }

    var newObj = op.insert(obj, 'b.d', 'asdf', 1)

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.b.d).to.be.eql(['a', 'asdf', 'b'])
  })

  it('should handle sparse array', function () {
    var obj = {
      a: 'b',
      b: {
        c: [],
        d: ['a', 'b'],
        e: [{}, {f: 'g'}],
        f: 'i'
      }
    }
    obj.b.d = new Array(4)
    obj.b.d[0] = 'a'
    obj.b.d[1] = 'b'

    var newObj = op.insert(obj, 'b.d', 'asdf', 3)
    expect(newObj).not.to.be.equal(obj)
    expect(newObj.b.d).to.be.eql(['a', 'b', , 'asdf']) // eslint-disable-line no-sparse-arrays
  })

  it('should throw if asked to insert into something other than an array',
    function () {
      expect(function () {
        op.insert({foo: 'bar'}, 'foo', 'baz')
      }).to.throw()
    })

  it('should return an array with an undefined value if passed an empty path and empty value and src is not an array', function () {
    var obj = {}

    expect(op.insert(obj, '')).to.be.deep.equal([void 0])
  })

  it('should insert the value in src if passed an empty path', function () {
    var obj = ['a', 'b', 'c']

    expect(op.insert(obj, '', 'd', 1)).to.be.deep.equal(['a', 'd', 'b', 'c'])
  })

  it('should insert at a numeric path', function () {
    expect(op.insert([[23, 42]], 0, 'yo', 1)).to.deep.equal([[23, 'yo', 42]])
  })
})

describe('push', function () {
  it('should push values without modifying the object', function () {
    var obj = {
      a: ['a'],
      c: {}
    }

    var newObj = op.push(obj, 'a', 'b')

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql(['a', 'b'])
  })

  it('should create intermediate objects/arrays', function () {
    var obj = {
      a: [],
      c: {}
    }

    var newObj = op.push(obj, 'a.0.1', 'b')

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql([[, ['b']]]) // eslint-disable-line no-sparse-arrays
  })

  it('should push into the cloned original object if passed an empty path', function () {
    var obj = ['yoo']

    expect(op.push(obj, '', 'yo')).to.deep.equal(['yoo', 'yo'])
  })

  it('returns new array if passed an empty path and src is not an array', function () {
    var obj = {}

    expect(op.push(obj, '', 'yo')).to.deep.equal(['yo'])
  })

  it('should push at a numeric path', function () {
    expect(op.push([[]], 0, 'yo')).to.deep.equal([['yo']])
  })
})

describe('del', function () {
  it('should delete deep values without modifying the object', function () {
    var obj = {
      a: {
        d: 1,
        f: 2
      },
      c: {}
    }

    var newObj = op.del(obj, 'a.d')

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql({f: 2})
  })

  it('should delete deep values in array without modifying the object', function () {
    var obj = {
      a: ['a'],
      c: {}
    }

    var newObj = op.del(obj, 'a.0')

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql([])
  })

  it('should return undefined if passed an empty path', function () {
    var obj = {}

    expect(op.del(obj, '')).to.be.equal(undefined)
  })

  it('should del at a numeric path', function () {
    expect(op.del([23, 'yo', 42], 1)).to.deep.equal([23, 42])
  })

  it('should delete falsy value', function () {
    expect(op.del(['', false], 1)).to.deep.equal([''])
  })
})

describe('assign', function () {
  it('should assign an object without modifying the original object', function () {
    var obj = {
      a: {
        b: 1
      },
      c: {
        d: 2
      }
    }

    var newObj = op.assign(obj, 'a', {b: 3})

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({b: 1})
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a.b).to.be.equal(3)
  })

  it('should keep existing fields that are not overwritten', function () {
    var obj = {
      a: {
        b: 1
      }
    }

    var newObj = op.assign(obj, 'a', {c: 2})

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({b: 1})
    expect(newObj.a).to.be.eql({b: 1, c: 2})
  })

  it('should create intermediate objects', function () {
    var obj = {
      a: {},
      c: {
        d: 2
      }
    }

    var newObj = op.assign(obj, 'a.b', {f: 'a'})

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({})
    expect(newObj.a).to.be.eql({b: {f: 'a'}})
  })

  it('should return the original object if passed an empty path and an empty value to assign', function () {
    var obj = {}

    expect(op.assign(obj, '', {})).to.be.equal(obj)
  })

  it('should assign at a numeric path', function () {
    expect(op.assign([{
      foo: 'bar'
    }], 0, {
      foo: 'baz',
      fiz: 'biz'
    })).to.deep.equal([{
      foo: 'baz',
      fiz: 'biz'
    }])
  })

  it('does not assign inherited properties', function () {
    var base = {
      fiz: 'biz'
    }

    var source = Object.create(base)
    source.frob = 'nard'

    var obj = {
      foo: {}
    }

    expect(op.assign(obj, 'foo', source)).to.deep.equal({
      foo: {
        frob: 'nard'
      }
    })
  })
})

describe('bind', function () {
  it('should execute all methods on the bound object', function () {
    var obj = {
      a: {
        d: 1,
        f: 2
      },
      c: {}
    }

    var newObj = op(obj).set('a.q', 'q').del('a.d').update('a.f', function (v) {
      return v + 1
    }).value()

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql({f: 3, q: 'q'})
  })

  it('should return the bound object if no operations made', function () {
    var obj = {}

    expect(op(obj).value()).to.be.equal(obj)
  })

  it('should throw if an operation is attempted after `value` called', function () {
    var transaction = op({
      foo: 'bar',
      fiz: [],
      frob: {}
    })

    transaction.value()

    expect(function () {
      transaction.set('foo', 'baz')
    }).to.throw()

    expect(function () {
      transaction.push('fiz', 'biz')
    }).to.throw()

    expect(function () {
      transaction.insert('fiz', 'biz', 23)
    }).to.throw()

    expect(function () {
      transaction.del('foo')
    }).to.throw()

    expect(function () {
      /* istanbul ignore next */
      transaction.update('foo', function (v) {
        return v + 'bar'
      })
    }).to.throw()

    expect(function () {
      transaction.assign('frob', {
        nard: 23
      })
    }).to.throw()
  })
})
