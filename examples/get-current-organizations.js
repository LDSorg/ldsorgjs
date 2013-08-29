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
  , { wardOrganizationsInit: function (ward, orgnames) { console.log('orgsInit', ward, orgnames); }
    , wardOrganizationInit: function (ward, orgname) { console.log('orgInit', orgname); }
    , wardOrganization: function (orgname, list) { console.log('org', orgname, list); }
    , wardOrganizations: function (ward, orgs) { console.log('orgs', ward, orgs); }
    }
  );
}());
