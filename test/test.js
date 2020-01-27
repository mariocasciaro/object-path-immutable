/* globals describe, it */

var expect = require('chai').expect
var op = require('../')

function getTestObj () {
  return {
    a: 'b',
    b: {
      c: [],
      d: ['a', 'b'],
      e: [{}, { f: 'g' }],
      f: 'i'
    }
  }
}

describe('get', function () {
  it('should return the value using unicode key', function () {
    var obj = {
      '15\u00f8C': {
        '3\u0111': 1
      }
    }
    expect(op.get(obj, '15\u00f8C.3\u0111')).to.be.equal(1)
    expect(op.get(obj, ['15\u00f8C', '3\u0111'])).to.be.equal(1)
  })

  it('should return the value using dot in key', function () {
    var obj = {
      'a.b': {
        'looks.like': 1
      }
    }
    expect(op.get(obj, 'a.b.looks.like')).to.be.equal(undefined)
    expect(op.get(obj, ['a.b', 'looks.like'])).to.be.equal(1)
  })

  it('should return the value under shallow object', function () {
    var obj = getTestObj()
    expect(op.get(obj, 'a')).to.be.equal('b')
    expect(op.get(obj, ['a'])).to.be.equal('b')
  })

  it('should work with number path', function () {
    var obj = getTestObj()
    expect(op.get(obj.b.d, 0)).to.be.equal('a')
    expect(op.get(obj.b, 0)).to.be.equal(undefined)
  })

  it('should return the value under deep object', function () {
    var obj = getTestObj()
    expect(op.get(obj, 'b.f')).to.be.equal('i')
    expect(op.get(obj, ['b', 'f'])).to.be.equal('i')
  })

  it('should return the value under array', function () {
    var obj = getTestObj()
    expect(op.get(obj, 'b.d.0')).to.be.equal('a')
    expect(op.get(obj, ['b', 'd', 0])).to.be.equal('a')
  })

  it('should return the value under array deep', function () {
    var obj = getTestObj()
    expect(op.get(obj, 'b.e.1.f')).to.be.equal('g')
    expect(op.get(obj, ['b', 'e', 1, 'f'])).to.be.equal('g')
  })

  it('should return undefined for missing values under object', function () {
    var obj = getTestObj()
    expect(op.get(obj, 'a.b')).to.be.equal(undefined)
    expect(op.get(obj, ['a', 'b'])).to.be.equal(undefined)
  })

  it('should return undefined for missing values under array', function () {
    var obj = getTestObj()
    expect(op.get(obj, 'b.d.5')).to.be.equal(undefined)
    expect(op.get(obj, ['b', 'd', '5'])).to.be.equal(undefined)
  })

  it('should return the value under integer-like key', function () {
    var obj = { '1a': 'foo' }
    expect(op.get(obj, '1a')).to.be.equal('foo')
    expect(op.get(obj, ['1a'])).to.be.equal('foo')
  })

  it('should return the default value when the key doesnt exist', function () {
    var obj = { '1a': 'foo' }
    expect(op.get(obj, '1b', null)).to.be.equal(null)
    expect(op.get(obj, ['1b'], null)).to.be.equal(null)
  })

  it('should return the default value when path is empty', function () {
    var obj = { '1a': 'foo' }
    expect(op.get(obj, '', null)).to.be.deep.equal({ '1a': 'foo' })
    expect(op.get(obj, [])).to.be.deep.equal({ '1a': 'foo' })
    expect(op.get({ }, ['1'])).to.be.equal(undefined)
  })

  it('should return the default value when object is null or undefined', function () {
    expect(op.get(null, 'test', 'a')).to.be.deep.equal('a')
    expect(op.get(undefined, 'test', 'a')).to.be.deep.equal('a')
  })

  it(
    'should not fail on an object with a null prototype',
    function assertSuccessForObjWithNullProto () {
      var foo = 'FOO'
      var objWithNullProto = Object.create(null)
      objWithNullProto.foo = foo
      expect(op.get(objWithNullProto, 'foo')).to.equal(foo)
    }
  )

  it('should skip non own properties', function () {
    var Base = function (enabled) { }
    Base.prototype = {
      one: {
        two: true
      }
    }
    var Extended = function () {
      Base.call(this, true)
    }
    Extended.prototype = Object.create(Base.prototype)

    var extended = new Extended()

    expect(op.get(extended, ['one', 'two'])).to.be.equal(undefined)
    extended.enabled = true

    expect(op.get(extended, 'enabled')).to.be.equal(true)
    expect(op.get(extended, 'one')).to.be.equal(undefined)
  })
})

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
    expect(obj.a).to.be.eql({ b: 1 })
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
    expect(newObj.a).to.be.eql({ b: [, { f: 'a' }] }) // eslint-disable-line no-sparse-arrays
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
    expect(obj.a).to.be.eql({ b: 1 })
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
    expect(obj.a).to.be.eql({ b: 1 })
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
        e: [{}, { f: 'g' }],
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
        e: [{}, { f: 'g' }],
        f: 'i'
      }
    }
    obj.b.d = new Array(4)
    obj.b.d[0] = 'a'
    obj.b.d[1] = 'b'

    var newObj = op.insert(obj, 'b.d', 'asdf', 3)
    expect(newObj).not.to.be.equal(obj)
    expect(newObj.b.d[0]).to.be.eql('a')
    expect(newObj.b.d[1]).to.be.eql('b')
    // eslint-disable-next-line
    expect(newObj.b.d[2]).to.be.undefined
    expect(newObj.b.d[3]).to.be.eql('asdf')
    // eslint-disable-next-line
    expect(newObj.b.d[4]).to.be.undefined
    expect(newObj.b.d.length).to.be.eql(5)
  })

  it('should throw if asked to insert into something other than an array',
    function () {
      expect(function () {
        op.insert({ foo: 'bar' }, 'foo', 'baz')
      }).to.throw()
    })

  it('should return an array with an undefined value if passed an empty path and empty value and src is not an array', function () {
    var obj = {}

    expect(op.insert(obj, '')).to.be.deep.equal([undefined])
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

    expect(newObj.a).to.be.eql({ f: 2 })
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

    var newObj = op.assign(obj, 'a', { b: 3 })

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({ b: 1 })
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a.b).to.be.equal(3)
  })

  it('should keep existing fields that are not overwritten', function () {
    var obj = {
      a: {
        b: 1
      }
    }

    var newObj = op.assign(obj, 'a', { c: 2 })

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({ b: 1 })
    expect(newObj.a).to.be.eql({ b: 1, c: 2 })
  })

  it('should create intermediate objects', function () {
    var obj = {
      a: {},
      c: {
        d: 2
      }
    }

    var newObj = op.assign(obj, 'a.b', { f: 'a' })

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({})
    expect(newObj.a).to.be.eql({ b: { f: 'a' } })
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

describe('merge', function () {
  it('should merge an object without modifying the original object', function () {
    var obj = {
      a: {
        b: 1
      },
      c: {
        d: 2
      }
    }

    var newObj = op.merge(obj, 'a', { b: 3 })

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a).to.be.eql({ b: 1 })
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a.b).to.be.equal(3)
  })

  it('should properly merge objects', function () {
    var obj = {
      a: {
        b: 1,
        c: {
          d: 2,
          e: 3
        }
      }
    }

    var newObj = op.merge(obj, 'a', { c: { e: 4 } })

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(obj.a.b).to.be.eql(1)
    expect(newObj.a.c).to.be.eql({
      d: 2,
      e: 4
    })
  })

  it('should not merge arrays by default', function () {
    var obj = {
      a: {
        b: 1,
        c: {
          d: 2,
          e: [1]
        }
      }
    }

    var newObj = op.merge(obj, 'a', { c: { e: [2] } })

    expect(obj.a.b).to.be.eql(1)
    expect(newObj.a.c).to.be.eql({
      d: 2,
      e: [2]
    })
  })

  it('should not merge objects without a path', function () {
    var obj = {
      a: {
        b: 1,
        c: {
          d: 2,
          e: [1]
        }
      }
    }

    var newObj = op.merge(obj, null, { a: { c: { e: [2] } } })

    expect(obj.a.b).to.be.eql(1)
    expect(newObj.a.c).to.be.eql({
      d: 2,
      e: [2]
    })
  })

  it('should work if the destination is undefined', function () {
    var obj = {
      a: {
        b: 1,
        c: {
          d: 2,
          e: [1]
        }
      }
    }

    var newObj = op.merge(obj, 'a.c.f', { a: 1 })
    expect(newObj.a.c.f).to.be.eql({ a: 1 })
  })

  it('should work with wrap and if the destination is undefined', function () {
    var obj = {
      a: {
        b: 1,
        c: {
          d: 2,
          e: [1]
        }
      }
    }

    var newObj = op.wrap(obj).merge('a.c.f', { a: 1 }).value()
    expect(newObj.a.c.f).to.be.eql({ a: 1 })
  })
})

describe('bind', function () {
  it('should execute all methods on the wrapped object', function () {
    var obj = {
      a: {
        d: 1,
        f: 2
      },
      c: {}
    }

    var newObj = op.wrap(obj).set('a.q', 'q').del('a.d').update('a.f', function (v) {
      return v + 1
    }).value()

    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)

    expect(newObj.a).to.be.eql({ f: 3, q: 'q' })
  })

  it('should return the wrapped object if no operations made', function () {
    var obj = {}

    expect(op.wrap(obj).value()).to.be.equal(obj)
  })

  it('should throw if an operation is attempted after `value` called', function () {
    var transaction = op.wrap({
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
