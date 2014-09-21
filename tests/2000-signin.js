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

  ldsorg = LdsOrg.create({
    node: isNode
  , Cache: Cache
  , cacheOpts: { cacheDir: __dirname + '/data' }
  , prefetch: false
  });

  ldsorg.signin({ username: username, password: password })
    .catch(function (err) {
      console.error(err);
      console.log('sign-in failed');
    })
    .then(function () {
      // there is no useful as response to sign-in
      console.log('SUCCESS');
    })
    ;

  //exports.LdsOrgTest = LdsOrgTest.LdsOrgTest = LdsOrgTest;
}('undefined' !== typeof exports && exports || new Function('return this')()));