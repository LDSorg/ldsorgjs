/*jshint -W054 */
;(function (exports) {
  'use strict';

  function LdsOrg() {
  }
  LdsOrg.toArray = function (mapOrArr) {
    if (!Array.isArray(mapOrArr) && 'object' === typeof mapOrArr) {
      mapOrArr = Object.keys(mapOrArr).map(function (key) {
        return mapOrArr[key];
      });
    }
    return mapOrArr;
  };
  // LdsOrg.mapIds(55555, 'wardUnitNo') // => { wardUnitNo: 55555 }
  LdsOrg.mapId = function (objOrId, idName) {
    var obj = {}
      ;

    if ('object' === typeof objOrId) {
      //return objOrId;
      obj[idName] = objOrId[idName];
      return obj;
    }

    // assume string
    obj[idName] = objOrId;
    return obj;
  };
  // LdsOrg.mapIds([55555], 'wardUnitNo') // => [{ wardUnitNo: 55555 }]
  LdsOrg.mapIds = function (array, name) {
    /*
    if ('object' === typeof array[0]) {
      return array;
    }
    */

    return array.map(function (element) {
      var obj = {}
        ;

      //obj[name] = element;
      obj[name] = LdsOrg.mapId(element, name)[name];
      return obj;
    });
  };
  LdsOrg._events = [
    "cacheInit"
  , "cacheReady"

  , "meta"
  //, "area"

  , "stakeInit"
  , "stakeCallingsInit"
  , "stakePositionsInit"
  , "stakePositions"
  , "stakeLeadershipInit"
  , "stakeLeadership"
  , "stakeCallings"
  , "stake"
    // gets wards
  , "stakeEnd"

  , "wardInit"
  , "wardCallingsInit"
  , "wardPositionsInit"
  , "wardPositions"
  , "wardLeadershipInit"
  , "wardLeadership"
  , "wardCallings"
  , "wardOrganizationsInit"
  , "wardOrganizationInit"
  , "wardOrganization"
  , "wardOrganizations"
  , "householdsInit"
  , "households"
    // gets households
  , "wardEnd"

  , "householdInit"
  , "household"
  , "householdPhotoInit"
  , "householdPhoto"
  , "individualPhotoInit"
  , "individualPhoto"
  , "householdEnd"
  ];

  var defaultKeepAlive = 1 * 24 * 60 * 60 * 1000
    , LdsOrgWard = (exports.LdsOrgWard || require('./ward').LdsOrgWard)
    , LdsOrgStake = (exports.LdsOrgStake || require('./stake').LdsOrgStake)
    , LdsStake = LdsOrgStake.init(LdsOrg, LdsOrgWard.init(LdsOrg))
    , ldsOrgP = LdsOrg.prototype
    , Join =  exports.Join || require('join').Join
    ;

  LdsOrg._urls = {};
  LdsOrg._urls.base = 'https://www.lds.org/directory/services/ludrs';

  //
  // Session Cacheable
  //
  // URLs
  LdsOrg._urls.currentStake = '/unit/current-user-units/';
  LdsOrg.getCurrentStakeUrl = function () {
    return LdsOrg._urls.base + LdsOrg._urls.currentStake;
  };
  LdsOrg._urls.currentMeta = '/unit/current-user-ward-stake/';
  LdsOrg.getCurrentMetaUrl = function () {
    return LdsOrg._urls.base + LdsOrg._urls.currentMeta;
  };
  LdsOrg._urls.currentUserId = '/mem/current-user-id/';
  LdsOrg.getCurrentUserIdUrl = function () {
    return LdsOrg._urls.base + LdsOrg._urls.currentUserId;
  };

  //
  // Ward Cacheable
  // (shared between users)
  //
  // URLs
  LdsOrg._urls.household = '/mem/householdProfile/{{household_id}}';
  // https://www.lds.org/directory/services/ludrs/mem/householdProfile/:head_of_house_individual_id
  LdsOrg.getHouseholdUrl = function (householdId) {
    return (LdsOrg._urls.base
            + LdsOrg._urls.household
                .replace(/{{household_id}}/g, householdId)
           );
  };
  LdsOrg._urls.wardLeadershipPositions = "/1.1/unit/ward-leadership-positions/{{ward_unit_no}}/true";
  // https://www.lds.org/directory/services/ludrs/1.1/unit/ward-leadership-positions/:ward_unit_no/true
  LdsOrg.getWardLeadershipPositionsUrl = function (wardUnitNo) {
    return (LdsOrg._urls.base
            + LdsOrg._urls.wardLeadershipPositions
                .replace(/{{ward_unit_no}}/g, wardUnitNo)
           );
  };
  LdsOrg._urls.wardLeadershipGroup = "/1.1/unit/stake-leadership-group-detail/{{ward_unit_no}}/{{group_key}}/{{instance}}";
  // https://www.lds.org/directory/services/ludrs/1.1/unit/stake-leadership-group-detail/:ward_unit_no/:group_key/:instance
  LdsOrg.getWardLeadershipGroupUrl = function (wardUnitNo, groupKey, instance) {
    return (LdsOrg._urls.base
            + LdsOrg._urls.wardLeadershipGroup
                .replace(/{{ward_unit_no}}/g, wardUnitNo)
                .replace(/{{group_key}}/g, groupKey)
                .replace(/{{instance}}/g, instance)
           );
  };
  LdsOrg._urls.wardOrganization = "/1.1/unit/roster/{{ward_unit_no}}/{{organization}}";
  // https://www.lds.org/directory/services/ludrs/1.1/unit/roster/:ward_unit_no/:organization
  LdsOrg.getWardOrganizationUrl = function (wardUnitNo, organization) {
    return (LdsOrg._urls.base
            + LdsOrg._urls.wardOrganization
                .replace(/{{ward_unit_no}}/g, wardUnitNo)
                .replace(/{{organization}}/g, organization)
           );
  };
  LdsOrg._urls.memberList = '/mem/member-list/';
  // https://www.lds.org/directory/services/ludrs/mem/member-list/:ward_unit_number
  LdsOrg.getMemberListUrl = function (wardUnitNo) {
    return LdsOrg._urls.base + LdsOrg._urls.memberList + wardUnitNo;
  };
  LdsOrg._urls.photos = '/mem/wardDirectory/photos/';
  // https://www.lds.org/directory/services/ludrs/mem/wardDirectory/photos/:ward_unit_number
  LdsOrg.getPhotosUrl = function (wardUnitNo) {
    return LdsOrg._urls.base + LdsOrg._urls.photos + wardUnitNo;
  };


  //
  // Stake Cacheable
  //
  // URLs
  LdsOrg._urls.stakeLeadershipPositions = "/1.1/unit/stake-leadership-positions/{{stake_unit_no}}";
  // https://www.lds.org/directory/services/ludrs/1.1/unit/stake-leadership-positions/:stake_unit_no
  LdsOrg.getStakeLeadershipPositionsUrl = function (stakeUnitNo) {
    return (LdsOrg._urls.base
            + LdsOrg._urls.stakeLeadershipPositions
                .replace(/{{stake_unit_no}}/g, stakeUnitNo)
           );
  };
  LdsOrg._urls.stakeLeadershipGroup = "/1.1/unit/stake-leadership-group-detail/{{stake_unit_no}}/{{group_key}}/{{instance}}";
  // https://www.lds.org/directory/services/ludrs/1.1/unit/stake-leadership-group-detail/:ward_unit_no/:group_key/:instance
  LdsOrg.getStakeLeadershipGroupUrl = function (stakeUnitNo, groupKey, instance) {
    return (LdsOrg._urls.base
            + LdsOrg._urls.stakeLeadershipGroup
                .replace(/{{stake_unit_no}}/g, stakeUnitNo)
                .replace(/{{group_key}}/g, groupKey)
                .replace(/{{instance}}/g, instance)
           );
  };

  // TODO abstract requests??
  // get cb, abstractUrl, { individualId: 123456 }, { cacheable: "cache://pic/:id", contentType: 'image' }
  // maybe use String.supplant?
  LdsOrg._getJSON = function (cb, opts) {
    //opts = opts || {};

    // opts.cacheId
    // opts.cache
    // opts.stake
    // opts.ward
    // opts.makeRequest
    // opts.store
    // opts.ldsOrg

    function respondWithCache(err, data) {
      var stale = true
        ;

      if (data) {
        stale = (Date.now() - opts.updatedAt) < (opts.keepAlive || defaultKeepAlive);
      }

      if (!(stale || opts.noCache || opts.expire)) {
        cb(null, data.value);
      } else {
        opts.ldsOrg.makeRequest(function (err, _data) {
          if (_data) {
            var obj = { _id: opts.cacheId, updatedAt: Date.now(), value: _data };
            obj._rev = (_data || {})._rev;
            if (!opts.noCache) {
              opts.store.put(function () {}, opts.cacheId, obj);
            }
          }
          cb(err, _data);
        }, opts.url);
      }
    }

    // TODO cache here by url
    // TODO assume base
    opts.store.get(respondWithCache, opts.cacheId);
  };
  LdsOrg._getImage = function (cb, opts) {
    function respondWithCache(err, data) {
      var stale = true
        ;

      if (data) {
        stale = (Date.now() - opts.updatedAt) < (opts.keepAlive || defaultKeepAlive);
      }

      if (!(stale || opts.noCache || opts.expire)) {
        cb(null, data.value);
      } else {
        opts.ldsOrg.getImageData(function (err, _data) {
          if (_data) {
            var obj = { _id: opts.cacheId, updatedAt: Date.now(), value: _data };
            obj._rev = (_data || {})._rev;
            if (!opts.noCache) {
              opts.store.put(function () {}, opts.cacheId, obj);
            }
          }
          cb(err, _data);
        }, opts.url);
      }
    }

    // TODO cache here by url
    // TODO assume base
    opts.store.get(respondWithCache, opts.cacheId);
  };

  LdsOrg.create = function (opts) {
    opts = opts || {};

    if (opts.node) {
      require('./node').LdsOrgNode.init(LdsOrg, ldsOrgP);
    } else if (opts.phantom) {
      require('./phantom').init(LdsOrg, ldsOrgP);
    } else {
      (exports.LdsOrgBrowser || require('./browser').LdsOrgBrowser).init(LdsOrg, ldsOrgP);
    }

    var ldsOrg = Object.create(LdsOrg.prototype)
      ;

    ldsOrg._Cache = opts.Cache;
    // TODO needs to be in an init function
    return ldsOrg;
  };

  // Organizations
  LdsOrg._organizations = [
    "HIGH_PRIEST"
  , "ELDER"
  , "RELIEF_SOCIETY"
  , "PRIEST"
  , "TEACHER"
  , "DEACON"
  , "LAUREL"
  , "MIA_MAID"
  , "BEEHIVE"
  , "ADULTS" // the lone plural organization
  ];

  ldsOrgP.init = function (cb, eventer) {
    var me = this
      ;

    me._emit = eventer || function () {};

    me._emit('cacheInit');

    me._store = new me._Cache({ ldsOrg: me });
    me._store.init(function () {
      me._emit('cacheReady');
      me.getUserMeta(cb);
    });
  };

  // Methods
  ldsOrgP.getCurrentUserId = function (fn) {
    var me = this
      ;

    LdsOrg._getJSON(
     function (err, id) {
        me._currentUserId = id;
        me._emit('currentUserId', id);
        fn(id);
      }
    , { url: LdsOrg.getCurrentUserIdUrl()
      , store: me._store
      , cacheId: 'current-user-id'
      , ldsOrg: me
      }
    );
  };
  ldsOrgP.getCurrentUnits = function (fn) {
    var me = this
      ;

    LdsOrg._getJSON(
      function (err, units) {
        me._currentUnits = units;
        me._emit('currentUnits', units);
        fn(units);
      }
    , { url: LdsOrg.getCurrentMetaUrl()
      , store: me._store
      , cacheId: 'current-units'
      , ldsOrg: me
      }
    );
  };
  ldsOrgP.getCurrentStakes = function (fn) {
    var me = this
      ;

    LdsOrg._getJSON(
      function (err, stakeList) {
        me._currentStakes = stakeList;
        me._emit('currentStakes', stakeList);
        fn(stakeList);
      }
    , { url: LdsOrg.getCurrentStakeUrl()
      , store: me._store
      , cacheId: 'current-stakes'
      , ldsOrg: me
      }
    );
  };



  //
  // Session Composite
  //
  ldsOrgP.getUserMeta = function (fn) {
    var me = this
      //, areaInfoId = 'area-info'
      //, stakesInfoId = 'stakes-info'
      , join = Join.create()
      , userJ = join.add()
      , metaJ = join.add()
      , stakeJ = join.add()
      ;

      me.areas = {};
      me.wards = {};
      me.stakes = {};

      me.homeArea = {};

    me.getCurrentUserId(function (userId) {
      me.currentUserId = userId;

      userJ(null, userId);
    });
    me.getCurrentUnits(function (units) {
      me._areaMeta = units;
      me.homeAreaId = units.areaUnitNo;
      me.homeStakeId = units.stakeUnitNo;
      me.homeWardId = units.wardUnitNo;
      me.homeArea.areaUnitNo = units.areaUnitNo;

      metaJ(null, units);
    });
    me.getCurrentStakes(function (stakes) {
      me.homeArea.stakes = stakes;
      me.homeAreaStakes = {};
      me.homeArea.stakes.forEach(function (stake) {
        me.homeAreaStakes[stake.stakeUnitNo] = stake;
        me.stakes[stake.stakeUnitNo] = stake;
      });
      // TODO me._emit('area', me.homeArea);

      Object.keys(me.stakes).forEach(function (stakeNo) {
        var stake = me.stakes[stakeNo]
          ;

        stake.wards.forEach(function (ward) {
          me.wards[ward.wardUnitNo] = ward;
        });
      });

      stakeJ(null, stakes);
    });

    join.then(function (userArgs, unitArgs, stakeArgs) {
      var meta
        ;

      meta = {
        currentUserId: userArgs[1]
      , currentUnits: unitArgs[1]
      , currentStakes: stakeArgs[1]
      };

      me.homeStake = me.stakes[me.homeStakeId];
      me.homeStakeWards = {};
      me.homeStake.wards.forEach(function (ward) {
        me.homeStakeWards[ward.wardUnitNo] = ward;
      });

      me.homeWard = me.wards[me.homeWardId];

      me._emit('meta', meta);
      fn(meta);
    });
  };
  ldsOrgP.getStake = function (stakeUnitNo) {
    var me = this
      ;

    me._realStakes = me._realStakes || {};
    if (!me._realStakes[stakeUnitNo]) {
      me._realStakes[stakeUnitNo] = LdsStake.create({ stakeUnitNo: stakeUnitNo }, me);
      me._realStakes[stakeUnitNo].init(function () {});
    }

    return me._realStakes[stakeUnitNo];
  };
  ldsOrgP.getCurrentStake = function () {
    var me = this
      ;

    return me.getStake(me.homeStakeId);
  };

  exports.LdsOrg = LdsOrg.LdsOrg = LdsOrg;

  if ('undefined' !== typeof module) {
    module.exports = exports.LdsOrg;
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
