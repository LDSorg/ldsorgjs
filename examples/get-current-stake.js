(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , forEachAsync = require('forEachAsync')
    , stake
    , count = 0
    ;

  function getStuff() {
      ldsorg.getCurrentStake(function (_stake) { stake = _stake }, { fullHouseholds: true });
  }
  ldsorg.init(getStuff, { household: function () { console.log(count += 1); } })
}());
