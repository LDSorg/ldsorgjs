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
    username = process.argv[2];
    password = process.argv[3];
    isNode = true;
  }

  ldsorg = LdsOrg.create({
    node: isNode
  , Cache: Cache
  , cacheOpts: { cacheDir: __dirname + '/data' }
  , prefetch: false
  });

  if (ldsorg) {
    console.log('SUCCESS');
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
