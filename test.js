'use strict'

var expect = chai.expect

describe('Proxy', function() {
  it('exists', function() {
    expect(Proxy).to.be.a('function')
  })

  it('can do what the README says', function() {
    function observe(o, callback) {
      function buildProxy(prefix, o) {
	return new Proxy(o, {
	  'set': function(target, property, value) {
	    // same as above, but add prefix
	    callback(prefix + property, value);
	    target[property] = value;
            return true;
	  },
	  'get': function(target, property) {
	    // return a new proxy if possible, add to prefix
	    const out = target[property];
	    if (out instanceof Object) {
	      return buildProxy(prefix + property + '.', out);
	    }
	    return out;  // primitive, ignore
	  },
	});
      }

      return buildProxy('', o);
    }

    const x = {'model': {name: 'Falcon'}};
    var y = [];
    const p = observe(x, function(property, value) { y.push([property, value]) });
    p.model.name = 'Commodore';
    expect(p.model.name).to.eq('Commodore')
    expect(y).to.deep.equal([['model.name', 'Commodore']])
  })

  it('can implement method_missing', function() {
    var noMethods = {};
    var calls = [];
    var proxy = new Proxy(noMethods, {
      'get': function(target, property) {
        calls.push([target, property])
        return function() {}
      }
    });

    proxy.test1();
    proxy.test2();

    expect(calls).to.deep.equal([[noMethods, 'test1'], [noMethods, 'test2']])
  })
})
