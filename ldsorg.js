/*jshint -W054 */
;(function (exports) {
  'use strict';

  var forEachAsync = exports.forEachAsync || require('foreachasync').forEachAsync
    , PromiseA = require('bluebird').Promise
    ;

  function LdsOrg(opts) {
    var me = this
      ;

    if (!(me instanceof LdsOrg)) {
      return new LdsOrg(opts);
    }

    opts = opts || {};

    if (opts.node) {
      require('./node').LdsOrgNode.init(LdsOrg, ldsOrgP);
    } else if (opts.phantom) {
      require('./phantom').init(LdsOrg, ldsOrgP);
    } else {
      (exports.LdsOrgBrowser || require('./browser').LdsOrgBrowser).init(LdsOrg, ldsOrgP);
    }

    me._prefetch = opts.prefetch;
    me._Cache = opts.Cache;
    me._cacheOpts = opts.cacheOpts || {};
    me._promises = {};
  }
  LdsOrg.create = LdsOrg;

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
  LdsOrg._urls.currentUserInfo = '/mem/current-user-info/';
  LdsOrg.getCurrentUserInfoUrl = function () {
    return LdsOrg._urls.base + LdsOrg._urls.currentUserInfo;
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
  LdsOrg._urls.individualPhotos = '/photo/url/{{individual_ids}}/individual';
  LdsOrg.getIndividualPhotosUrl = function (individualIds) {
    return (LdsOrg._urls.base
            + LdsOrg._urls.individualPhotos
                .replace(/{{individual_ids}}/g, individualIds.join(','))
           );
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

  // TODO move lateral here
  // TODO abstract requests??
  // get cb, abstractUrl, { individualId: 123456 }, { cacheable: "cache://pic/:id", contentType: 'image' }
  // maybe use String.supplant?
  LdsOrg._getJSON = function (opts) {
    //opts = opts || {};

    // opts.cacheId
    // opts.cache
    // opts.stake
    // opts.ward
    // opts.makeRequest
    // opts.store
    // opts.ldsOrg

    function respondWithCache(data) {
      var stale = true
        // , useless // TODO determine if it's way too stale
        , promiseId = opts.cacheId || opts.url
        , p
        ;

      // respond with the old data, but queue up new data in the background
      if (data) {
        stale = (Date.now() - data.updatedAt) < (opts.keepAlive || defaultKeepAlive);

        if (!opts.noCache) {
          return PromiseA.resolve(data.value);
        }

        if (!stale) {
          // if it is stale we should continue to do other things
          return;
        }
      }

      // keep around the promise for this request in case it is made
      // multiple times before it is fulfilled
      if (opts.ldsOrg._promises[promiseId]) {
        p = opts.ldsOrg._promises[promiseId];
      } else {
        p = opts.ldsOrg._promises[promiseId] = opts.ldsOrg.makeRequest(opts.url)
          .then(function (data) {
            delete opts.ldsOrg._promises[promiseId];
            return data;
          })
          .catch(function (err) {
            delete opts.ldsOrg._promises[promiseId];
            throw err;
          })
          ;
      }
      
      return p.then(function (_data) {
        if (opts.cacheId && !opts.noCache) {
          var obj = { _id: opts.cacheId, updatedAt: Date.now(), value: _data };
          obj._rev = (_data || {})._rev;

          return opts.store.put(opts.cacheId, obj).then(function () {
            return obj.value;
          });
        }
      }).catch(function (err) {
        console.error(err);
        throw err;
      });
    }

    // TODO cache here by url
    // TODO assume base
    if (opts.cacheId) {
      return opts.store.get(opts.cacheId).then(respondWithCache);
    } else {
      return respondWithCache();
    }
  };

  LdsOrg._getImage = function (cb, opts) {
    function respondWithCache(data) {
      var stale = true
        // , useless // TODO determine if it's way too stale
        , promiseId = opts.cacheId || opts.url
        ;

      // respond with the old data, but queue up new data in the background
      if (data) {
        stale = (Date.now() - data.updatedAt) < (opts.keepAlive || defaultKeepAlive);
        if (!opts.noCache) {
          cb(null, data.value);
          cb = function () {};
          return PromiseA.resolve(data.value);
        }
        if (!stale) {
          return;
        }
      }

      // poor-man's promises
      if (opts.ldsOrg._promises[promiseId]) {
        opts.ldsOrg._promises[promiseId].push(cb);
        return;
      } else {
        opts.ldsOrg._promises[promiseId] = [cb];
      }

      opts.ldsOrg.getImageData(function (err, _data) {
        if (_data && opts.cacheId && !opts.noCache) {
          var obj = { _id: opts.cacheId, updatedAt: Date.now(), value: _data };
          obj._rev = (_data || {})._rev;
          opts.store.put(opts.cacheId, obj);
        }

        opts.ldsOrg._promises[promiseId].forEach(function (cb) {
          cb(err, _data);
        });
        delete opts.ldsOrg._promises[promiseId];
      }, opts.url);
    }

    // TODO cache here by url
    // TODO assume base
    return opts.store.get(opts.cacheId).then(respondWithCache);
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

  ldsOrgP.init = function (eventer) {
    var me = this
      , cacheOpts = {}
      ;

    me.areas = {};
    me.wards = {};
    me.stakes = {};
    me.homeArea = {};
    me.homeAreaStakes = {};
    me.homeStakeWards = {};

    Object.keys(me._cacheOpts).forEach(function (key) {
      cacheOpts[key] = me._cacheOpts[key];
    });
    cacheOpts.ldsOrg = me;

    me._emit = eventer || function () {};

    me._emit('cacheInit');


    me._store = me._Cache.create(cacheOpts, cacheOpts);
    return me._store.init().then(function () {
      var p
        ;

      me._emit('cacheReady');
      p = me.getCurrentUserMeta();
      return p;
    });
  };

  ldsOrgP.signin = function (auth) {
    var me = this
      , guestRe
      ;

    me._auth = me._auth || auth;

    guestRe = /^(gandalf|dumbledore|test|guest|demo|aoeu|asdf|root|admin|secret|pass|password|12345678|anonymous)$/i;
    if (!me._auth || !me._auth.username) {
      return PromiseA.reject(new Error("You didn't specify a username."));
    }
    if (this._hogwarts || (guestRe.test(me._auth.username) && guestRe.test(me._auth.password))) {
      if (exports.window) {
        if (!this._hogwarts) {
          exports.window.alert("You are using a demo account. Welcome to Hogwarts!");
        }
      }
      if (!this._hogwarts) {
        console.info('Welcome to Hogwarts! ;-)');
      }
      this._hogwarts = true;
      return PromiseA.resolve(null);
    }

    return new PromiseA(function (resolve, reject) {
      me._signin(function (err, data) {
        if (!err) {
          me._authenticated = Date.now();
        }

        if (err) {
          return reject(err);
        } else {
          return resolve(data);
        }
      }, me._auth);
    });
  };
  ldsOrgP.signout = function () {
    var me = this
      ;

    this._hogwarts = false;
    return ldsOrgP._signout().then(function () {
      me._authenticated = 0;
    });
  };
  ldsOrgP.makeRequest = function (url) {
    var me = this
      , count = 0
      ;

    function doItNow() {
      return me._makeRequest(url)
        .catch(function (err) {
          if (err && count < 2) {
            console.error('Request Failed:', url);
            console.error(err);
            count += 1;
            return me.signin().catch(doItNow);
          }
          
          throw err;
        })
        ;
    }

    if (this._hogwarts) {
      if (!this._hogwartsBackend) {
        this._hogwartsBackend = (exports.Hogwarts || require('./hogwarts').Hogwarts).create();
        require('fs').writeFileSync('./hogwarts.cache', JSON.stringify(this._hogwartsBackend.cache, null, '  '));
      }
      me._makeRequest = this._hogwartsBackend.makeRequest;
    }

    // I think the lds.org timeout is about 15 to 30 minutes of inactivity, not entirely sure
    // It would take about 1.5 hrs to download a complete area
    // at 25s per ward with 11 wards per stake and 18 stakes
    if (!me._authenticated || (Date.now() - me._authenticated > 30 * 60 * 1000)) {
      return me.signin(me._auth).then(doItNow);
    } else {
      return doItNow();
    }
  };
  ldsOrgP.getImageData = function (next, imgSrc) {
    var me = this
      ;

    if (this._hogwarts) {
      this._getImageData(next, imgSrc);
      return;
    }

    function doItNow() {
      me._getImageData(next, 'https://www.lds.org' + imgSrc);
    }

    if (!me._authenticated) {
      // Note that the photo path would have probably expired by this time... but whatevs
      me._signin(doItNow);
    } else {
      doItNow();
    }
  };

  // Methods
  ldsOrgP.getCurrentUserId = function (fn) {
    var me = this
      ;

    return me.getCurrentUserInfo(function (userInfo) {
      fn(userInfo.individualId);
    });
  };
  ldsOrgP.getCurrentUserInfo = function (fn) {
    var me = this
      ;

    return LdsOrg._getJSON(
      { url: LdsOrg.getCurrentUserInfoUrl()
      , store: me._store
      , cacheId: 'current-user-info'
      , ldsOrg: me
      }
    ).then(function (data) {
      me._currentUserId = data.individualId;
      me._emit('currentUserId', data.individualInfo);
      me._currentUserInfo = data;
      me._emit('currentUserInfo', data);
      fn(data);

      return data;
    });
  };
  ldsOrgP.getCurrentUnits = function (fn) {
    var me = this
      ;

    return LdsOrg._getJSON(
      { url: LdsOrg.getCurrentMetaUrl()
      , store: me._store
      , cacheId: 'current-units'
      , ldsOrg: me
      }
    ).then(function (units) {
      me._currentUnits = units;
      me._emit('currentUnits', units);
      fn(units);

      return units;
    });
  };
  ldsOrgP.getCurrentStakes = function (fn) {
    var me = this
      ;

    return LdsOrg._getJSON(
      { url: LdsOrg.getCurrentStakeUrl()
      , store: me._store
      , cacheId: 'current-stakes'
      , ldsOrg: me
      }
    ).then(function (stakeList) {
      me._currentStakes = stakeList;
      me._emit('currentStakes', stakeList);
      fn(stakeList);

      return stakeList;
    });
  };



  //
  // Session Composite
  //
  ldsOrgP.getCurrentUserMeta = function () {
    console.log('getCurrentUserMeta');
    var me = this
      ;

    return new PromiseA(function (resolve) {
        //, areaInfoId = 'area-info'
        //, stakesInfoId = 'stakes-info'
      var join = Join.create()
        , userJ = join.add()
        , metaJ = join.add()
        , stakeJ = join.add()
        ;

      me.getCurrentUserInfo(function (userInfo) {
        me.currentUserId = userInfo.individualId;
        me.currentUserInfo = userInfo;

        console.log('[a.1] getCurrentUserMeta');
        userJ(null, userInfo.individualId, userInfo);
      });
      me.getCurrentUnits(function (units) {
        me._areaMeta = units;
        me.homeAreaId = units.areaUnitNo;
        me.homeStakeId = units.stakeUnitNo;
        me.homeWardId = units.wardUnitNo;
        me.homeArea.areaUnitNo = units.areaUnitNo;

        console.log('[a.2] getCurrentUserMeta');
        metaJ(null, units);
      });
      me.getCurrentStakes(function (stakes) {
        me.homeArea.stakes = stakes;
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

        console.log('[a.3] getCurrentUserMeta');
        stakeJ(null, stakes);
      });

      console.log('[b.1] getCurrentUserMeta');
      join.then(function (userArgs, unitArgs, stakeArgs) {
        console.log('[b.2] getCurrentUserMeta');
        var meta
          ;

        meta = {
          currentUserId: userArgs[1]
        , currentUserInfo: userArgs[2]
        , currentUnits: unitArgs[1]
        , currentStakes: stakeArgs[1]
          // oh which key to use... dummy, fake, mock, anonymous, guest, test, demo?
          // or... real, authentic, verified, validated
          // accountType, role (no), entityType
          // hmmmm... guest sounds very polite
          // but requiring true to be present is a better practice than requiring false to be absent
          // but real sounds stupid and one day there may also be a 'verified'... and guest sounds nice
          // but best practices... well, 'guest' is intuitively obvious, 'real' is not
        , guest: true === me._hogwarts
        };

        me.homeStake = me.stakes[me.homeStakeId];
        me.homeStake.wards.forEach(function (ward) {
          me.homeStakeWards[ward.wardUnitNo] = ward;
        });

        me.homeWard = me.wards[me.homeWardId];

        me.getCurrentHousehold(function (household) {
          meta.currentHousehold = household;

          // Just a lookin' for ways to speed things up...
          // here's the tough part: you can't get email addresses without getting the household,
          // and since the pictures expire quickly and they can also only be gotton from household data
          // it seems that there's no quick way to get all ward data so we might as well get pics
          // or also skip emails...
          if (me._prefetch) {
            // for a stake of 12 wards it took 1m 5s
            // an area of 18 stakes would get done in about 20 min
            me.prefetchArea({ fullHouseholds: false }).then(function () {
              // add in the email addresses and pictures and you're up another hour or so
              me.prefetchArea({ fullHouseholds: true }).then(function () {
                // nada
              });
            });
          }

          me._emit('meta', meta);
          resolve(meta);
        });
      });
    });
  };
  ldsOrgP.prefetchStake = function (stakeUnitNo, opts) {
    var me = this
      , bigData = { wards: [] }
      ;

    return me.getStake(stakeUnitNo).getAll(opts).then(function (stakeData) {
      bigData.stake = stakeData;
      return me.getStake(stakeUnitNo).getCurrentWard().getAll(opts).then(function (currentWardData) {
        var stake
          ;

        bigData.wards.push(currentWardData);
        stake = me.stakes[me.homeStakeId];
        return new PromiseA(function (resolve) {
          forEachAsync(stake.wards, function (next, ward) {
            if (me.homeWardId === ward.wardUnitNo) {
              next();
              return;
            }
            me.getCurrentStake().getWard(ward.wardUnitNo).getAll(opts).then(function (wardData) {
              bigData.wards.push(wardData);
              next();
            });
          }).then(function () {
            // FYI it would be stupid to try to transmit this to a browser in a single request
            return resolve(bigData);
          });
        });
      });
    });
  };
  ldsOrgP.prefetchArea = function (opts) {
    var me = this
      , areaData = { stakes: [] }
      ;

    return me.prefetchStake(me.homeStakeId, opts).then(function (stake) {
      areaData.stakes.push(stake);

      return new PromiseA(function (resolve) {
        forEachAsync(me.homeArea.stakes, function (next, stake) {
          if (me.homeStakeId === stake.stakeUnitNo) {
            next();
            return;
          }

          return me.prefetchStake(stake.stakeUnitNo, opts).then(function (stakeData) {
            areaData.stakes.push(stakeData);
            next();
          });
        }).then(function () {
          // FYI it would be beyond stupid to try to transmit this to a browser as a single request
          return resolve(areaData);
        });
      });
    });
  };
  ldsOrgP.getCurrentHousehold = function (fn, opts) {
    opts = opts || {};
    var me = this
      ;

    me.getCurrentStake().getCurrentWard().getHouseholdWithPhotos(fn, me.currentUserId, opts);
  };
  ldsOrgP.getUserMeta = ldsOrgP.getCurrentUserMeta;
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
