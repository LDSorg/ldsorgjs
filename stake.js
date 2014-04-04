/*jshint -W054 */
;(function (exports) {
  'use strict';

  var forAllAsync = exports.forAllAsync || require('forallasync').forAllAsync
    , LdsOrgStake = { init: function (LdsOrg, LdsWard) {
    function LdsStake(opts, ldsOrg) {
      var me = this
        , cacheOpts = {}
        ;

      if (!(me instanceof LdsStake)) {
        return new LdsStake(opts, ldsOrg);
      }

      me._ldsOrg = ldsOrg;
      me._stakeOpts = opts;
      me._stakeUnitNo = opts.stakeUnitNo;
      me._meta = ldsOrg.stakes[opts.stakeUnitNo];
      me._emit = ldsOrg._emit;

      Object.keys(ldsOrg._cacheOpts).forEach(function (key) {
        cacheOpts[key] = ldsOrg._cacheOpts[key];
      });
      cacheOpts.ldsOrg = ldsOrg;
      cacheOpts.ldsStake = me;

      me._store = me._ldsOrg._Cache.create(cacheOpts, cacheOpts);
    }
    LdsStake.create = LdsStake;

    var ldsStakeP = LdsStake.prototype
      , Lateral = exports.Lateral || require('lateral').Lateral
      , nThreads = 10
      ;

    LdsStake.prototype.init = function (cb) {
      var me = this
        ;

      me._store.init(cb);
    };

    // Methods
    ldsStakeP.getPositions = function (fn) {
      var me = this
        ;

      me._emit('stakePositionsInit', me._stakeUnitNo);
      LdsOrg._getJSON(
        function (err, data) {
          me._emit('stakePositions', me._stakeUnitNo, data);
          fn(data);
        }
      , { url: LdsOrg.getStakeLeadershipPositionsUrl(me._stakeUnitNo)
        , store: me._store
        , cacheId: 'positions'
        , ldsOrg: me._ldsOrg, ldsStake: me }
      );
    };
    ldsStakeP.getLeadership = function (fn, group) {
      var me = this
        ;

      me._emit('stakeLeadershipInit', me._stakeUnitNo, group.groupName, group);
      LdsOrg._getJSON(
        function (err, leadershipWrapped) {
          me._emit('stakeLeadership', me._stakeUnitNo, group.groupName, leadershipWrapped);
          fn(leadershipWrapped);
        }
      , { url: LdsOrg.getStakeLeadershipGroupUrl(me._stakeUnitNo, group.groupKey, group.instance)
        , store: me._store
        , cacheId: 'leadership-' + group.groupName
        , ldsOrg: me._ldsOrg, ldsStake: me }
      );
    };
    ldsStakeP.getImages = function (fn, ids, sizes) {
      sizes = sizes || ['medium']; // large, medium, thumbnail
      var me = this
        , url = LdsOrg.getIndividualPhotosUrl(ids)
        , photos = {}
        ;

      //me._emit('images', me._stakeUnitNo, ids);
      LdsOrg._getJSON(
        function (err, photoUrlMaps) {
          forAllAsync(photoUrlMaps, function (n, photoUrls) {
            photos[photoUrls.individualId] = {};
            forAllAsync(sizes, function (next, size) {
              var photoUrl = photoUrls[size + 'Uri']
                ;

              if (!photoUrl) {
                next();
                return;
              }

              LdsOrg._getImage(
                function (err, dataUrl) {
                  if (!err && dataUrl) {
                    photos[photoUrls.individualId][size] = dataUrl;
                  }
                  next();
                }
              , { cacheId: 'individual-' + photoUrls.individualId + '-' + size + '.jpg'
                // TODO file cache large binaries and return buffer
                , binary: size === 'large'
                , store: me._store
                , url: photoUrl
                , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, member: photoUrls.individualId }
              );

              LdsOrg._getImage();
            }).then(n);
          }).then(function () {
            fn(photos);
          });
        }
      , { url: url
        , store: me._store
         // no cache for image urls
        , ldsOrg: me._ldsOrg, ldsStake: me }
      );
    };


    //
    // Stake
    //

    // TODO optionally include fresh pics
    // (but always include phone from photos)
    // TODO most of this logic should be moved to getHouseholds
    ldsStakeP.getWard = function (wardUnitNo) {
      var me = this
        ;

      me._realWards = me._realWards || {};
      if (!me._realWards[wardUnitNo]) {
        me._realWards[wardUnitNo] = LdsWard.create({ wardUnitNo: wardUnitNo }, me._ldsOrg, me);
        me._realWards[wardUnitNo].init(function () {});
      }

      return me._realWards[wardUnitNo];
    };
    // wardsOrIds can be an array or map of wards or ids
    ldsStakeP.getWards = function (fn, wardsOrIds, opts) {
      var me = this
        , wards = []
        ;

      function getOneWard(next, wardOrId) {
        function addWard(ward) {
          wards.push(ward);
          next();
        }
        me.getWard(addWard, wardOrId, opts);
      }

      wardsOrIds = LdsOrg.toArray(wardsOrIds);
      Lateral.create(getOneWard, nThreads).add(wardsOrIds).then(function () {
        fn(wards);
      });
    };
    ldsStakeP.getCurrentWard = function () {
      var me = this
        ;

      return me.getWard(me._ldsOrg.homeWardId);
    };


    //
    // Stake
    //
    ldsStakeP.getAll = function (fn, opts) {
      // TODO get pictures using the individual photos feature
      // /photo/url/#{id_1},#{id_2},#{id_x}/individual
      var me = this
        ;

      me._emit('stakeCallingsInit');
      me.getPositions(function (_positions) {
        var positions = _positions.unitLeadership || _positions.stakeLeadership
          , groups = []
          ;

        function gotAllCallings() {
          me._emit('stakeCallings');
          fn({
            stake: me._meta
          , callings: groups
          });
        }

        Lateral.create(function (next, group) {
          me.getLeadership(function (list) {
            group.leaders = list.leaders;
            group.unitName = list.unitName;
            groups.push(group);
            next();
          }, group);
        }, nThreads).add(positions).then(gotAllCallings);
      }, opts);
    };

    return LdsStake;
  }};

  exports.LdsOrgStake = LdsOrgStake.LdsOrgStake = LdsOrgStake;
}('undefined' !== typeof exports && exports || new Function('return this')()));
