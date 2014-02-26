/*jshint -W054 */
;(function (exports) {
  'use strict';

  function forEachAsync(arr, fn, thisArg) {
    var dones = []
      , index = -1
      ;

    function next(BREAK, result) {
      index += 1;

      if (index === arr.length || BREAK === forEachAsync.__BREAK) {
        dones.forEach(function (done) {
          done.call(thisArg, result);
        });
        return;
      }

      fn.call(thisArg, next, arr[index], index, arr);
    }

    setTimeout(next, 4);

    return {
      then: function (_done) {
        dones.push(_done);
        return this;
      }
    };
  }
  forEachAsync.__BREAK = {};

  exports.forEachAsync = forEachAsync;
}('undefined' !== typeof exports && exports || new Function('return this')()));
/*jshint -W054 */
;(function (exports) {
  'use strict';

  function Join(context) {
    var me = this
      ;

    if (!(me instanceof Join)) {
      return new Join(context);
    }

    me._context = context || null;
    me._waiting = [];
    me._done = 0;
    me._callbacks = [];
    me._notifiables = [];
    me._begun = false;
    me.length = 0;
  }
  Join.create = Join;
  Join.prototype._partial = function (i, args) {
    var me = this
      ;

    me._done += 1;
    me._waiting[i] = args;

    me._notifiables.forEach(function (n) {
      n.fn.call(n.ctx || me._context, i, args);
    });
    me._complete();
  };
  Join.prototype._complete = function () {
    var me = this
      ;

    if (me._done !== me._waiting.length || !me._callbacks.length) {
      return;
    }

    me._callbacks.forEach(function (cb) {
      cb.fn.apply(cb.ctx || me._context, me._waiting);
    });
  };

  Join.prototype.add = function () {
    var me = this
      , index = me._waiting.length
      ;

    if (me._begun) {
      throw new Error('You tried to `add()` after calling `then()`');
    }
    me._waiting[me._waiting.length] = null;
    me.length = me._waiting.length;
    return function () {
      me._partial(index, Array.prototype.slice.call(arguments));
    };
  };
  Join.prototype.notify = function (cb, context) {
    var me = this
      ;

    me._notifiables.push({
      fn: cb
    , ctx: context
    });

    return this;
  };
  Join.prototype.then = function (cb, context) {
    var me = this
      ;

    me._begun = true;
    me._callbacks.push({
      fn: cb
    , ctx: context
    });

    me._complete();
    return this;
  };
  Join.prototype.when = function (promises, ctx) {
    var me = this
      , index = me._waiting.length
      ;

    if ('function' === typeof promises) {
      console.warn('`when` is deprecated. Please use `then` instead.');
      //throw new Error('`when` is deprecated. Please use `then` instead.');
      me.then(promises, ctx);
    } else if (!Array.isArray(promises)) {
      throw new Error('expected an array of objects with a `then` method');
    }

    me._waiting[length] = null;

    promises.forEach(function (p) {
      p.then(function () {
        me._partial(index, Array.prototype.slice(arguments));
      });
    });

    return this;
  };

  exports.Join = Join;
}('undefined' !== typeof exports && exports || new Function('return this')()));
/*jshint -W054 */
;(function (exports) {
  'use strict';

  var forEachAsync = exports.forEachAsync || require('forEachAsync').forEachAsync
    ;

  function Thread(lat, len) {
    var me = this
      ;

    if (!(this instanceof Thread)) {
      return new Thread(lat, len);
    }

    Thread._index += 1;
    me._id = Thread._index;
    me._length = len;
    me._done = 0;
    me._callbacks = [];
    me._lateral = lat;

    lat._threads.push(me);

    function realNext() {
      me._done += 1;

      if (me._done === me._length) {
        me.complete();
      }

      lat._onThingDone();
    }

    me._nexts = [];

    me.eachBound = function (next, item, i, arr) {
      // at the moment this next function is called,
      // this each function should immediately be called again
      me._nexts.push(next);
      lat._tasks.push({ next: realNext, item: item, i: i, arr: arr });
      lat._startOne();
    };
  }
  Thread.create = Thread;
  Thread._index = 0;

  Thread.prototype.complete = function () {
    var me = this
      , lat = me._lateral
      , threadIndex
      ;

    me._callbacks.forEach(function (cb) {
      cb(/*me._done, me._length*/);
    });

    lat._threads.some(function (t, i) {
      if (t === me) {
        threadIndex = i;
        return true;
      }
    });

    // remove this thread
    lat._threads.splice(threadIndex, 1);
    if (lat._curThread >= threadIndex) {
      lat._curThread -= 1;
    }
  };

  function Lateral(fn, _nThreads) {
    if (!(this instanceof Lateral)) {
      return new Lateral(fn, _nThreads);
    }
    var me = this
      ;

    me._fn = fn;
    me._threads = [];
    me._callbacks = [];
    me._completedAll = true;
    me._running = 0;
    me._tasks = [];
    me._curThread = 0;
    me._nThreads = _nThreads || 4;

    me._startOne = function () {
      var task
        ;

      while (me._running < me._nThreads && me._tasks.length) {
        // let lateral know that a turn has completed
        task = me._tasks.shift();
        me._running += 1;
        me._fn(task.next, task.item, task.i, task.arr);
        me._onNext();
      }
    };

    me._onThingDone = function () {
      me._running -= 1;
      me._onNext();
      me._startOne();
    };

    me._Thread = Thread;
  }
  Lateral.create = Lateral;

  Lateral.prototype._onNext = function () {
    var me = this
      , thread
      ;

    if (!me._threads.length) {
      if (0 === me._running && !me._completedAll) {
        me._completedAll = true;
        me._callbacks.forEach(function (cb) {
          cb();
        });
      }
      return;
    }

    if (me._running < me._nThreads) {
      me._curThread = (me._curThread + 1) % me._threads.length;

      thread = me._threads[me._curThread];
      if (thread._nexts.length) {
        me._threads[me._curThread]._nexts.shift()();
      } else {
        // TODO should we unskip the thread that wasn't ready?
        // after all, I'm not even sure why the onNext / startOne block happens
        //me._curThread = Math.max(0, (me._curThread + (me._threads.length - 1))) % me._threads.length;
      }
    }
  };
  Lateral.prototype.then = function (cb) {
    var me = this
      ;

    me._callbacks.push(cb);
    return me;
  };
  Lateral.prototype.add = function (arr) {
    var me = this
      , t
      ;

    if (0 === arr.length) {
      return {
        then: function (fn) {
          fn();

          return this;
        }
      };
    }

    me._completedAll = false;
    t = Thread.create(me, arr.length);

    forEachAsync(arr, t.eachBound);

    return {
      then: function (fn) {
        t._callbacks.push(fn);

        return this;
      }
    };
  };

  exports.Lateral = Lateral;
}('undefined' !== typeof exports && exports || new Function('return this')()));
/*jshint -W054 */
;(function (exports) {
  'use strict';

  var LdsOrgStake = { init: function (LdsOrg, LdsWard) {
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
/*jshint -W054 */
;(function (exports) {
  'use strict';

  exports.LdsOrgWard = { init: function (LdsOrg) {

    function LdsWard(opts, ldsOrg, ldsStake) {
      var me = this
        , cacheOpts = {}
        ;

      if (!(me instanceof LdsWard)) {
        return new LdsWard(opts, ldsOrg, ldsStake);
      }

      me._ldsOrg = ldsOrg;
      me._ldsStake = ldsStake;
      me._wardUnitNo = opts.wardUnitNo;
      me._wardOpts = opts;
      me._meta = ldsOrg.wards[opts.wardUnitNo];
      me._emit = ldsOrg._emit;

      Object.keys(ldsOrg._cacheOpts).forEach(function (key) {
        cacheOpts[key] = ldsOrg._cacheOpts[key];
      });
      cacheOpts.ldsOrg = ldsOrg;
      cacheOpts.ldsStake = ldsStake;
      cacheOpts.ldsWard = me;

      me._store = me._ldsOrg._Cache.create(cacheOpts, cacheOpts);
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
          me._emit('wardMemberList', list);
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
          me._emit('wardPhotoDirectory', list);
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
    ldsWardP.getRoster = function (fn, opts) {
      var me = this
        , id = me._wardUnitNo
        , roster = []
        , photoMap = {}
        , memberMap = {}
        , join = Join.create()
        , listJ = join.add()
        , photoJ = join.add()
        ;

      me._emit('wardRosterInit');

      me.getMemberList(function (list) {
        listJ(null, list);
      }, id);

      me.getPhotoList(function (photos) {
        photoJ(null, photos);
      }, id);

      join.then(function (memberListArgs, photoListArgs) {
        var memberList = memberListArgs[1]
          , photoList = photoListArgs[1]
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

        me.getHouseholds(fn, roster, opts);
      });
    };
    ldsWardP.getAll = function (fn, opts) {
      opts = opts || {};

      var me = this
        , id = me._wardUnitNo
        , join = Join.create()
        , listJ = join.add()
        , photoJ = join.add()
        , orgsJ = join.add()
        , callsJ = join.add()
        ;

      me._emit('wardInit', id);

      function onResult(ward) {
        me._emit('ward', id, ward);
        me._emit('wardEnd', id);
        fn(ward);
      }

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
          me.getRoster(sendStuff, opts);
        }
      });
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
/*jshint -W054 */
;(function (exports) {
  'use strict';

  var LdsOrgBrowser = { init: function (LdsDir, ldsDirP) {

    var $ = exports.jQuery || require('jquery')(window)
      ;

    ldsDirP._signin = function (cb, auth) {
      // TODO POST form to iframe
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

        $.ajax(
          {
            //url: me._ludrsUserId
            url: 'https://www.lds.org/directory/'
          , success: function () {
              $('.js-login').hide();
              $events.off('click', '.js-signin-link', openAuthWin);
              closeSigninWin();
              console.log('finally authenticated');
              cb(null);
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
          }
        );
      }

      getLoginStatus();
    };
    ldsDirP._signout = function (cb) {
      $.get('https://www.lds.org/signinout/?lang=eng&signmeout').then(cb);
    };

    ldsDirP._makeRequest = function (cb, url) {
      $.ajax({
        url: url
      , dataType: "json"
      //, data: null
      //, success: success
      })
        .done(function (data) { cb(null, data); })
        .fail(function (jqXHR, textStatus, errorThrown) { cb(errorThrown, null); })
        ;
    };

    ldsDirP._getImageData = function (next, imgSrc) {
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
    };
  }};

  exports.LdsOrgBrowser = LdsOrgBrowser.LdsOrgBrowser = LdsOrgBrowser;
}('undefined' !== typeof exports && exports || new Function('return this')()));
/*jshint -W054 */
;(function (exports) {
  'use strict';

  var forEachAsync = exports.forEachAsync || require('foreachasync').forEachAsync
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

  // TODO move lateral here
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
        return;
      }

      // poor-man's promises
      if (opts.ldsOrg._promises[opts.cacheId]) {
        opts.ldsOrg._promises[opts.cacheId].push(cb);
        return;
      } else {
        opts.ldsOrg._promises[opts.cacheId] = [cb];
      }

      opts.ldsOrg.makeRequest(function (err, _data) {
        if (_data) {
          var obj = { _id: opts.cacheId, updatedAt: Date.now(), value: _data };
          obj._rev = (_data || {})._rev;
          if (!opts.noCache) {
            opts.store.put(function () {}, opts.cacheId, obj);
          }
        }

        opts.ldsOrg._promises[opts.cacheId].forEach(function (cb) {
          cb(err, _data);
        });
        delete opts.ldsOrg._promises[opts.cacheId];
      }, opts.url);
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
        return;
      }

      // poor-man's promises
      if (opts.ldsOrg._promises[opts.cacheId]) {
        opts.ldsOrg._promises[opts.cacheId].push(cb);
        return;
      } else {
        opts.ldsOrg._promises[opts.cacheId] = [cb];
      }

      opts.ldsOrg.getImageData(function (err, _data) {
        if (_data) {
          var obj = { _id: opts.cacheId, updatedAt: Date.now(), value: _data };
          obj._rev = (_data || {})._rev;
          if (!opts.noCache) {
            opts.store.put(function () {}, opts.cacheId, obj);
          }
        }

        opts.ldsOrg._promises[opts.cacheId].forEach(function (cb) {
          cb(err, _data);
        });
        delete opts.ldsOrg._promises[opts.cacheId];
      }, opts.url);
    }

    // TODO cache here by url
    // TODO assume base
    opts.store.get(respondWithCache, opts.cacheId);
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
      , cacheOpts = {}
      ;

    Object.keys(me._cacheOpts).forEach(function (key) {
      cacheOpts[key] = me._cacheOpts[key];
    });
    cacheOpts.ldsOrg = me;

    me._emit = eventer || function () {};

    me._emit('cacheInit');


    me._store = me._Cache.create(cacheOpts, cacheOpts);
    me._store.init(function () {
      me._emit('cacheReady');
      me.getCurrentUserMeta(cb);
    });
  };

  ldsOrgP.signin = function (cb, auth) {
    var me = this
      , guestRe
      ;

    guestRe = /^(gandalf|dumbledore|test|guest|demo|aoeu|asdf|root|admin|secret|pass|password|12345678|anonymous)$/i;
    if (!auth || !auth.username) {
      cb(new Error("You didn't specify a username."));
      return;
    }
    if (guestRe.test(auth.username) && guestRe.test(auth.password)) {
      window.alert("You are using a demo account. Welcome to Hogwarts!");
      console.info('Welcome to Hogwarts! ;-)');
      this._hogwarts = true;
      cb(null);
      return;
    }

    me._signin(function (err, data) {
      if (!err) {
        me._authenticated = Date.now();
      }

      me._auth = auth;
      cb(err, data);
    }, auth);
  };
  ldsOrgP.signout = function (cb) {
    var me = this
      ;

    ldsOrgP._signout(function (err) {
      if (!err) {
        me._authenticated = 0;
      }
      cb(err);
    });
  };
  ldsOrgP.makeRequest = function (cb, url) {
    var me = this
      , count = 0
      ;

    function doItNow() {
      me._makeRequest(function (err, data) {
        if (err && count < 2) {
          console.error('Request Failed:', url);
          console.error(err);
          count += 1;
          me._signin(doItNow);
          return;
        }
        cb(err, data);
      }, url);
    }

    if (this._hogwarts) {
      me._makeRequest = (exports.Hogwarts || require('./hogwarts').Hogwarts).makeRequest;
    }

    // I think the lds.org timeout is about 15 to 30 minutes of inactivity, not entirely sure
    // It would take about 1.5 hrs to download a complete area
    // at 25s per ward with 11 wards per stake and 18 stakes
    if (!me._authenticated || (Date.now() - me._authenticated > 30 * 60 * 1000)) {
      me._signin(doItNow);
    } else {
      doItNow();
    }
  };
  ldsOrgP.getImageData = function (next, imgSrc) {
    var me = this
      ;

    if (this._hogwarts) {
      // http://carlo.zottmann.org/2013/04/14/google-image-resizer/
      imgSrc = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy'
        + '?url=' + encodeURIComponent(imgSrc)
        + '&container=focus'
        + '&resize_w=100'
        + '&resize_h=100'
        + '&refresh=259200'
        ;

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
  ldsOrgP.getCurrentUserMeta = function (fn) {
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
      me.homeStakeWards = {};
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
          me.prefetchArea(function () {
            // add in the email addresses and pictures and you're up another hour or so
            me.prefetchArea(function () {
              // nada
            }, { fullHouseholds: true });
          }, { fullHouseholds: false });
        }

        me._emit('meta', meta);
        fn(meta);
      });
    });
  };
  ldsOrgP.prefetchStake = function (cb, stakeUnitNo, opts) {
    var me = this
      , bigData = { wards: [] }
      ;

    me.getStake(stakeUnitNo).getAll(function (stakeData) {
      bigData.stake = stakeData;
      me.getStake(stakeUnitNo).getCurrentWard().getAll(function (currentWardData) {
        var stake
          ;

        bigData.wards.push(currentWardData);
        stake = me.stakes[me.homeStakeId];
        forEachAsync(stake.wards, function (next, ward) {
          if (me.homeWardId === ward.wardUnitNo) {
            next();
            return;
          }
          me.getCurrentStake().getWard(ward.wardUnitNo).getAll(function (wardData) {
            bigData.wards.push(wardData);
            next();
          }, opts);
        }).then(function () {
          // FYI it would be stupid to try to transmit this to a browser in a single request
          cb(bigData);
        });
      }, opts);
    }, opts);
  };
  ldsOrgP.prefetchArea = function (cb, opts) {
    var me = this
      , areaData = { stakes: [] }
      ;

    me.prefetchStake(function (stake) {
      areaData.stakes.push(stake);

      forEachAsync(me.homeArea.stakes, function (next, stake) {
        if (me.homeStakeId === stake.stakeUnitNo) {
          next();
          return;
        }

        me.prefetchStake(function (stakeData) {
          areaData.stakes.push(stakeData);
          next();
        }, stake.stakeUnitNo, opts);
      }).then(function () {
        // FYI it would be beyond stupid to try to transmit this to a browser as a single request
        cb(areaData);
      });
    }, me.homeStakeId, opts);
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
/*jshint -W054 */
;(function (exports) {
  'use strict';

  var cachep
    , caches = { stakes: {}, wards: {} }
    ;

  function LdsOrgCache(opts) {
    var me = this
      , store = {}
      ;

    me._opts = opts;

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
  cachep = LdsOrgCache.prototype;

  cachep.init = function (ready) {
    var me = this
      ;

    function getStakeCache(stake) {
      me._data = caches.stakes[stake._stakeUnitNo] || {};

      me._data = {};
      me._save();

      ready();
    }

    function getWardCache(ward) {
      me._data = caches.wards[ward._wardUnitNo] || {};
      me._save();

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
    // do nothing
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

  exports.LdsOrgCache = LdsOrgCache.LdsOrgCache = LdsOrgCache;

  if ('undefined' !== typeof module) {
    module.exports = exports.LdsOrgCache;
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
