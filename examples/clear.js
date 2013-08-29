(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    ;

  function getStuff() {
    ldsorg.clear();
  }

  ldsorg.init(
    getStuff
  , {}
  );
}());
