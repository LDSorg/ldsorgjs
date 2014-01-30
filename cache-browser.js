/*jshint -W054 */
;(function (exports) {
  'use strict';

  var cachep
    , caches = { stakes: {}, wards: {} }
    ;

  function LdsOrgCache(opts) {
    var me = this
      , store = {}
      ;

    me._opts = opts;

    if (me._opts.ldsOrg && !me._opts.ldsStake && !me._opts.ldsWard) {
      return {
        get: function (cb, id) { setTimeout(function () { cb(null, store[id]); }); }
      , put: function (cb, data) { store[data._id] = data; if (cb) { cb(null); } }
      , destroy: function (cb, id) { delete store[id]; if (cb) { cb(null); } }
      , init: function (cb) { cb(); }
      , clear: function (cb) { store = {}; cb(); }
      };
    }
  }
  cachep = LdsOrgCache.prototype;

  cachep.init = function (ready) {
    var me = this
      ;

    function getStakeCache(stake) {
      me._data = caches.stakes[stake._stakeUnitNo] || {};

      me._data = {};
      me._save();

      ready();
    }

    function getWardCache(ward) {
      me._data = caches.wards[ward._wardUnitNo] || {};
      me._save();

      ready();
    }

    if (me._opts.ldsWard) {
      getWardCache(me._opts.ldsWard);
      return;
    }

    if (me._opts.ldsStake) {
      getStakeCache(me._opts.ldsStake);
      return;
    }
  };

  cachep._save = function () {
    // do nothing
  };

  cachep.get = function (fn, cacheId) {
    var me = this
      ;

    setTimeout(function () {
      fn(null, me._data[cacheId]);
    }, 0);
  };

  cachep.put = function (fn, cacheId, obj) {
    var me = this
      ;

    me._data[cacheId] = obj;

    clearTimeout(me._token);
    me._token = setTimeout(function () {
      me._save();
    }, 1000);

    fn(null);
  };

  cachep.destroy = function (fn, cacheId) {
    var me = this
      ;

    delete me._data[cacheId];

    clearTimeout(me._token);
    me._token = setTimeout(function () {
      me._save();
    }, 1000);

    fn(null);
  };

  cachep.clear = function (fn) {
    var me = this
      ;

    me._data = {};

    clearTimeout(me._token);
    me._token = setTimeout(function () {
      me._save();
    }, 1000);

    fn(null);
  };

  exports.LdsOrgCache = LdsOrgCache.LdsOrgCache = LdsOrgCache;

  if ('undefined' !== typeof module) {
    module.exports = exports.LdsOrgCache;
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
