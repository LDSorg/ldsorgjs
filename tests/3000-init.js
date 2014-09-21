/*jshint -W054 */
;(function (exports) {
  'use strict';

  var LdsOrg = exports.LdsOrg || require('../ldsorg').LdsOrg
    , Cache = exports.LdsOrgCache || require('../cache').LdsOrgCache
    , ldsorg
    , username
    , password
    , isNode
    ;

  if ('undefined' !== typeof process && process.argv) {
    username = process.argv[2] || require('./config').username;
    password = process.argv[3] || require('./config').password;
    isNode = true;
  }

  function notify(event/*, a, b, c, d*/) {
    console.log('[LOG]', event);
  }

  ldsorg = LdsOrg.create({
    node: isNode
  , Cache: Cache
  , cacheOpts: { cacheDir: __dirname + '/data' }
  , prefetch: false
  });

  ldsorg.signin({ username: username, password: password })
    .then(function () {
      return ldsorg.init(notify, { node: isNode });
    })
    .catch(function (err) {
      console.error('init failed (have you tested sign-in?)');
      console.error(err);
      throw err;
    })
    .then(function (meta) {
      console.log(Object.keys(meta));
      console.log('SUCCESS');
      process.exit();
    })
    ;

  //exports.LdsOrgTest = LdsOrgTest.LdsOrgTest = LdsOrgTest;
}('undefined' !== typeof exports && exports || new Function('return this')()));
