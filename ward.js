/*jshint -W054 */
;(function (exports) {
  'use strict';

  exports.LdsOrgWard = { init: function (LdsOrg) {

    function LdsWard(opts, ldsOrg, ldsStake) {
      var me = this
        ;

      if (!(this instanceof LdsWard)) {
        return new LdsWard(opts, ldsOrg, ldsStake);
      }

      me._ldsOrg = ldsOrg;
      me._ldsStake = ldsStake;
      me._wardUnitNo = opts.wardUnitNo;
      me._wardOpts = opts;
      me._meta = ldsOrg.wards[opts.wardUnitNo];
      me._emit = ldsOrg._emit;

      me._store = new me._ldsOrg._Cache({
        ldsOrg: ldsOrg
      , ldsStake: ldsStake
      , ldsWard: me
      });
    }
    LdsWard.create = LdsWard;


    var ldsWardP = LdsWard.prototype
      , Join =  exports.Join || require('join').Join
      , Lateral = exports.Lateral || require('lateral').Lateral
      , nThreads = 10
      ;

    ldsWardP.init = function (cb) {
      var me = this
        ;

      me._store.init(cb);
    };


    //
    // Ward Core
    //
    ldsWardP.getMemberList = function (fn) {
      var me = this
        ;

      me._emit('wardMemberListInit');
      LdsOrg._getJSON(
        function (err, list) {
          fn(list);
        }
      , { url: LdsOrg.getMemberListUrl(me._wardUnitNo)
        , store: me._store
        , cacheId: 'member-list'
        , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me }
      );
    };
    ldsWardP.getPhotoList = function (fn) {
      var me = this
        ;

      me._emit('wardPhotoDirectoryInit');
      LdsOrg._getJSON(
        function (err, list) {
          fn(list);
        }
      , { url: LdsOrg.getPhotosUrl(me._wardUnitNo)
        , store: me._store
        , cacheId: 'photo-list'
        , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me }
      );
    };
    ldsWardP.getOrganization = function (fn, orgname) {
      var me = this
        , orgnameL = orgname.toLowerCase()
        ;

      me._emit('wardOrganizationInit', me._wardUnitNo, orgname.toLowerCase());
      LdsOrg._getJSON(
        function (err, orgs) {
          me._emit('wardOrganization', me._wardUnitNo, orgnameL, orgs);
          fn(orgs);
        }
      , { url: LdsOrg.getWardOrganizationUrl(me._wardUnitNo, orgname)
        , store: me._store
        , cacheId: orgnameL
        , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me }
      );
    };
    ldsWardP.getPositions = function (fn) {
      var me = this
        ;

      me._emit('wardPositionsInit', me._wardUnitNo);
      LdsOrg._getJSON(
        function (err, positionsWrapped) {
          me._emit('wardPositions', me._wardUnitNo, positionsWrapped);
          fn(positionsWrapped);
        }
      , { url: LdsOrg.getWardLeadershipPositionsUrl(me._wardUnitNo)
        , store: me._store
        , cacheId: 'positions'
        , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me }
      );
    };
    ldsWardP.getLeadership = function (fn, group) {
      var me = this
        ;

      me._emit('wardLeadershipInit', me._wardUnitNo, group.groupName);
      LdsOrg._getJSON(
        function (err, leadershipWrapped) {
          me._emit('wardLeadership', me._wardUnitNo, group.groupName, leadershipWrapped);
          fn(leadershipWrapped);
        }
      , { url: LdsOrg.getWardLeadershipGroupUrl(me._wardUnitNo, group.groupKey, group.instance)
        , store: me._store
        , cacheId: 'leadership-' + group.groupName
        , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me }
      );
    };

    //
    // Ward Composite
    //
    ldsWardP.getHouseholdWithPhotos = function (fn, profileOrId, opts) {
      opts = opts || {};
      var join = Join.create()
        , me = this
        , id
        ;

      id = profileOrId.householdId || profileOrId.id || profileOrId;

      me.getHousehold(function (profile) {
        if (!opts.noFamilyPhoto) {
          me.getHouseholdPhoto(join.add(), id, opts);
        }
        if (!opts.noIndividualPhoto) {
          me.getIndividualPhoto(join.add(), id, opts);
        }
        join.then(function (famArgs, indArgs) {
          me._emit('householdEnd', profile);
          profile.headOfHousehold.imageData = famArgs[0];
          profile.householdInfo.imageData = indArgs[0];
          fn(profile);
        });
      }, id);
    };
    ldsWardP.getOrganizations = function (fn, orgnames) {
      var me = this
        , id = me._wardUnitNo
        , orgs = {}
        ;

      if (!Array.isArray(orgnames)) {
        orgnames = LdsOrg._organizations.slice(0);
      }

      me._emit('wardOrganizationsInit', id, orgnames);
      function gotAllOrgs() {
        me._emit('wardOrganizations', id, orgs);
        fn(orgs);
      }

      Lateral.create(function (next, orgname) {
        // UPPER_UNDERSCORE to camelCase
        var orgnameL = orgname
          .toLowerCase()
          .replace(/(_[a-z])/g, function($1){
            return $1.toUpperCase().replace('_','');
          });

        me.getOrganization(function (members) {
          members.organizationName = orgnameL;
          orgs[orgnameL] = members;
          next();
        }, orgname);
      }, nThreads).add(orgnames).then(gotAllOrgs);
    };
    ldsWardP.getCallings = function (fn) {
      var me = this
        ;

      me._emit('wardCallingsInit', me._wardUnitNo);
      me.getPositions(function (_positions) {
        var positions = _positions.unitLeadership || _positions.wardLeadership
          , groups = []
          ;

        function gotAllCallings() {
          me._emit('wardCallings', me._wardUnitNo, groups);
          fn(groups);
        }

        Lateral.create(function (next, group) {
          me.getLeadership(function (list) {
            group.leaders = list.leaders;
            group.unitName = list.unitName;
            groups.push(group);
            next();
          }, group);
        }, nThreads).add(positions).then(gotAllCallings);
      });
    };
    ldsWardP.getHouseholds = function (fn, _households, opts) {
      _households = LdsOrg.mapIds(_households, 'householdId');
      var me = this
        , households = []
        ;

      me._emit('householdsInit', _households);
      function gotOneHousehold(next, household) {
        me.getHouseholdWithPhotos(function (_household) {
          households.push(_household);
          next();
        }, household, opts);
      }

      Lateral.create(gotOneHousehold, nThreads).add(_households).then(function () {
        me._emit('households', _households);
        fn(households);
      });
    };
    ldsWardP.getAll = function (fn, opts) {
      opts = opts || {};

      var me = this
        , id = me._wardUnitNo
        ;

      me._emit('wardInit', id);
      function onResult(ward) {
        me._emit('ward', id, ward);
        me._emit('wardEnd', id);
        fn(ward);
      }

      function getRoster() {
        var join = Join.create()
          , listJ = join.add()
          , photoJ = join.add()
          , orgsJ = join.add()
          , callsJ = join.add()
          ;

        me._emit('wardRosterInit');

        me.getOrganizations(function (orgs) {
          orgsJ(null, orgs);
        });

        me.getCallings(function (callings) {
          callsJ(null, callings);
        });

        me.getMemberList(function (list) {
          listJ(null, list);
        }, id);

        me.getPhotoList(function (photos) {
          photoJ(null, photos);
        }, id);

        join.then(function (memberListArgs, photoListArgs, orgsArgs, callsArgs) {
          var memberList = memberListArgs[1]
            , photoList = photoListArgs[1]
            , organizations = orgsArgs[1]
            , callings = callsArgs[1]
            ;

          me._emit('wardMemberList', memberList);
          me._emit('wardPhotoDirectory', photoList);

          function mergeRoster() {
            var roster = []
              , photoMap = {}
              , memberMap = {}
              ;

            photoList.forEach(function (_photo) {
              photoMap[_photo.householdId] = _photo;
            });
            memberList.forEach(function (_member) {
              memberMap[_member.headOfHouseIndividualId] = _member;
            });
            photoList.forEach(function (_photo) {
              var member
                , photo
                ;

              photo = JSON.parse(JSON.stringify(_photo));

              if (!memberMap[_photo.householdId]) {
                roster.push(photo);
                return;
              }

              member = JSON.parse(JSON.stringify(memberMap[_photo.householdId]));

              // householdId
              // householdPhotoName
              // phoneNumber
              // photoUrl
              member.householdPhotoName = photo.householdName;
              delete photo.householdName;
              Object.keys(photo).forEach(function (key) {
                if (member[key]) {
                  console.warn("member profile now includes '" + key + "', not overwriting");
                } else {
                  member[key] = photo[key];
                }
              });

              roster.push(member);
            });

            me._emit('wardRoster', roster);

            return roster;
          }

          function sendStuff(households) {
            onResult({
              ward: me._meta
            , members: memberList
            , photos: photoList
            , organizations: organizations
            , callings: callings
            , households: households
            });
          }

          if (false === opts.fullHouseholds) {
            sendStuff();
          } else {
            me.getHouseholds(function (households) {
              sendStuff(households);
            }, mergeRoster(), opts);
          }
        });
      }

      getRoster();
    };

    // Composite
    // Methods (individuals)
    ldsWardP.getHousehold = function (fn, profileOrId) {
      // this is the only place to get email addresses for members without callings
      var me = this
        , id
        , profileId
        ;

      id = profileOrId.householdId || profileOrId.id || profileOrId;
      profileId = 'profile-' + id;

      me._emit('householdInit', id);

      LdsOrg._getJSON(
        function (err, profile) {
          me._emit('household', profile);
          me._emit('householdEnd', profile);
          fn(profile);
        }
      , { url: LdsOrg.getHouseholdUrl(id)
        , store: me._store
        , cacheId: 'household-' + id
        , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me, member: id }
      );
    };
    ldsWardP.getHouseholdPhoto = function (fn, id) {
      var me = this
        ;

      me.getHousehold(function (profile) {
        if (!profile.householdInfo.photoUrl) {
          fn();
          return;
        }

        LdsOrg._getImage(
          function (err, dataUrl) {
            fn(dataUrl);
          }
        , { cacheId: 'household-' + id + '.jpg'
          , store: me._store
          , url: profile.householdInfo.photoUrl
          , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me, member: id }
        );
      }, id);
    };
    ldsWardP.getIndividualPhoto = function (fn, id) {
      var me = this
        ;

      me.getHousehold(function (profile) {
        if (!profile.headOfHousehold.photoUrl) {
          fn();
          return;
        }

        LdsOrg._getImage(
          function (err, dataUrl) {
            fn(dataUrl);
          }
        , { cacheId: 'individual-' + id + '.jpg'
          , store: me._store
          , url: profile.headOfHousehold.photoUrl
          , ldsOrg: me._ldsOrg, ldsStake: me._ldsStake, ldsWard: me, member: id }
        );
      }, id);
    };

    return LdsWard; 
  }};
}('undefined' !== typeof exports && exports || new Function('return this')()));
