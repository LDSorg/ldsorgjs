ldsorg.js
===

This is a thin layer over the LDS.org api.
All of the data is exactly the same with one exception: pictures are included in calls to individuals and households.

Installation
===

node.js
---

```bash
npm install ldsorg

```

browser
---

via bower

```bash
bower install ldsorg
```

```jade
script(src="bower_components/forEachAsync/forEachAsync.js")
script(src="bower_components/join/join.js")
script(src="bower_components/lateral/lateral.js")
script(src="bower_components/ldsorgjs/ward.js")
script(src="bower_components/ldsorgjs/stake.js")
script(src="bower_components/ldsorgjs/browser.js")
script(src="bower_components/ldsorgjs/ldsorg.js")
script(src="bower_components/ldsorgjs/cache-browser.js")
```

```html
<script src="bower_components/forEachAsync/forEachAsync.js"></script>
<script src="bower_components/join/join.js"></script>
<script src="bower_components/lateral/lateral.js"></script>
<script src="bower_components/ldsorgjs/ward.js"></script>
<script src="bower_components/ldsorgjs/stake.js"></script>
<script src="bower_components/ldsorgjs/browser.js"></script>
<script src="bower_components/ldsorgjs/ldsorg.js"></script>
<script src="bower_components/ldsorgjs/cache-browser.js"></script>
```

via download

```bash
wget http://ldsorg.github.io/ldsorgjs/ldsorg.all.js
```

```html
<script src="ldsorg.all.js"></script>
```

Usage
===

In about 25 seconds you can download all of the data (including pictures) for your entire ward.

```javascript
;(function (exports) {
  'use strict';

  var LdsOrg = exports.LdsOrg || require('ldsorg').LdsOrg
      // you should probably create your own cache strategy
    , Cache = exports.LdsOrgCache || require('ldsorg/cache').LdsOrgCache
    , ldsorg
    , ts = Date.now()
    , username
    , password
    , isNode
    ;

  if ('undefined' !== typeof process && process.argv) {
    username = process.argv[2];
    password = process.argv[3];
    isNode = true;
  }

  ldsorg = LdsOrg.create({ node: isNode, Cache: Cache });

  // In the browser you must be already signed in
  ldsorg.signin(
    function (err) {
      console.log('sign-in complete');
      if (err) {
        console.log('failed', err);
        return;
      }

      ldsorg.init(
        function () {
          console.log('User Meta Data Gathered', ((Date.now() - ts) / 1000).toFixed(2) + 's');

          ldsorg.getCurrentStake().getAll(function () {
            console.log(
              'All stake-level data (not including wards) is now cached'
            , ((Date.now() - ts) / 1000).toFixed(2) + 's'
            );
          });
          ldsorg.getCurrentStake().getCurrentWard().getAll(function () {
            console.log(
              'All ward-level data is now cache'
            , ((Date.now() - ts) / 1000).toFixed(2) + 's'
            );
          });
        }
      , function log(event/*, a, b, c, d*/) {
          console.log('[LOG]', event);
          // build a nice big switch statement
        }
      , { node: isNode }
      );
    }
    // in node you must supply the user / pass to sign in
  , { username: username, password: password }
  );

}('undefined' !== typeof exports && exports || new Function('return this')()));
```

You should provide your own caching strategy with the same api as the provided `cache.js` or `cache-browser.js`.

API
===

TODO list respective urls and link to examples on ldsorg-api-documentation repo

### LdsOrg

  * LdsOrg.create(opts) - returns an LdsOrg instance
  * #init(cb, emitFn) - cb when init is complete. emitFn(eventname, arg1, arg2, ...) for each event
  * #getCurrentUserId(fn)
  * #getCurrentUnits(fn)
  * #getCurrentStakes(fn)
  * #getUserMeta(fn)
  * #getStake(stakeUnitNo) - returns an LdsStake instance
  * #getCurrentStake() - returns an LdsStake instance

### LdsStake

  * LdsStake.create(opts, ldsOrg)
  * #getPositions(fn)
  * #getLeadership(fn, group)
  * #getWard(wardUnitNo) - returns an LdsWard instance
  * #getCurrentWard() - returns an LdsWard instance
  * #getWards(fn, wardsOrIds, opts)
  * #getAll(fn)

### LdsWard

  * LdsWard.create(opts, ldsOrg, ldsStake) - called internally
  * #init(cb)
  * #getMemberList(fn)
  * #getPhotoList(fn)
  * #getOrganization(fn, orgname)
  * #getPositions(fn)
  * #getLeadership(fn, group)
  * #getHouseholdWithPhotos(fn, profileOrId, opts)
  * #getOrganizations(fn, orgnames)
  * #getCallings(fn)
  * #getHouseholds(fn, households, opts)
  * #getAll(fn, opts)
  * #getHousehold(fn, profileOrId)
  * #getHouseholdPhoto(fn, id)
  * #getIndividualPhoto(fn, id)

Build it yourself
===

```bash
mkdir -p bower_components
git clone git@github.com:FuturesJS/forEachAsync.git bower_components/forEachAsync
git clone git@github.com:FuturesJS/join.git bower_components/join
git clone git@github.com:FuturesJS/lateral.git bower_components/lateral
git clone git@github.com:LDSorg/ldsorgjs.git bower_components/ldsorgjs

cat \
  "bower_components/forEachAsync/forEachAsync.js" \
  "bower_components/join/join.js" \
  "bower_components/lateral/lateral.js" \
  "bower_components/ldsorgjs/stake.js" \
  "bower_components/ldsorgjs/ward.js" \
  "bower_components/ldsorgjs/browser.js" \
  "bower_components/ldsorgjs/ldsorg.js" \
  "bower_components/ldsorgjs/cache-browser.js" \
  > ldsorg.all.js
```

TODO
===

Be able to serialize / deserialize top-level LdsOrg object so that it can be used between sessions for APIs.
