(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , callings
    ;

  function getStuff() {
      ldsorg.getCurrentStakeCallings(function (_callings) {
        callings = _callings;
        console.log("All Callings", _callings);
      });
  }

  ldsorg.init(
    getStuff
  , { calling: function (calling, list) { console.log('position', calling, list); } }
  );
}());
