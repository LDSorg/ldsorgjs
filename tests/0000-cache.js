/*jshint -W054 */
;(function (exports) {
  'use strict';

  var Cache = exports.LdsOrgCache || require('../cache').LdsOrgCache
    ;

  function testAlone() {
    var c = Cache.create({}, {})
      , p
      ;

    p = c.init();

    return p.then(function () {
      return c.put('foo', { foo: 'bar' }).then(function () {
        return c.get('foo').then(function (data) {
          if (!data.foo) {
            throw new Error('missing value that was just saved');
          }
          console.log(data);
        });
      });
    });
  }

  function testWithWard() {
    var c = Cache.create({ ldsWard: { _wardUnitNo: 'foo' } }, {})
      ;

    return c.init().then(function () {
      return c.put('foo', { foo: 'bar' }).then(function () {
        return c.get('foo').then(function (data) {
          if (!data.foo) {
            throw new Error('missing value that was just saved');
          }
          console.log(data);
        });
      });
    });
  }

  testAlone()
    .then(function () {
      console.log('Tested by itself');
    })
    .then(function () {
      return testWithWard();
    }).then(function () {
      console.log('Tested with ward');
      process.exit();
    })
    ;

  /*
  function testWithStake() {
  }
  */

}('undefined' !== typeof exports && exports || new Function('return this')()));
