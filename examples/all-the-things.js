/*jshint unused: false*/
(function () {
  'use strict';

  var LdsOrg = require('ldsorg')
    , ldsorg = LdsOrg.create()
    , stake
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

  function debug(ev, args) {
    return;
    var as = [].slice.call(args)
      ;
      
    as.unshift(ev);
    console.log.apply(console, args);
  }

  function getStuff() {
      ldsorg.getCurrentStake(
        function (_stake) {
          stake = _stake;
          console.log("All Done!");
        }
      , { fullHouseholds: false
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
      debug('meta', arguments);
      console.log('[meta]', meta);
    }
    // TODO
  , area: function (area) {
      debug('area', arguments);
      console.log('[area]');
      console.log(area);

      numStakes = area.stakes.length;
      countStakes = 0;
    }


    // All Stake Data
  , stakeInit: function (stake) {
      debug('stakeInit', arguments);
      countStakes += 1;
      numWards = stake.wards.length;
      countWards = 0;

      console.log('Stake', '(' + countStakes + ' of ' + numStakes + ')');
      console.log('  "' + stake.stakeName + '"');
    }
  , stakeCallingsInit: function (stake) {
      debug('stakeCallingsInit', arguments);
      console.log('  stake callings...');
    }
  , stakePositionsInit: function (stake) {
      debug('stakePositionsInit', arguments);
      console.log('  stake positions...');
    }
  , stakePositions: function (stake, positions) {
      debug('stakePositions', arguments);
      countStakePositions = 0;
      numStakePositions = positions.unitLeadership.length;

      console.log('  ' + positions.unitLeadership.length);
    }
  , stakeLeadershipInit: function (stake, group) {
      debug('stakeLeadershipInit', arguments);
      countStakePositions += 1;
      console.log('  ' + group.groupName + ' (' + countStakePositions + ' of ' + numStakePositions + ') ...');
    }
  , stakeLeadership: function (stake, group, leaders) {
      debug('stakeLeadership', arguments);
      console.log('    ', group.groupName, leaders.leaders.length);
    }
  , stakeCallings: function (stake, callings) {
      debug('stakeCallings', arguments);
      console.log('  callings', callings.length);
    }
  , stake: function (stake, group) {
      debug('stake', arguments);
      console.log('  now has all non-ward stake data');
    }
  , stakeEnd: function (stake) {
      debug('stakeEnd', arguments);
      console.log('');
    }


    // All Ward Data
  , wardInit: function (ward) {
      debug('wardInit', arguments);
      countWards += 1;

      console.log('  Ward', '(' + countWards + ' of ' + numWards + ')');
      console.log('    "' + ward.wardName + '"');
    }
  , wardCallingsInit: function (ward) {
      debug('wardCallingsInit', arguments);
      console.log('  callings...');
    }
  , wardPositionsInit: function (ward) {
      debug('wardPositionsInit', arguments);
      console.log('    positions for "' + ward.wardName + '"...');
    }
  , wardPositions: function (ward, positions) {
      debug('wardPositions', arguments);
      // TODO ditch the `unitLeadership` ?
      numWardPositions = positions.unitLeadership.length;
      countWardPositions = 0;

      console.log('    ', positions.unitLeadership.length);
    }
  , wardLeadershipInit: function (ward, group) {
      debug('wardLeadershipInit', arguments);
      countWardPositions += 1;

      console.log('    ' + group.groupName + ' (' + countWardPositions + ' of ' + numWardPositions + ') ...');
    }
  , wardLeadership: function (ward, group, leaders) {
      debug('wardLeadership', arguments);
      console.log('    ', group.groupName, group.positions.map(function (leader) {
        return leader.positionName;

      }), group.positions.length, leaders.leaders.length);
    }
  , wardCallings: function (ward, callings) {
      debug('wardCallings', arguments);
      console.log('    [wardCallings]', callings.length);
    }

  , wardOrganizationsInit: function (ward, orgnames) {
      debug('wardOrganizationsInit', arguments);
      numWardOrganizations = orgnames.length;
      countWardOrganizations = 0;

      console.log('    [wardOrganizationsInit]' + orgnames);
    }
  , wardOrganizationInit: function (ward, orgname) {
      debug('wardOrganizationInit', arguments);
      countWardOrganizations += 1;

      console.log(
        '      [wardOrganizationInit] ' + orgname
      + ' (' + countWardOrganizations + ' of ' + numWardOrganizations + ') ...'
      );
    }
  , wardOrganization: function (ward, orgname, members) {
      debug('wardOrganization', arguments);
      console.log('      [wardOrganazition]', orgname, members.length);
    }
  , wardOrganizations: function (ward, orgs) {
      debug('wardOrganizations', arguments);
      console.log('    [wardOrganazations]', Object.keys(orgs).length);
    }
  , ward: function (ward) {
      debug('ward', arguments);
      console.log('    now has all non-househald ward data');
    }

  , householdsInit: function (households) {
      debug('householdsInit', arguments);
      numHouseholds = households.length;
      countHouseholds = 0;

      console.log('    ' + households.length + ' households...');
    }
  , households: function (households) {
      debug('households', arguments);

      console.log('');
    }
  , wardEnd: function (ward) {
      debug('wardEnd', arguments);
      console.log('');
    }


    // All Household Data
  , householdInit: function (household) {
      debug('householdInit', arguments);
      countHouseholds += 1;

      console.log('      ' + household.householdName + ' ' + countHouseholds + ' of ' + numHouseholds + '...');
    }
  , household: function (household) {
      debug('household', arguments);
      console.log('      ' + household.coupleName);
      //console.log(household);
    }
  , householdPhotoInit: function (household) {
      debug('householdPhotoInit', arguments);
      console.log('        family pic...');
    }
  , householdPhoto: function (household, dataUrl) {
      debug('householdPhoto', arguments);
      console.log('        ' + dataUrl.length, 'bytes as dataUrl');
    }
    // TODO spouse and children
  , individualPhotoInit: function (individual) {
      debug('individualPhotoInit', arguments);
      console.log('        ' + (individual.preferredName || individual.directoryName));
    }
  , individualPhoto: function (individual, dataUrl) {
      debug('individualPhoto', arguments);
      console.log('        ' + dataUrl.length, 'bytes as dataUrl');
    }
  , householdEnd: function (household) {
      debug('householdEnd', arguments);
      console.log('');
    }
  });
}());
