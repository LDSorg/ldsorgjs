/*jshint -W054 */
;(function (exports) {
  'use strict';

  var LdsOrg = exports.LdsOrg || require('./ldsorg').LdsOrg
    , Cache = exports.LdsOrgCache || require('./cache').LdsOrgCache
    , ldsorg
    , ts = Date.now()
    , username
    , password
    , isNode
    ;

  if ('undefined' !== typeof process && process.argv) {
    username = process.argv[2];
    password = process.argv[3];
    isNode = true;
  }

  function log(event/*, a, b, c, d*/) {
    console.log('[LOG]', event);
  }

  function getErDone() {
    console.log('User Meta Data Gathered', ((Date.now() - ts) / 1000).toFixed(2) + 's');
    /*
    ldsorg.getHouseholdWithPhotos(function (data) {
      console.log(data);
    }, '5754908622', {});
    ldsorg.getCurrentUserId(function (id) {
      console.log('got user id', id);
    });
    */
    ldsorg.getCurrentStake().getAll(function () {
      console.log('got current stake', ((Date.now() - ts) / 1000).toFixed(2) + 's');
    });
    ldsorg.getCurrentStake().getCurrentWard().getAll(function () {
      console.log('got current ward', ((Date.now() - ts) / 1000).toFixed(2) + 's');
    });
  }

  ldsorg = LdsOrg.create({ node: isNode, Cache: Cache, cacheOpts: { cacheDir: __dirname + '/data' } });
  ldsorg.signin(
    function (err) {
      console.log('sign-in complete');
      if (err) {
        console.log('failed', err);
        return;
      }

      ldsorg.init(getErDone, log, { node: isNode });
    }
  , { username: username, password: password }
  );

  //exports.LdsOrgTest = LdsOrgTest.LdsOrgTest = LdsOrgTest;
}('undefined' !== typeof exports && exports || new Function('return this')()));
