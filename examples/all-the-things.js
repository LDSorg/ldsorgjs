/*jshint unused: false*/
var stake
  , stakeJson
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

  function upload(id) {
    var form = new FormData()
      ;

    form.append(id, stakeJson);

    jQuery.ajax({
      url: "http://dropsha.re/files"
    , type: "POST"
    , data: form
    , cache: false
    , contentType: false
    , processData: false
    , success: function (response) {
        console.log(response);
      }
    });
  }

  function preUpload() {
    stakeJson = JSON.stringify(stake);

    jQuery.ajax({
      url: "http://dropsha.re/meta"
    , type: "POST"
    , contentType: "application/json"
    , data: JSON.stringify([{
        name: "sf-lds-org.json"
      , type: "application/json"
      , size: stake.length
      }])
    , success: function (response) {
        console.log(response);
        upload(response[0]);
      }
    });
  }

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
      console.log('[cache] init');
    }
  , cacheReady: function () {
      console.log('[cache] ready');
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

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' - ' + stake.stakeName
      );
    }
  , stakeCallingsInit: function (stake) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [callings]'
      );
    }
  , stakePositionsInit: function (stake) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [callings][positions]'
      );
    }
  , stakePositions: function (stake, positions) {
      countStakePositions = 0;
      numStakePositions = positions.unitLeadership.length;

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [callings][positions] ' + numStakePositions
      );
    }
  , stakeLeadershipInit: function (stake, group) {
      countStakePositions += 1;
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [callings][leadership] ' + countStakePositions + '/' + numStakePositions
      + ' - ' + group.groupName
      );
    }
  , stakeLeadership: function (stake, group, leaders) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [callings][leadership] ' + countStakePositions + '/' + numStakePositions
      + ' - ' + group.groupName + ' ' + leaders.leaders.length
      );
    }
  , stakeCallings: function (stake, callings) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [callings] ' + callings.length
      );
    }
  , stake: function (stake, group) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [wards] 0/' + stake.wards.length
      );
    }
  , stakeEnd: function (stake) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' - ' + stake.stakeName
      + ' [end]'
      );
    }


    // All Ward Data
  , wardInit: function (ward) {
      countWards += 1;

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' - ' + ward.wardName
      );
    }
  , wardCallingsInit: function (ward) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [callings]'
      );
    }
  , wardPositionsInit: function (ward) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [positions]'
      );
    }
  , wardPositions: function (ward, positions) {
      // TODO ditch the `unitLeadership` ?
      numWardPositions = positions.unitLeadership.length;
      countWardPositions = 0;

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [positions] ' + numWardPositions
      );
    }
  , wardLeadershipInit: function (ward, group) {
      countWardPositions += 1;

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [leadership] ' + countWardPositions + '/' + numWardPositions
      + ' - ' + group.groupName
      );
    }
  , wardLeadership: function (ward, group, leaders) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [leadership] ' + countWardPositions + '/' + numWardPositions
      + ' - ' + group.groupName + ' ' + group.positions.length + ':' + leaders.leaders.length
      );
      // TODO group.positions.forEach leader.positionName
    }
  , wardCallings: function (ward, callings) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [callings] ' + callings.length
      );
    }

  , wardOrganizationsInit: function (ward, orgnames) {
      numWardOrganizations = orgnames.length;
      countWardOrganizations = 0;

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [organizations] ' + orgnames.length
      );
    }
  , wardOrganizationInit: function (ward, orgname) {
      countWardOrganizations += 1;


      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [organization] ' + countWardOrganizations + '/' + numWardOrganizations
      );
    }
  , wardOrganization: function (ward, orgname, members) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [organization] ' + countWardOrganizations + '/' + numWardOrganizations
      + ' - ' + orgname + ' ' + members.length
      );
    }
  , wardOrganizations: function (ward, orgs) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [organizations] ' + Object.keys(orgs).length + ' [end]'
      );
    }
  , ward: function (ward) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [households] 0/' + ward.households
      );
    }
  , wardEnd: function (ward) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' - ' + ward.wardName
      + ' [end]'
      );
    }

  , householdsInit: function (households) {
      numHouseholds = households.length;
      countHouseholds = 0;

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [households] 0/' + households.length
      );
    }
  , households: function (households) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [households] ' + households.length
      );
    }


    // All Household Data
  , householdInit: function (household) {
      countHouseholds += 1;

      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [household] ' + countHouseholds + '/' + numHouseholds
      + ' - ' + household.householdName
      );
    }
  , household: function (household) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [household] ' + countHouseholds + '/' + numHouseholds
      + ' - ' + household.coupleName
      );
    }
  , householdPhotoInit: function (household) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [household] ' + countHouseholds + '/' + numHouseholds
      + ' [fam-pic] '
      );
    }
  , householdPhoto: function (household, dataUrl) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [household] ' + countHouseholds + '/' + numHouseholds
      + ' [fam-pic] ' + dataUrl.length
      );
    }
    // TODO spouse and children
  , individualPhotoInit: function (household) {
      //console.log('        ' + (household.preferredName || household.directoryName));
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [household] ' + countHouseholds + '/' + numHouseholds
      + ' [solo-pic] '
      );
    }
  , individualPhoto: function (household, dataUrl) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [household] ' + countHouseholds + '/' + numHouseholds
      + ' [solo-pic] ' + dataUrl.length
      );
    }
  , householdEnd: function (household) {
      console.log(
        '[stake] ' + countStakes + '/' + numStakes
      + ' [ward] ' + countWards + '/' + numWards
      + ' [household] ' + countHouseholds + '/' + numHouseholds
      + ' [end]'
      );
    }
  });
}());
