Unofficial LDS.org JavaScript Library
===

If you are logged into LDS.org, you can use this
JavaScript library via a
[bookmarklet](http://bookmarkleteer.com)
or through a faux browser such as PhantomJS or CasperJS.

For examples of the data returned by each method,
see [Unofficial LDS.org API Documentation](https://github.com/LDSorg/lds.org-api-documentation)

Install & Build
===

    git clone https://github.com/LDSorg/ldsorgjs.git
    pushd ldsorgjs
    npm install -g pakmanager
    ./build.sh

`ldsorg.pakmanaged.js` is the build file that contains ldsorg and its dependencies

Note: jQuery is used by LDS.org, so you don't have worry about any warnings about it being included as a dependency.

Usage
===

The easiest way to play with ldsorgjs is to

  1. Go to [bookmarkleteer.com](http://bookmarkleteer.com)
  2. Paste in the source of `ldsorg.pakmanaged.js` (i.e. `cat ldsorg.pakmanaged.js`)
  3. Click the *Create Bookmarklet* button
  4. Drag the bookmarklet to your bookmarks bar
  5. Login to [lds.org/directory](https://www.lds.org/directory)
  6. Click on the bookmarklet
  7. Open up a console and play
  
        var ldsorg = require('ldsorg');
        Object.keys(ldsorg);

API
===

  * getStakeInfo(cb) - returns a combination of `/unit/current-user-ward-stake/` and `/unit/current-user-units/`
  * getWard(unitNo, cb) - returns a combination of `/mem/member-list/:ward_unit_no` and `/mem/wardDirectory/photos/`
  * getWards(unitNos, cb) - returns an array of the above
  * getCurrentStakeProfiles(cb) - calls `getStakeInfo` and `getWards` to get the user's current stake directory
  * getCurrentWardProfiles(cb) - calls `getStakeInfo` and `getWard` on the user's ward
  * getHousehold(profileOrId, cb) - takes a member profile or a member id and return '/mem/householdProfile/'
  * getHouseholds(profilesOrIds, cb) - takes an array of member profiles or ids

experimental methods
---

  * signin(cb) - doesn't always work - attempts to have the user login through a popup...
    an `iframe` with `window.postMessage` might be a better choice
    `$('#iframe_').contents().find('body').append(script)`

todo
---

  * update current user profile
  * update current user photo
  * update current family profile
  * update current family photo
  * flatten and normalize an entire ward
  * flatten and normalize an entire stake
  * export to json
  * export to yaml via jsontoyaml.com

Other notes
---

I suspect that if you log in as an area authority you get more resource that would allow you to get the data
for an entire area, but that information is beyond my privileges.

Single's Wards export each individual as a household.

Family Wards have a 1980's concept of phone numbers since there's still
supposed to be a single family phone number and not phone numbers for individuals.

I've never logged into LDS.org as a non-head-of-household,
so I don't really know what it looks like.

Local Cache
---

Because LDS.org is unheavenly slow and all of the picture resources expire after about 10 minutes,
it's convenient (if not necessary) to cache the data.

[IndexedDB](https://developer.mozilla.org/en-US/docs/IndexedDB) has a storage limit of 50MiB,
which is more than sufficient and it is also available, even on crappy browsers using the
IndexedDB Polyfill, [IndexedDBShim](http://nparashuram.com/IndexedDBShim/).

[PouchDB](http://pouchdb.com/) was chosen as the storage engine because, well, it's easy to use.

  * Individual Profile Data
    * '/mem/householdProfile/'
    * `jointProfile.headOfHousehold.photoUrl || jointProfile.householdInfo.photoUrl || jointProfile.photoUrl`
    * stored as `'profile' + profileOrId.householdId || member.headOfHouseIndividualId`
