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
    npm install
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
  
        var ldsOrg = require('ldsorg').create()
          , events = {}
          ;

        function initCompleteCb() {
          ldsOrg.getCurrentWard(function (ward) {
            // these profiles are from the memberList
            console.log(ward.households);
            // call ldsOrg.getHousehold(cb, ward.households[i]) for the real profile
          });
        }

        events.household = function (household) {
          console.log('Downloaded a household', household);
        };

        ldsOrg.init(initCompleteCb, events);

API
===

```javascript
var LdsOrg = require('ldsorg');
```

There's a lot of stuff, so I've separated it out into a few main categories:

  - [Create, Init, Clear](#create-init-clear)
  - [Area & Stake](https://github.com/LDSorg/ldsorgjs/tree/wip#area--stake)
  - [Wards & Households](#wards--households)
  - [Members & Photos](#wards--households)
  - [Experimental Stuff](#experimental-stuff)
  - [Other Notes](#other-notes)

Note that the **convenience properties** are **updated** as the various methods are called.

Create, Init, Clear
---

Methods

  - [`LdsOrg.create()`](#ldsorgcreate)
  - [`#init(initCompleteCallback, events)`](#ldsorginitcb-events)
    - [`#getCurrentMeta(cb)`](#ldsorggetcurrentmetacb)
    - `initCompleteCallback`
    - `events`
  - [`#clear()`](#ldsorgclear)

Events

  - `cacheInit` fires on `init`
  - `cacheReady` fires when `PouchDB` is ready
  - `meta` fires when `init` finishes fetching the user metadata

Area & Stake
---

Methods

  - [`#getStake(cb, stake, opts)`](#ldsorggetstakecb-stake)
    - [`#getStakeCallings(cb, stake, opts)`](#ldsorggetstakecallingscb-stake)
      - [`#getStakePositions(cb, stake, opts)`](#ldsorggetstakepositionscb-stake)
      - [`#getStakeLeadership(cb, stake, group, opts)`](#ldsorggetstakeleadershipcb-stake-group)
  - [`#getWards(cb, wards, opts)`](#ldsorggetwardscb-wards-opts)

Events

  - `stakeInit` fires when `getStake` is called
    - `stakeCallingsInit` fires when `getStakeCallings` is called
      - `stakePositionsInit` fires just before stake positions are downloaded
        - `stakePositions` fires once stake positions are downloaded
      - `stakeLeadershipInit` fires before each leadership group is downloaded
        - `stakeLeadership` fires after each leadership group is downloaded
      - `stakeCallings` fires after all positions and leadership group are handled
    - `stake` fires after all stake data is handled
    - `stakeEnd` fires after all wards in the stake are handled

Convenience Methods

  - [`#getCurrentStake(cb, opts)`](#ldsorggetcurrentstakecb)
  - [`#getCurrentStakeCallings(cb, opts)`](#ldsorggetcurrentstakecallingscb)

Convenience Properties

  - `#areas`
  - `#stakes`
  - `#wards`
  - `#homeAreaId`
  - `#homeArea`
  - `#homeAreaStakes`
  - `#homeStakeId`
  - `#homeStake`
  - `#homeStakeWards`

Wards & Households
---

Methods

  - [`#getWard(cb, wardOrId, opts)`](#ldsorggetwardcd-ward-opts)
    - `ward`
    - `id`
  - [`#getWardCallings(cb, ward)`](#ldsorggetwardcallingscb-ward)
    - [`#getWardPositions(cb, ward)`](#ldsorggetwardpositionscb-ward)
    - [`#getWardLeadership(cb, ward)`](#ldsorggetwardleadershipcb-ward)
  - [`#getWardOrganization(cb, ward, organization)`](#ldsorggetwardorganizationcb-ward-organization)
  - [`#getWardOrganizations(cb, ward)`](#ldsorggetwardorganizationscb-ward)

Events

  - `wardInit`
    - `wardCallingsInit`
      - `wardPositionsInit`
        - `wardPositions`
      - `wardLeadershipInit`
        - `wardLeadership`
      - `wardCallings`
    - `wardOrganizationsInit`
      - `wardOrganizationInit`
        - `wardOrganization`
      - `wardOrganizations`
    - `householdsInit`
      - `households`
    - `wardEnd`

Convenience Methods

  - [`#getCurrentWard(cb, opts)`](#ldsorggetcurrentwardcb)
  - [`#getCurrentWardCallings(cb, opts)`](#ldsorggetcurrentwardcallingscb)
  - [`#getCurrentWardOrganizations(cb, opts)`](#ldsorggetcurrentwardorganizationscb)

Convenience Properties

  - `#homeWardId`
  - `#homeWard` 


Members & Photos
---

Methods

  - [`#getHousehold(cb, household)`](#ldsorggethouseholdcb-household)
    - `household`
    - `id`
  - [`#getHouseholds(cb, households)`](#ldsorggethouseholdscb-households)

Convenience Methods

  - [`#getCurrentHousehold(cb)`](#ldsorggetcurrenthouseholdcb)

Events

  - `householdInit`
    - `household`
      - `householdPhotoInit`
        - `householdPhoto`
      - `individualPhotoInit`
        - `individualPhoto`
    - `householdEnd`

Details
---

### LdsOrg.create()

Creates and returns a new `ldsorg` object.

### LdsOrg#init(cb, events)

Initializes internal vars and grabs PouchDB via script tag.
This calls `LdsOrg.getCurrentMeta()`

    * initCompleteCallback - fires when the library is ready to use
    * events - useful for tracking download progress, see experimental below

### LdsOrg#getCurrentMeta(cb)

returns a combination of `/unit/current-user-ward-stake/` and `/unit/current-user-units/`

### LdsOrg#getCurrentStake(cb, opts)

calls `getStake` and `getWards` to get the user's current stake directory

### LdsOrg#getCurrentWard(cb, opts)

calls `getCurrentMeta` and `getWard` on the user's ward

### LdsOrg#getWard(cb, ward)

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

### LdsOrg#getWards(cb, wards)

returns an array of the above

### LdsOrg#getWardOrganization(cb, ward, organization)

returns an organization (`HIGH_PRIEST`, etc)

### LdsOrg#getWardOrganizations(cb, ward)

returns all ward organizations (`ELDERS`, `MIA_MAIDS`, etc)

### LdsOrg#getCurrentWardOrganizations(cb)

returns all ward organizations (`ELDERS`, `MIA_MAIDS`, etc) for the current ward

### LdsOrg#getHousehold(cb, household)

takes a member profile or a member id and return `/mem/householdProfile/`

    * `profile` is an element of the array returned by `LdsOrg#getCurrentWard()`
    * `id` represents the head of household such as `householdId`, `headOfHouseIndividualId`, or `headOfHouse.individualId` of `LdsOrg#getCurrentWard()`

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

### LdsOrg#getHouseholds(cb, households)

takes an array of member profiles or ids

### LdsOrg#clear()

clears the PouchDB cache

experimental stuff
===

  * signin(cb) - (class method) doesn't always work - attempts to have the user login through a popup...
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
  * `window.open('data:application/json;charset=utf-8,' + encodeURIComponent(str));`

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
