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
              then: function (_fn) {
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
  
  // Part of FuturesJS. See https://github.com/FuturesJS/forEachAsync
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
    
      // URLs
      ldsDirP._ludrsBase = 'https://www.lds.org/directory/services/ludrs';
    
      ldsDirP._ludrsCurrentStake = ldsDirP._ludrsBase + '/unit/current-user-units/';
      ldsDirP._ludrsCurrentMeta = ldsDirP._ludrsBase + '/unit/current-user-ward-stake/';
      ldsDirP._ludrsCurrentUserId = ldsDirP._ludrsBase + '/mem/current-user-id/';
    
      ldsDirP._ludrsMemberList = ldsDirP._ludrsBase + '/mem/member-list/';
      ldsDirP._ludrsPhotos = ldsDirP._ludrsBase + '/mem/wardDirectory/photos/';
    
      ldsDirP._ludrsHousehold = ldsDirP._ludrsBase + '/mem/householdProfile/';
    
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
            me.getCurrentMeta(cb);
          });
        }, 'text');
      };
    
      ldsDirP.getHousehold = function (fn, profileOrId) {
        console.log('getHousehold', profileOrId);
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
          if (me._listeners.household) {
            me._listeners.household(profile);
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
      // TODO most of this logic should be moved to getHouseholds
      ldsDirP.getWard = function (fn, wardOrId, opts) {
        console.log('getWard', wardOrId, opts);
        opts = opts || {};
    
        var me = this
          , join = Join.create()
          , ward
          , id
          , memberListId
          ;
    
        if ('object' === typeof wardOrId) {
          ward = wardOrId;
          id = ward.wardUnitNo;
        } else {
          id = wardOrId;
          ward = me.wards[id] || { wardUnitNo: id };
        }
    
        memberListId = id + '-ward';
    
        function onWardResultFinal(ward, fireEvents) {
          if (false !== fireEvents) {
            onWardResult(ward);
          }
          fn(ward);
        }
        function onWardResult(ward) {
          // This event fires when memberList is updated
          if (me._listeners.ward) {
            me._listeners.ward(ward);
          }
          if (me._listeners.households) {
            me._listeners.households(ward.households);
          }
        }
    
        me.store.get(memberListId, function (err, _ward) {
          _ward = _ward || {};
    
          // The photo resource becomes invalid after 10 minutes
          var staleness = Date.now() - _ward.updatedAt
            , fresh = staleness < 10 * 60 * 1000
            ;
    
          if (false === opts.photos || fresh) {
            console.log('memberList', _ward);
            onWardResultFinal(_ward);
            return;
          }
    
          // https://www.lds.org/directory/services/ludrs/mem/member-list/:ward_unit_number
          $.getJSON(me._ludrsMemberList + id, join.add());
          // https://www.lds.org/directory/services/ludrs/mem/wardDirectory/photos/:ward_unit_number
          $.getJSON(me._ludrsPhotos + id, join.add());
    
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
    
            // TODO ward.households = memberList;
            ward.households = memberList;
            ward.updatedAt = Date.now();
            ward._rev = (_ward||{})._rev;
            ward._id = ward.wardUnitNo;
    
            // store before getting all the thingcs
            // TODO full restore with all the things
            me.store.put(ward);
    
            function getAllHouseholds() {
              var households = []
                ;
    
              function getOneHousehold(next, household) {
                households.push(household);
                me.getHousehold(next, household);
              }
    
              function gotAllHouseholds() {
                // this is a merger, so no info is lost
                ward.households = households;
                onWardResultFinal(ward, false);
              }
    
              forEachAsync(ward.households, getOneHousehold).then(gotAllHouseholds);
            }
    
            // a fullHousehold is the only way to get the individual photo
            // go figure
            if (opts.fullHouseholds) {
              onWardResult(ward);
              getAllHouseholds();
            } else {
              onWardResultFinal(ward);
            }
          });
        });
      };
    
      ldsDirP.getCurrentStake = function (fn, opts) {
        var me = this
          ;
    
        me.getStake(fn, me.homeStakeId, opts);
      };
    
      ldsDirP.getStake = function (fn, stakeOrId, opts) {
        console.log('getStake', stakeOrId);
        var me = this
          , stake
          , id
          ;
    
        // TODO find resource
        if ('object' === typeof stakeOrId) {
          stake = stakeOrId;
          id = stake.stakeUnitNo;
        } else {
          id = stakeOrId;
          stake = me.stakes[id] || { stakeUnitNo: id };
        }
    
        function gotAllWards(wards) {
          stake.wards = wards;
    
          if (me._listeners.stake) {
            me._listeners.stake(stake);
          }
    
          fn(stake);
        }
        me.getWards(gotAllWards, stake.wards, opts);
      };
    
      // wardsOrIds can be an array or map of wards or ids
      ldsDirP.getWards = function (fn, wardsOrIds, opts) {
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
    
        if (!Array.isArray(wardsOrIds) && 'object' === typeof wardsOrIds) {
          wardsOrIds = Object.keys(wardsOrIds).map(function (key) {
            return wardsOrIds[key];
          });
        }
        forEachAsync(wardsOrIds, getOneWard).then(function () {
          fn(wards);
        });
      };
    
      // Current Stake
      ldsDirP.getCurrentMeta = function (fn) {
        var me = this
          , areaInfoId = 'area-info'
          , stakesInfoId = 'stakes-info'
          ;
    
        function onMetaResult(currentInfo, stakesInfo) {
          console.log(currentInfo);
          console.log(stakesInfo);
    
          me.wards = {};
          me.stakes = {};
    
          me.homeArea = currentInfo;
    
          me.homeAreaId = currentInfo.areaUnitNo;
          me.homeStakeId = currentInfo.stakeUnitNo;
          me.homeWardId = currentInfo.wardUnitNo;
    
          me.homeArea.stakes = stakesInfo.stakes;
          me.homeAreaStakes = {};
          console.log('1');
          me.homeArea.stakes.forEach(function (stake) {
            me.homeAreaStakes[stake.stakeUnitNo] = stake;
            me.stakes[stake.stakeUnitNo] = stake;
          });
    
          me.homeStake = me.stakes[me.homeStakeId];
          me.homeStakeWards = {};
          console.log('2');
          me.homeStake.wards.forEach(function (ward) {
            me.homeStakeWards[ward.wardUnitNo] = ward;
          });
          console.log('3');
          Object.keys(me.stakes).forEach(function (stakeNo, i) {
            var stake = me.stakes[stakeNo]
              ;
            console.log('4', i, stake);
            stake.wards.forEach(function (ward) {
              me.wards[ward.wardUnitNo] = ward;
            });
          });
    
          me.homeWard = me.wards[me.homeWardId];
    
          fn(currentInfo);
        }
    
        function gotInfo(areaInfo, stakesInfo) {
          if (areaInfo && stakesInfo) {
            onMetaResult(areaInfo, stakesInfo);
            return;
          }
    
          $.getJSON(me._ludrsCurrentMeta, function (_areaInfo) {
    
            _areaInfo._id = areaInfoId;
            if (areaInfo) {
              _areaInfo._rev = areaInfo._rev;
            }
            areaInfo = _areaInfo;
            me.store.put(areaInfo);
    
            $.getJSON(me._ludrsCurrentStake, function (_stakes) {
              console.log('_stakes');
              console.log(_stakes);
    
              stakesInfo = {};
              stakesInfo._id = stakesInfoId;
              stakesInfo._rev = stakesInfo._rev;
              stakesInfo.stakes = _stakes;
              me.store.put(stakesInfo);
              onMetaResult(areaInfo, stakesInfo);
            });
          });
        }
    
        me.store.get(areaInfoId, function (err, _areaInfo) {
          me.store.get(stakesInfoId, function (err, _stakesInfo) {
            gotInfo(_areaInfo, _stakesInfo);
          });
        });
      };
    
      ldsDirP.getCurrentWard = function (fn) {
        var me = this
          ;
    
        me.getWard(fn, me.homeWardId);
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
    
  provide("ldsorg", module.exports);
}(global));