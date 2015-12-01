'use strict';
var expect = require('chai').expect
var op = require('./index.js')


describe('set', function() {
  it('should set a deep key without modifying the original object', function() {
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
    //this should be the same
    expect(newObj.c).to.be.equal(obj.c)
  
    expect(newObj.a.b).to.be.equal(3)
  })
  
  
  it('should set a deep array', function() {
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
  
  it('should create intermediate objects and array', function() {
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
    expect(newObj.a).to.be.eql({b: [, {f: 'a'}]})
  })
})


describe('push', function() {
  it('should push values without modifying the object', function() {
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
  
  it('should create intermediate objects/arrays', function() {
    var obj = {
      a: [],
      c: {}
    }
    
    var newObj = op.push(obj, 'a.0.1', 'b')
    
    expect(newObj).not.to.be.equal(obj)
    expect(newObj.a).not.to.be.equal(obj.a)
    expect(newObj.c).to.be.equal(obj.c)
    
    expect(newObj.a).to.be.eql([[, ['b']]])
  })
})

describe('del', function() {
  it('should delete deep values without modifying the object', function() {
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
  
  
  it('should delete deep values in array without modifying the object', function() {
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
})