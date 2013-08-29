(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , callings
    ;

  function getStuff() {
      ldsorg.getCurrentStakeCallings(function (_callings) {
        callings = _callings;
        console.log("All Stake Callings", _callings);
      });
  }

  ldsorg.init(
    getStuff
  , { stakeCallingsInit: function (stake) { console.log('[stakeCallingsInit]', stake); }
    , stakePositionsInit: function (stake) { console.log('[stakePositionsInit]'); }
    , stakePositions: function (stake, positions) { console.log('[stakePositions]', positions); }
    , stakeLeadershipInit: function (stake) { console.log('[stakeLeadershipInit]'); }
    , stakeLeadership: function (stake, name, list) { console.log('[stakeCallings]', name, list); }
    , stakeCallings: function (stake, callings) { console.log('[stakeCallings]', stake, callings); }
    }
  );
}());
