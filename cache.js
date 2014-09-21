/*jshint -W054 */
;(function (exports) {
  'use strict';

  var path = require('path')
    , PromiseA = require('bluebird').Promise
    , _p
    , fs = PromiseA.promisifyAll(require('fs'))
    ;

  function LdsOrgCache(opts, opts2) {
    var me = this
      ;

    if (!(me instanceof LdsOrgCache)) {
      return new LdsOrgCache(opts, opts2);
    }

    me._opts = opts;
    me._opts.cacheDir = opts2.cacheDir || __dirname;

    // TODO remind myself why I'm doing this
    if (me._opts.ldsOrg && !me._opts.ldsStake && !me._opts.ldsWard) {
      me._nosave = true;
    }
  }

  LdsOrgCache.create = LdsOrgCache;
  _p = LdsOrgCache.prototype;

  _p.init = function () {
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
      }

      return PromiseA.resolve();
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
      }

      return PromiseA.resolve();
    }

    if (me._opts.ldsWard) {
      return getWardCache(me._opts.ldsWard);
    } else if (me._opts.ldsStake) {
      return getStakeCache(me._opts.ldsStake);
    } else {
      me._data = {};
      return PromiseA.resolve();
    }
  };

  _p._save = function (opts) {
    var me = this
      ;

    if (me._nosave) {
      return PromiseA.resolve();
    }
    opts = opts || {};

    function save() {
      clearTimeout(me._writet);
      me._writes = 0;
      me._writep = fs.writeFileAsync(me._filepath, JSON.stringify(me._data, null, '  '), 'utf8');
      return me._writep;
    }

    if (me._writes && me._writes > 1000) {
      return save();
    }
    me._writes += 1;

    if (opts.immediate) {
      return save();
    }

    return new PromiseA(function (resolve) {
      me._writet = setTimeout(function () {
        save().then(resolve);
      }, 30 * 1000);
    });
  };

  _p.get = function (cacheId) {
    var me = this
      ;

    return PromiseA.resolve(me._data[cacheId]);
  };

  _p.put = function (cacheId, obj) {
    var me = this
      ;

    me._data[cacheId] = obj;
    me._save();
    return PromiseA.resolve();
  };

  _p.destroy = function (cacheId) {
    var me = this
      ;

    delete me._data[cacheId];
    me._save();
    return PromiseA.resolve();
  };

  _p.clear = function () {
    var me = this
      ;

    me._data = {};
    return me._save({ immediate: true });
  };

  module.exports = exports = exports.LdsOrgCache = LdsOrgCache.LdsOrgCache = LdsOrgCache;
}('undefined' !== typeof exports && exports || new Function('return this')()));
