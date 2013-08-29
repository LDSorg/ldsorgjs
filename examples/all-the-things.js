/*jshint unused: false*/
var stake
  ;
(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , numStakes
    , countStakes
    , numStakePositions
    , countStakePositions
    , numWards
    , countWards
    , numWardPositions
    , countWardPositions
    , numWardOrganizations
    , countWardOrganizations
    , numHouseholds
    , countHouseholds
    ;

  function getStuff() {
      ldsorg.getCurrentStake(
        function (_stake) {
          stake = _stake;
          console.log("All Done!");
        }
      , { //fullHouseholds: false
        //, wards: false
        }
      );
  }

  //TODO
  numStakes = 1;
  countStakes = 0;

  ldsorg.init(getStuff, {
    // db caches
    cacheInit: function () {
      debug('cacheInit', arguments);
    }
  , cacheReady: function () {
      debug('cacheReady', arguments);
    }
    
    // All Meta Data
  , meta: function (meta) {
      console.log('[meta]', meta);
    }
    // TODO
  , area: function (area) {
      console.log('[area]');
      console.log(area);

      numStakes = area.stakes.length;
      countStakes = 0;
    }


    // All Stake Data
  , stakeInit: function (stake) {
      countStakes += 1;
      numWards = stake.wards.length;
      countWards = 0;

      console.log('Stake', '(' + countStakes + ' of ' + numStakes + ')');
      console.log('  "' + stake.stakeName + '"');
    }
  , stakeCallingsInit: function (stake) {
      console.log('  stake callings...');
    }
  , stakePositionsInit: function (stake) {
      console.log('  stake positions...');
    }
  , stakePositions: function (stake, positions) {
      countStakePositions = 0;
      numStakePositions = positions.unitLeadership.length;

      console.log('  ' + positions.unitLeadership.length);
    }
  , stakeLeadershipInit: function (stake, group) {
      countStakePositions += 1;
      console.log('  ' + group.groupName + ' (' + countStakePositions + ' of ' + numStakePositions + ') ...');
    }
  , stakeLeadership: function (stake, group, leaders) {
      console.log('    ', group.groupName, leaders.leaders.length);
    }
  , stakeCallings: function (stake, callings) {
      console.log('  callings', callings.length);
    }
  , stake: function (stake, group) {
      console.log('  now has all non-ward stake data');
    }
  , stakeEnd: function (stake) {
      console.log('');
    }


    // All Ward Data
  , wardInit: function (ward) {
      countWards += 1;

      console.log('  Ward', '(' + countWards + ' of ' + numWards + ')');
      console.log('    "' + ward.wardName + '"');
    }
  , wardCallingsInit: function (ward) {
      console.log('  callings...');
    }
  , wardPositionsInit: function (ward) {
      console.log('    positions for "' + ward.wardName + '"...');
    }
  , wardPositions: function (ward, positions) {
      // TODO ditch the `unitLeadership` ?
      numWardPositions = positions.unitLeadership.length;
      countWardPositions = 0;

      console.log('    ', positions.unitLeadership.length);
    }
  , wardLeadershipInit: function (ward, group) {
      countWardPositions += 1;

      console.log('    ' + group.groupName + ' (' + countWardPositions + ' of ' + numWardPositions + ') ...');
    }
  , wardLeadership: function (ward, group, leaders) {
      console.log('    ', group.groupName, group.positions.map(function (leader) {
        return leader.positionName;

      }), group.positions.length, leaders.leaders.length);
    }
  , wardCallings: function (ward, callings) {
      console.log('    [wardCallings]', callings.length);
    }

  , wardOrganizationsInit: function (ward, orgnames) {
      numWardOrganizations = orgnames.length;
      countWardOrganizations = 0;

      console.log('    [wardOrganizationsInit]' + orgnames);
    }
  , wardOrganizationInit: function (ward, orgname) {
      countWardOrganizations += 1;

      console.log(
        '      [wardOrganizationInit] ' + orgname
      + ' (' + countWardOrganizations + ' of ' + numWardOrganizations + ') ...'
      );
    }
  , wardOrganization: function (ward, orgname, members) {
      console.log('      [wardOrganazition]', orgname, members.length);
    }
  , wardOrganizations: function (ward, orgs) {
      console.log('    [wardOrganazations]', Object.keys(orgs).length);
    }
  , ward: function (ward) {
      console.log('    now has all non-househald ward data');
    }

  , householdsInit: function (households) {
      numHouseholds = households.length;
      countHouseholds = 0;

      console.log('    ' + households.length + ' households...');
    }
  , households: function (households) {
      console.log('');
    }
  , wardEnd: function (ward) {
      console.log('');
    }


    // All Household Data
  , householdInit: function (household) {
      countHouseholds += 1;

      console.log('      ' + household.householdName + ' ' + countHouseholds + ' of ' + numHouseholds + '...');
    }
  , household: function (household) {
      console.log('      ' + household.coupleName);
      //console.log(household);
    }
  , householdPhotoInit: function (household) {
      console.log('        family pic...');
    }
  , householdPhoto: function (household, dataUrl) {
      console.log('        ' + dataUrl.length, 'bytes as dataUrl');
    }
    // TODO spouse and children
  , individualPhotoInit: function (individual) {
      console.log('        ' + (individual.preferredName || individual.directoryName));
    }
  , individualPhoto: function (individual, dataUrl) {
      console.log('        ' + dataUrl.length, 'bytes as dataUrl');
    }
  , householdEnd: function (household) {
      console.log('');
    }
  });
}());
