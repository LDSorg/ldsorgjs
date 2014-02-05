/*jshint -W054 */
;(function (exports) {
  'use strict';

  var fs = require('fs')
    , path = require('path')
    , cachep
    ;

  function LdsOrgCache(opts, opts2) {
    var me = this
      , store = {}
      ;

    if (!(me instanceof LdsOrgCache)) {
      return new LdsOrgCache(opts, opts2);
    }

    me._opts = opts;
    me._opts.cacheDir = opts2.cacheDir || __dirname;

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
  LdsOrgCache.create = LdsOrgCache;
  cachep = LdsOrgCache.prototype;

  cachep.init = function (ready) {
    var me = this
      ;

    function getStakeCache(stake) {
      var dirpath = path.join(me._opts.cacheDir, 'stakes')
        ;

      me._filepath = path.join(dirpath, stake._stakeUnitNo + '.json');

      if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
      }

      try {
        me._data = require(me._filepath);
      } catch(e) {
        me._data = {};
        me._save();
      }

      ready();
    }

    function getWardCache(ward) {
      var dirpath = path.join(me._opts.cacheDir, 'wards')
        ;

      me._filepath = path.join(dirpath, ward._wardUnitNo + '.json');

      if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
      }

      try {
        me._data = require(me._filepath);
      } catch(e) {
        me._data = {};
        me._save();
      }

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
    var me = this
      ;

    fs.writeFileSync(me._filepath, JSON.stringify(me._data, null, '  '), 'utf8');
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

  module.exports = exports = exports.LdsOrgCache = LdsOrgCache.LdsOrgCache = LdsOrgCache;
}('undefined' !== typeof exports && exports || new Function('return this')()));
