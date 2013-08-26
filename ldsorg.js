(function () {
  "use strict";

  var $ = require('jQuery')
    , Join = require('./join')
    , forEachAsync = require('./forEachAsync')
    , ldsDirP
    ;

  function getImageData(next, imgSrc) {
    if (!imgSrc) {
      next(new Error('no imgSrc'));
      return;
    }

    var img
      ;

    img = document.createElement('img');
    img.onload = function () {
      var c = document.createElement('canvas')
        , c2d = c.getContext('2d')
        ;

      c.height = this.height;
      c.width = this.width;
      c2d.drawImage(this, 0,0);

      next(null, c.toDataURL('image/jpeg'));
    };

    img.onerror = function(){
      next(new Error("Didn't load image"));
    };

    img.src = imgSrc;
  }

  function LdsDir() {
  }
  ldsDirP = LdsDir.prototype;

  ldsDirP._ludrsBase = 'https://www.lds.org/directory/services/ludrs';
  ldsDirP._ludrsStake = ldsDirP._ludrsBase + '/unit/current-user-ward-stake/';
  ldsDirP._ludrsWards = ldsDirP._ludrsBase + '/unit/current-user-units/';
  ldsDirP._ludrsHousehold = ldsDirP._ludrsBase + '/mem/householdProfile/';
  ldsDirP._ludrsUserId = ldsDirP._ludrsBase + '/mem/current-user-id/';
  ldsDirP._ludrsMemberList = ldsDirP._ludrsBase + '/mem/member-list/';
  ldsDirP._ludrsPhotos = ldsDirP._ludrsBase + '/mem/wardDirectory/photos/';

  ldsDirP.init = function (cb, fns) {
    var me = this
      ;

    me.areas = null;
    me.stakes = [];
    me.wards = [];

    me.homeAreaId = null;
    me.homeArea = null;
    me.homeAreaStakes = null;

    me.homeStakeId = null;
    me.homeStake = null;
    me.homeStakeWards = null;

    me.homeWardId = null;
    me.homeWard = null;

    me._listeners = fns || {};

    $.get('http://thewardmenu.com/pouchdb-nightly.js', function (jsText) {
      // some crazy illegal token hack
      $(['<sc', 'ript>'].join('') + jsText + '</' + 'script' + '>').appendTo('body');
      var Pouch = require('Pouch');
      new Pouch('wardmenu-ludrs', function (err, db) {
        me.store = db;
        cb();
      });
    }, 'text');
  };

  ldsDirP.getHousehold = function (fn, profileOrId) {
    var me = this
      , jointProfile
      , id
      , profileId
      ;

    if ('object' === typeof profileOrId) {
      jointProfile = profileOrId;
      id = jointProfile.householdId;
    } else {
      id = profileOrId;
      jointProfile = {
        householdId: id
      };
    }

    profileId = 'profile-' + id;

    function onResult(profile) {
      if (me._listeners.profile) {
        me._listeners.profile(profile);
      }

      fn(profile);
    }

    me.store.get(profileId, function (err, profile) {
      var familyPhotoUrl
        , individualPhotoUrl
        , familyPhotoId
        , individualPhotoId
        ;

      if (profile && profile.imageData) {
        onResult(profile);
        return;
      }

      $.getJSON(me._ludrsHousehold + id, function (_profile) {
        function orThat(key) {
          if (jointProfile[key]) {
            console.warn("'" + key + "' already exists, not overwriting");
          } else {
            jointProfile[key] = _profile[key];
          }
        }

        // Object.keys(household)
        [ "canViewMapLink"
        , "hasEditRights"
        , "headOfHousehold"
        , "householdInfo"
        , "id"
        , "inWard"
        , "isEuMember"
        , "otherHouseholdMembers"
        , "spouse"
        , "ward"
        ].forEach(function (key) {
          orThat(key);
        });

        // may have been added before
        orThat('imageData');

        function saveProfile(err, dataUrl) {
          jointProfile._id = profileId;
          jointProfile._rev = jointProfile._rev;
          jointProfile.imageData = dataUrl;
          me.store.put(jointProfile);
          onResult();
        }

        individualPhotoUrl = jointProfile.headOfHousehold.photoUrl;
        individualPhotoId = jointProfile.headOfHousehold.imageId;
        familyPhotoUrl = jointProfile.householdInfo.photoUrl;
        familyPhotoId = jointProfile.householdInfo.imageId;

        if (!familyPhotoUrl) {
          // this is the one from the ward photo list resource
          familyPhotoUrl = jointProfile.photoUrl;
        }

        // TODO save image to db separately using imageId
        if (familyPhotoUrl || individualPhotoUrl) {
          getImageData(saveProfile, familyPhotoUrl || individualPhotoUrl);
        } else {
          saveProfile('no photourl', null);
        }
      });
    });
  };

  ldsDirP.getHouseholds = function (fn, profilesOrIds) {
    var me = this
      , membersInfo = []
      ;

    function gotOneHousehold(next, memberId) {
      me.getHousehold(function (household) {
        membersInfo.push(household);
        next();
      }, memberId);
    }

    forEachAsync(profilesOrIds, gotOneHousehold).then(function () {
      fn(membersInfo);
    });
  };

  // TODO optionally include fresh pics
  // (but always include phone from photos)
  ldsDirP.getWard = function (fn, wardUnitNo, noPics) {
    var me = this
      , join = Join.create()
      , memberListId = 'member-list-' + wardUnitNo
      ;

    function onWardResult(memberList) {
      if (me._listeners.memberList) {
        me._listeners.memberList(memberList);
      }

      me.myWardies = memberList;
      fn(memberList);
    }

    me.store.get(memberListId, function (err, fullMemberList) {
      fullMemberList = fullMemberList || {};

      // The photo resource becomes invalid after 10 minutes
      var staleness = Date.now() - fullMemberList.updatedAt
        , fresh = staleness < 10 * 60 * 1000
        ;

      if (noPics || fresh) {
        console.log('memberList', fullMemberList);
        onWardResult(fullMemberList.memberList);
        return;
      }

      // https://www.lds.org/directory/services/ludrs/mem/member-list/:ward_unit_number
      $.getJSON(me._ludrsMemberList + wardUnitNo, join.add());
      // https://www.lds.org/directory/services/ludrs/mem/wardDirectory/photos/:ward_unit_number
      $.getJSON(me._ludrsPhotos + wardUnitNo, join.add());

      join.then(function (memberListArgs, photoListArgs) {
        var memberList = memberListArgs[0]
          , photoList = photoListArgs[0]
          ;

        photoList.forEach(function (photo) {
          memberList.forEach(function (member) {
            if (photo.householdId !== member.headOfHouseIndividualId) {
              return;
            }

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
          });
        });

        fullMemberList = {
          _id: memberListId
        , _rev: (fullMemberList||{})._rev
        , memberList: memberList
        , updatedAt: Date.now()
        };
        me.store.put(fullMemberList);
        onWardResult(fullMemberList.memberList);
      });
    });
  };

  ldsDirP.getWards = function (fn, wardUnitNos, noPics) {
    var me = this
      , profileIds = []
      ;

    function pushMemberIds(next, wardUnitNo) {
      me.getWard(function (members) {
        members.forEach(function (m) {
          profileIds.push(m.headOfHouseIndividualId);
        });
        next();
      }, wardUnitNo, noPics);
    }

    forEachAsync(wardUnitNos, pushMemberIds).then(function () {
      // me.getHouseholds(fn, profileIds);
      fn();
    });
  };

  // Current Stake
  ldsDirP.getCurrentStakeInfo = function (fn) {
    var me = this
      , areaInfoId = 'area-info'
      , stakesInfoId = 'stakes-info'
      ;

    function onResult(areaInfo, stakesInfo) {
      me.homeArea = areaInfo;

      me.homeAreaId = areaInfo.areaUnitNo;
      me.homeStakeId = areaInfo.stakeUnitNo;
      me.homeWardId = areaInfo.wardUnitNo;

      me.homeAreaStakes = stakesInfo;

      // TODO loop through and check homeStakeId
      me.homeStake = me.stakes[0];
      me.homeStakeWards = me.homeStake.wards;

      // TODO only add the stakes that haven't been added
      //me.stakes = me.stakes.concat(stakesInfo);
      // TODO only add the wards that haven't been added
      //me.wards = me.wards.concat(me.homeStake.wards);
      fn();
    }

    function gotInfo(areaInfo, stakesInfo) {
      if (areaInfo && stakesInfo) {
        onResult(areaInfo, stakesInfo);
        return;
      }

      $.getJSON(me._ludrsStake, function (_areaInfo) {

        _areaInfo._id = areaInfoId;
        if (areaInfo) {
          _areaInfo._rev = areaInfo._rev;
        }
        areaInfo = _areaInfo;
        me.store.put(areaInfo);

        $.getJSON(me._ludrsWards, function (_stakesInfo) {

          _stakesInfo._id = stakesInfoId;
          if (stakesInfo) {
            _stakesInfo._rev = stakesInfo._rev;
          }
          stakesInfo = _stakesInfo;
          me.store.put(stakesInfo);
          onResult(areaInfo, stakesInfo);
        });
      });
    }

    me.store.get(areaInfoId, function (err, _areaInfo) {
      me.store.get(stakesInfoId, function (err, _stakesInfo) {
        gotInfo(_areaInfo, _stakesInfo);
      });
    });
  };
  // TODO getStakeInfo should accept id
  ldsDirP.getStakeInfo = ldsDirP.getCurrentStakeInfo;

  ldsDirP.getCurrentStakeProfiles = function (fn) {
    var me = this
      ;

    function onStakeInfo() {
      var wards = me.homeStakeWards
        , wardUnitNos = []
        ;

      // TODO use underscore.pluck
      wards.forEach(function (w) {
        wardUnitNos.push(w.wardUnitNo);
      });

      if (me._listeners.stake) {
        me._listeners.stake(wards);
      }

      me.getWards(fn, me.homeStakeWards);
    }

    me.getStakeInfo(onStakeInfo);
  };

  ldsDirP.getCurrentWardProfiles = function (fn) {
    var me = this
      ;

    me.getStakeInfo(function () {
      me.getWard(fn, me.homeWardId);
    });
  };
  ldsDirP.clear = function () {
    var Pouch = require('Pouch');
    console.info('clearing PouchDB cache');
    Pouch.destroy('wardmenu-ludrs');
  };

  LdsDir.signin = ldsDirP.signin = function (cb) {
    // TODO use iframe
    var //me = this
        signinWin
      //, url = "https://signin.lds.org/SSOSignIn/"
      , url = 'https://www.lds.org/directory/'
      , name = "WardMenuLdsOrgSignin"
      , opts = 'height=600,width=500,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no'
      ;

    function closeSigninWin() {
      if (!signinWin) {
        return;
      }

      try {
        signinWin.close();
      } catch(e) {
        // do nothing
        console.warn('Tried to close a closed window (the signin window, to be precise).');
      }
    }

    function openAuthWin(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      closeSigninWin();
      signinWin = window.open(url, name, opts, false);
      setTimeout(getLoginStatus, 4000);
    }

    function getLoginStatus() {
      var $events = $('body')
        ;

      $.ajax({
          //url: me._ludrsUserId
          url: 'https://www.lds.org/directory/'
        , success: function () {
            $('.js-login').hide();
            $events.off('click', '.js-signin-link', openAuthWin);
            closeSigninWin();
            console.log('finally authenticated');
            cb(true);
          }
        , error: function () {
            console.log('waiting for authentication...');
            if (!signinWin) {
              $('.js-login').show();
              $events.on('click', '.js-signin-link', openAuthWin);
            } else {
              setTimeout(getLoginStatus, 1000);
            }
          }
      });
    }

    getLoginStatus();
  };

  LdsDir.create = function () {
    var ldsDir = Object.create(LdsDir.prototype)
      ;

    // TODO needs to be in an init function
    return ldsDir;
  };

  module.exports = LdsDir;
}());
