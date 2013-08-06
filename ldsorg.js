(function () {
  "use strict";

  var $ = require('jQuery')
    , Join = require('./join')
    , forEachAsync = require('./forEachAsync')
    , ldsDirP
    , $events
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

  ldsDirP.init = function (cb, fns) {
    $events = $('body');
    var me = this
      ;

    me.areas = null;
    me.homeArea = null;
    me.homeAreaId = null;

    me.stakes = null;
    me.homeStake = null;
    me.homeStakeId = null;

    me.wards = null;
    me.homeWard = null;
    me.homeWardId = null;

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

    $events.on('click', '.js-clear-db', function () {
      window.Pouch.destroy('wardmenu-ludrs');
    });
  };

  ldsDirP.getHousehold = function (fn, profileOrId) {
    var me = this
      , jointProfile = profileOrId.householdId && profileOrId || {}
      , id = profileOrId.householdId || profileOrId
      , profileId = 'profile-' + id
      ;

    function onResult(profile) {
      if (me._listeners.profile) {
        me._listeners.profile(profile);
      }

      fn(profile);
    }

    me.store.get(profileId, function (err, profile) {
      var photoUrl
        ;

      if (profile && profile.imageData) {
        onResult(profile);
        return;
      }

      $.getJSON(me._ludrsHousehold + id, function (_profile) {
        function orThat(key) {
          jointProfile[key] = jointProfile[key] || _profile[key];
        }

        orThat('canViewMapLink');
        orThat('hasEditRights');
        orThat('headOfHousehold');
        orThat('householdInfo');
        orThat('id');
        orThat('imageData');
        orThat('inWard');
        orThat('isEuMember');
        orThat('otherHouseholdMembers');
        orThat('spouse');
        orThat('ward');

        function saveProfile(err, dataUrl) {
          jointProfile._id = profileId;
          jointProfile._rev = jointProfile._rev;
          jointProfile.imageData = dataUrl;
          me.store.put(jointProfile);
          onResult();
        }

        photoUrl = jointProfile.headOfHousehold.photoUrl || jointProfile.householdInfo.photoUrl || jointProfile.photoUrl;
        if (photoUrl) {
          getImageData(saveProfile, photoUrl);
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

  ldsDirP.getWard = function (fn, wardUnitNo) {
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
      if (fullMemberList) {
        console.log('memberList', fullMemberList);
        onWardResult(fullMemberList.memberList);
        return;
      }

      $.getJSON(me._ludrsBase + '/mem/member-list/' + wardUnitNo, join.add());
      // https://www.lds.org/directory/services/ludrs/mem/wardDirectory/photos/228079
      $.getJSON(me._ludrsBase + '/mem/wardDirectory/photos/' + wardUnitNo, join.add());

      join.when(function (memberListArgs, photoListArgs) {
        var memberList = memberListArgs[0]
          , photoList = photoListArgs[0]
          ;

        photoList.forEach(function (photo) {
          memberList.forEach(function (member) {
            if (photo.householdId !== member.headOfHouseIndividualId) {
              return;
            }

            member.householdId = photo.householdId;
            member.householdPhotoName = photo.householdName;
            member.phoneNumber = photo.phoneNumber;
            member.photoUrl = member.photoUrl || photo.photoUrl;
          });
        });

        fullMemberList = { _id: memberListId, _rev: (fullMemberList||{})._rev, memberList: memberList };
        me.store.put(fullMemberList);
        onWardResult(fullMemberList.memberList);
      });
    });
  };

  ldsDirP.getWards = function (fn, wardUnitNos) {
    var me = this
      , profileIds = []
      ;

    function pushMemberIds(next, wardUnitNo) {
      me.getWard(function (members) {
        members.forEach(function (m) {
          profileIds.push(m.headOfHouseIndividualId);
        });
        next();
      }, wardUnitNo);
    }

    forEachAsync(wardUnitNos, pushMemberIds).then(function () {
      // me.getHouseholds(fn, profileIds);
      fn();
    });
  };

  ldsDirP.getStakeInfo = function (fn) {
    var me = this
      , areaInfoId = 'area-info'
      , stakesInfoId = 'stakes-info'
      ;

    function onResult(areaInfo, stakesInfo) {
      me.homeArea = areaInfo;
      me.homeAreaId = areaInfo.areaUnitNo;
      me.homeStakeId = areaInfo.stakeUnitNo;
      me.homeWardId = areaInfo.wardUnitNo;

      me.stakes = stakesInfo;
      me.homeStake = me.stakes[0];
      me.wards = me.homeStake.wards;
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

  ldsDirP.getCurrentStakeProfiles = function (fn) {
    var me = this
      ;

    function onStakeInfo() {
      var wards = me.wards
        , wardUnitNos = []
        ;

      if (!$('#js-counter').length) {
        $('body').prepend(
          '<div style="'
            + 'z-index: 100000; position:fixed;'
            + 'top:40%; width:200px; height:50px;'
            + 'right: 50%; background-color:black;'
          + '" id="js-counter">0</div>'
        );
      }

      // TODO use underscore.pluck
      wards.forEach(function (w) {
        wardUnitNos.push(w.wardUnitNo);
      });

      me.getWards(fn, me.homeStake.wards);
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
