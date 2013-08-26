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
  
        var ldsOrg = require('ldsorg').create
          , events = {}
          ;

        function initCompleteCb() {
          ldsOrg.getCurrentWardProfiles(function (profiles) {
            // these profiles are from the memberList
            // call ldsOrg.getHousehold(cb, profile) for the real profile
          });
        }

        events.profile = function () {
          console.log('Downloaded a complete profile');
        };

        ldsOrg.init(initCompleteCb, events);

API
===

```javascript
var LdsOrg = require('ldsorg');
```

**Class Methods**

  - [`LdsOrg.create()`](#ldsorgcreate)

**Instance Methods**

  - [`#init(initCompleteCallback, events)`](#ldsorginitcb-events)
    - `initCompleteCallback`
    - `events`
  - [`#getStakeInfo(cb)`](#ldsorggetstakeinfocb)
  - [`#getWard(unitNo, cb)`](#ldsorggetwardunitno-cb)
    - `unitNo`
  - [`#getWards(unitNos, cb)`](#ldsorggetwardsunitnos-cb)
  - [`#getCurrentStakeProfiles(cb)`](#ldsorggetcurrentstakeprofilescb)
  - [`#getCurrentWardProfiles(cb)`](#ldsorggetcurrentwardprofilescb)
  - [`#getHousehold(profileOrId, cb)`](#ldsorggethouseholdprofileorid-cb)
    - `id`
    - `profile`
  - [`#getHouseholds(profilesOrIds, cb)`](#ldsorggethouseholdsprofilesorids-cb)
  - [`#clear()`](#ldsorgclear)

**Instance properties**

As the various methods above return successfully,
the in-memory cache of the various organization units is updated.

All the things

  - `#areas`
  - `#stakes`
  - `#wards`

Home Area

  - `#homeAreaId`
  - `#homeArea`
  - `#homeAreaStakes`

Home Stake

  - `#homeStakeId`
  - `#homeStake`
  - `#homeStakeWards`

Home Ward

  - `#homeWardId`
  - `#homeWard` 

LdsOrg.create()
---

Creates and returns a new `ldsorg` object.

LdsOrg#init(cb, events)
---

Initializes internal vars and grabs PouchDB via script tag.

    * initCompleteCallback - fires when the library is ready to use
    * events - useful for tracking download progress, see experimental below

LdsOrg#getCurrentStakeInfo(cb)
---

returns a combination of `/unit/current-user-ward-stake/` and `/unit/current-user-units/`

LdsOrg#getWard(unitNo, cb)
---

returns a combination of
[`/mem/member-list/:ward_unit_no`](https://github.com/LDSorg/lds.org-api-documentation/blob/master/README.md#ward)
and
[`/mem/wardDirectory/photos/:ward_unit_no`](https://github.com/LDSorg/lds.org-api-documentation/blob/master/README.md#photos) -
meaning that all of the fields from the elements of
the photo object are added to the household objects from the member list.

  * `unitNo` is the number of returned by `LdsOrg#getWards` as `wardUnitNo`

The following keys are included:

  * Member List Element: ["children", "coupleName", "headOfHouse", "headOfHouseIndividualId", "householdName", "isProfilePrivate", "spouse"]
    * headOfHouse: ["directoryName", "gender", "individualId", "latinName", "latinNameDifferent", "preferredName", "surname"]
    * spouse: ["directoryName", "gender", "individualId", "latinName", "latinNameDifferent", "preferredName", "surname"] 
  * Photos\*: ["householdId", "householdName", "phoneNumber", "photoUrl"]
  * \*Note: `householdName` from Photos is renamed as `householdPhotoName`

LdsOrg#getWards(unitNos, cb)
---

returns an array of the above

LdsOrg#getCurrentStakeProfiles(cb)
---

calls `getStakeInfo` and `getWards` to get the user's current stake directory

LdsOrg#getCurrentWardProfiles(cb)
---

calls `getStakeInfo` and `getWard` on the user's ward

LdsOrg#getHousehold(profileOrId, cb)
---

takes a member profile or a member id and return `/mem/householdProfile/`

    * `profile` is an element of the array returned by `LdsOrg#getCurrentWardProfiles()`
    * `id` represents the head of household such as `householdId`, `headOfHouseIndividualId`, or `headOfHouse.individualId` of `LdsOrg#getCurrentWardProfiles()`

The following keys are included:

  * Household Profile: ["canViewMapLink", "hasEditRights", "headOfHousehold", "householdInfo", "id", "inWard", "isEuMember", "otherHouseholdMembers", "spouse", "ward"]
    * headOfHouseHold: ["address", "addressLevel", "birthDateLevel", "email", "emailLevel", "imageId", "imageLevel", "individualId", "isAllPrivate", "mapLevel", "masterLevel", "name", "phone", "phoneLevel", "photoUrl"]
    * householdInfo: ["address", "addressLevel", "birthDateLevel", "email", "emailLevel", "imageId", "imageLevel", "individualId", "isAllPrivate", "mapLevel", "masterLevel", "name", "phone", "phoneLevel", "photoUrl"]
        * address: ["addr1", "addr2", "addr3", "addr4", "addr5", "city", "countryCode", "countryIsoAlphaCode", "district", "groupId", "latitude", "locallyVerifiedCode", "longitude", "postal", "state", "stateCode", "streetAddr1", "streetAddr2"]
    * ward: ["areaUnitNo", "branch", "district", "mission", "stake", "stakeName", "stakeUnitNo", "ward", "wardName", "wardUnitNo"]
  * (if profile is provided) Member List Element: ["children", "coupleName", "headOfHouse", "headOfHouseIndividualId", "householdName", "isProfilePrivate", "spouse"]
  * (if profile is provided) Photos\*: ["householdId", "householdName", "phoneNumber", "photoUrl"]
  * \*Note: `householdName` from Photos is renamed as `householdPhotoName`
  * \*Note: `imageData` is the dataUrl from the household or individual `photoUrl` (this may change to `familyImageData` and `individualImageData`).

LdsOrg#getHouseholds(profilesOrIds, cb)
---

takes an array of member profiles or ids

LdsOrg#clear()
---

clears the PouchDB cache

experimental stuff
===

  * signin(cb) - (class method) doesn't always work - attempts to have the user login through a popup...
    an `iframe` with `window.postMessage` might be a better choice
    `$('#iframe_').contents().find('body').append(script)`
  * init
    * events
      * profile - a single complete profile (memberList + household + photo) has been downloaded
      * memberList - another ward list has been downloaded (useful for keeping track of total / yet-to-download)

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
