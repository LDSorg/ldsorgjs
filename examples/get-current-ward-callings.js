(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , callings
    ;

  function getStuff() {
      ldsorg.getCurrentWardCallings(function (_callings) {
        callings = _callings;
        console.log("All Ward Callings", _callings);
      });
  }

  ldsorg.init(
    getStuff
  , { wardCallingsInit: function (ward) { console.log('[wardCallingsInit]', ward); }
    , wardPositionsInit: function (ward) { console.log('[wardPositionsInit]'); }
    , wardPositions: function (ward, positions) { console.log('[wardPositions]', positions); }
    , wardLeadershipInit: function (ward) { console.log('[wardLeadershipInit]'); }
    , wardLeadership: function (ward, name, list) { console.log('[wardCallings]', name, list); }
    , wardCallings: function (ward, callings) { console.log('[wardCallings]', ward, callings); }
    }
  );
}());
