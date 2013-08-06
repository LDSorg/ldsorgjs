var global = Function("return this;")();
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// pakmanager:ldsorg/join
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  (function () {
      "use strict";
    
      // Poor Man's Join
      var Join = {
        create: function () {
          var things = []
            , len = Infinity
            , fn
            , complete = 0
            ;
    
          return {
              when: function (_fn) {
                fn = _fn;
                len = things.length;
                if (complete === len) {
                  fn.apply(null, things);
                }
              }
            , add: function () {
                var i = things.length
                  ;
    
                things[things.length] = null;
    
                return function () {
                  var args = [].slice.call(arguments)
                    ;
    
                  complete += 1;
                  things[i] = args;
                  if (fn && (complete === len)) {
                    fn.apply(null, things);
                  }
                };
              }
          };
        }
      };
    
      module.exports = Join;
    }());
    
  provide("ldsorg/join", module.exports);
}(global));

// pakmanager:ldsorg/forEachAsync
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  /*jshint -W054 */
    (function (exports) {
      "use strict";
    
      function forEachAsync(arr, fn, thisArg) {
        var done
          , index = -1
          ;
    
        function next(BREAK) {
          if (0 === arr.length || BREAK === forEachAsync.BREAK) {
            if ('undefined' !== typeof thisArg) {
              done.call(thisArg);
            } else {
              done(thisArg);
            }
            return;
          }
    
          index += 1;
          if ('undefined' !== typeof thisArg) {
            fn.call(thisArg, next, arr.shift(), index, arr);
          } else {
            fn(next, arr.shift(), index, arr);
          }
        }
    
        setTimeout(next, 4);
    
        return {
          then: function (_done) {
            done = _done;
          }
        };
      }
      forEachAsync.BREAK = {};
    
      exports = forEachAsync.forEachAsync = forEachAsync;
      if ('undefined' !== module) {
        module.exports = forEachAsync;
      }
    }('undefined' !== typeof exports && exports || new Function('return this')()));
    
  provide("ldsorg/forEachAsync", module.exports);
}(global));

// pakmanager:ldsorg
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  (function () {
      "use strict";
    
      var $ = require('jQuery')
        , Join =  require('ldsorg/join')
        , forEachAsync =  require('ldsorg/forEachAsync')
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
    
  provide("ldsorg", module.exports);
}(global));