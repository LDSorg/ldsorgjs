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
    .then(function (/*meta*/) {
      return ldsorg.getCurrentStake().getCurrentWard().getAll({ fullHouseholds: false });
    })
    .catch(function (err) {
      console.error('Get Current Ward Failure:');
      console.error(err);
      throw err;
    })
    .then(function (stake) {
      console.log(Object.keys(stake));
      console.log(Object.keys(stake.ward));
      console.log(Object.keys(stake.organizations));
      console.log(Object.keys(stake.callings));
      console.log('SUCCESS');
      process.exit();
    })
    ;

  //exports.LdsOrgTest = LdsOrgTest.LdsOrgTest = LdsOrgTest;
}('undefined' !== typeof exports && exports || new Function('return this')()));
