(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , orgs
    ;

  function getStuff() {
      ldsorg.getCurrentWardOrganizations(function (_orgs) {
        orgs = _orgs;
        console.log("All Organizations", _orgs);
      });
  }

  ldsorg.init(
    getStuff
  , { organization: function (orgname, data) { console.log('organization', orgname, data); } }
  );
}());
