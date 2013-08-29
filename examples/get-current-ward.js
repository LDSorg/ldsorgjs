var ward
  ;

(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    ;

  function getStuff() {
    ldsorg.getCurrentWard(function (_ward) {
      ward = _ward;
      console.log("All Done!");
    }, {});
  }

  ldsorg.init(getStuff, {
    // All Household Data
    householdInit: function (household) {
      console.log('      ' + household.householdName);
    }
  , household: function (household) {
      console.log('      ' + household.coupleName);
      //console.log(household);
    }
  , householdPhotoInit: function (household) {
      console.log('        fam pic via ' + household.headOfHousehold.photoUrl);
    }
  , householdPhoto: function (household, dataUrl) {
      console.log('        fam pic' + dataUrl.length, 'bytes as dataUrl');
    }
    // TODO spouse and children
  , individualPhotoInit: function (individual) {
      console.log('        photo op: ' + (individual.headOfHouse.preferredName));
    }
  , individualPhoto: function (individual, dataUrl) {
      console.log('        photo op: ' + dataUrl.length, 'bytes as dataUrl');
    }
  , householdEnd: function (household) {
      console.log('');
    }
  });
}());
