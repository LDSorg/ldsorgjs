(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , stake
    , count = 0
    ;

  function getStuff() {
      ldsorg.getCurrentStake(function (_stake) {
        stake = _stake;
        console.log("All Done!");
      }, { fullHouseholds: true });
  }

  ldsorg.init(getStuff, { household: function () { console.log(count += 1); } });
}());
