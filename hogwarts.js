/*jshint -W054 */
(function (exports) {
  'use strict';

  var Hogwarts = {}
    , singleton 
    , defaults
    , genderedNamesTpl
    , organizations
    , guyPics = []
    , galPics = []
    , photoIndex = 0
    ;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function genGuyPhotoNums() {
    // men 0-99
    for (photoIndex = 0; photoIndex < 99; photoIndex += 1) {
      guyPics.push(photoIndex);
    }
  }

  function genGalPhotoNums() {
    // women 0-96
    for (photoIndex = 0; photoIndex < 96; photoIndex += 1) {
      galPics.push(photoIndex);
    }
  }

  function getCachedImage(url) {
    // 375, 150, 40
    return "http://images.coolaj86.com/api/resize/width/150?url="
      + encodeURIComponent(url);
  }

  // https://github.com/coolaj86/knuth-shuffle/blob/master/index.js
  function shuffle(array) {
    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  function badrand() {
    return Math.random() - 0.5;
  }

  organizations = {
    "high_priest": [],
    "relief_society": [],
    "elder": [],
    "priest": [],
    "teacher": [],
    "deacon": [],
    "laurel": [],
    "mia_maid": [],
    "beehive": [],
    "adults": []
  };

  // TODO [callingName, id, howMany]
  // TODO ["Stake President", 1, 1]
  // TODO ["Stake Auditor", 1, 3]
  // attach to key "leaders"
  function getStakeLeadershipGroup() {
    return {
      1186: [
        { "callingName": "Stake President",
          "positionId": 1
        },
        { "callingName": "Stake Presidency First Counselor",
          "positionId": 2
        },
        { "callingName": "Stake Presidency Second Counselor",
          "positionId": 3
        },
        { "callingName": "Stake Executive Secretary",
          "positionId": 51
        },
        { "callingName": "Stake Clerk",
          "positionId": 52
        },
        { "callingName": "Stake Assistant Clerk",
          "positionId": 53
        },
        { "callingName": "Stake Assistant Executive Secretary",
          "positionId": 491
        }
      ]
    , 1189: [
        { "callingName": "Stake High Councilor",
          "positionId": 94
        },
        { "callingName": "Stake High Councilor",
          "positionId": 94
        }
      ]
    , 1190: [
        { "callingName": "Patriarch",
          "positionId": 13
        }
      ]
    , 1281: [
        { "callingName": "Stake Auditor",
          "positionId": 691
        },
        { "callingName": "Stake Auditor",
          "positionId": 691
        },
        { "callingName": "Stake Auditor",
          "positionId": 691
        },
        { "callingName": "Stake Audit Committee Chairman",
          "positionId": 1276
        },
        { "callingName": "Stake Audit Committee Member",
          "positionId": 1836
        },
        { "callingName": "Stake Audit Committee Member",
          "positionId": 1836
        }
      ]
    , 717: [
        { "callingName": "Advisor",
          "positionId": 999999
        },
        { "callingName": "Advisor",
          "positionId": 999999
        },
        { "callingName": "Advisor",
          "positionId": 999999
        }
      ]
    , 1300: [
        { "callingName": "Stake Music Chairman",
          "positionId": 728
        }
      ]
    , 1280: [
        { "callingName": "Stake Activities Committee Chairman",
          "positionId": 720
        }
      ]
    };
  }

  function getWardLeadershipPositions(wardName) {
    return {
      "unitLeadership": [
        {
          "groupKey": 1179,
          "groupName": "Bishopric",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 1,
              "positionId": 4,
              "positionName": "Bishop"
            },
            {
              "displayOrder": 3,
              "positionId": 54,
              "positionName": "Bishopric First Counselor"
            },
            {
              "displayOrder": 4,
              "positionId": 55,
              "positionName": "Bishopric Second Counselor"
            },
            {
              "displayOrder": 5,
              "positionId": 56,
              "positionName": "Ward Executive Secretary"
            },
            {
              "displayOrder": 6,
              "positionId": 57,
              "positionName": "Ward Clerk"
            },
            {
              "displayOrder": 7,
              "positionId": 58,
              "positionName": "Ward Assistant Clerk"
            },
            {
              "displayOrder": 8,
              "positionId": 787,
              "positionName": "Ward Assistant Clerk--Membership"
            },
            {
              "displayOrder": 9,
              "positionId": 786,
              "positionName": "Ward Assistant Clerk--Finance"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Assistant Executive Secretary"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Historical Clerk"
            }
          ],
          "leaders": [
            {
              "callingName": "Bishop",
              "positionId": 4
            },
            {
              "callingName": "Bishopric First Counselor",
              "positionId": 54
            },
            {
              "callingName": "Bishopric Second Counselor",
              "positionId": 55
            },
            {
              "callingName": "Ward Executive Secretary",
              "positionId": 56
            },
            {
              "callingName": "Ward Clerk",
              "positionId": 57
            },
            {
              "callingName": "Ward Assistant Clerk",
              "positionId": 58
            },
            {
              "callingName": "Ward Assistant Clerk--Finance",
              "positionId": 786
            },
            {
              "callingName": "Ward Assistant Clerk--Membership",
              "positionId": 787
            },
            {
              "callingName": "Assistant Executive Secretary",
              "positionId": 999999
            },
            {
              "callingName": "Assistant Executive Secretary",
              "positionId": 999999
            },
            {
              "callingName": "Ward Historical Clerk",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        },
        {
          "groupKey": 70,
          "groupName": "Elders Quorum",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 17,
              "positionId": 138,
              "positionName": "Elders Quorum President"
            },
            {
              "displayOrder": 18,
              "positionId": 139,
              "positionName": "Elders Quorum First Counselor"
            },
            {
              "displayOrder": 19,
              "positionId": 140,
              "positionName": "Elders Quorum Second Counselor"
            },
            {
              "displayOrder": 20,
              "positionId": 141,
              "positionName": "Elders Quorum Secretary"
            },
            {
              "displayOrder": 22,
              "positionId": 142,
              "positionName": "Elders Quorum Instructor"
            },
            {
              "displayOrder": 23,
              "positionId": 1394,
              "positionName": "Elders Home Teaching District Supervisor"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Home teaching Coordinator"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Coordinator"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Coordinator Assistent"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Elder's Quorum Teacher"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Activities and service coordinator"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Fast Offerings"
            }
          ],
          "leaders": [
            {
              "callingName": "Elders Quorum President",
              "positionId": 138
            },
            {
              "callingName": "Elders Quorum First Counselor",
              "positionId": 139
            },
            {
              "callingName": "Elders Quorum Second Counselor",
              "positionId": 140
            },
            {
              "callingName": "Elders Quorum Secretary",
              "positionId": 141
            },
            {
              "callingName": "Elders Quorum Instructor",
              "positionId": 142
            },
            {
              "callingName": "Elders Quorum Instructor",
              "positionId": 142
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Elders Home Teaching District Supervisor",
              "positionId": 1394
            },
            {
              "callingName": "Activities and service coordinator",
              "positionId": 999999
            },
            {
              "callingName": "Elder's Quorum Teacher",
              "positionId": 999999
            },
            {
              "callingName": "Elder's Quorum Teacher",
              "positionId": 999999
            },
            {
              "callingName": "Fast Offerings",
              "positionId": 999999
            },
            {
              "callingName": "Home teaching Coordinator",
              "positionId": 999999
            },
            {
              "callingName": "Pianist",
              "positionId": 999999
            },
            {
              "callingName": "Sacrament Coordinator",
              "positionId": 999999
            },
            {
              "callingName": "Sacrament Coordinator Assistent",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        },
        {
          "groupKey": 74,
          "groupName": "Relief Society",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 24,
              "positionId": 143,
              "positionName": "Relief Society President"
            },
            {
              "displayOrder": 25,
              "positionId": 144,
              "positionName": "Relief Society First Counselor"
            },
            {
              "displayOrder": 26,
              "positionId": 145,
              "positionName": "Relief Society Second Counselor"
            },
            {
              "displayOrder": 27,
              "positionId": 146,
              "positionName": "Relief Society Secretary"
            },
            {
              "displayOrder": 28,
              "positionId": 1900,
              "positionName": "Relief Society Assistant Secretary"
            },
            {
              "displayOrder": 29,
              "positionId": 1554,
              "positionName": "Relief Society Meeting Coordinator"
            },
            {
              "displayOrder": 32,
              "positionId": 150,
              "positionName": "Relief Society Teacher"
            },
            {
              "displayOrder": 34,
              "positionId": 152,
              "positionName": "Relief Society Visiting Teaching District Supervisor"
            },
            {
              "displayOrder": 35,
              "positionId": 157,
              "positionName": "Relief Society Music Leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Assistant RS Service leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "RS Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "RS Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "RS Service Committee Leader"
            }
          ],
          "leaders": [
            {
              "callingName": "Relief Society President",
              "positionId": 143
            },
            {
              "callingName": "Relief Society First Counselor",
              "positionId": 144
            },
            {
              "callingName": "Relief Society Second Counselor",
              "positionId": 145
            },
            {
              "callingName": "Relief Society Secretary",
              "positionId": 146
            },
            {
              "callingName": "Relief Society Teacher",
              "positionId": 150
            },
            {
              "callingName": "Relief Society Teacher",
              "positionId": 150
            },
            {
              "callingName": "Relief Society Teacher",
              "positionId": 150
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Visiting Teaching District Supervisor",
              "positionId": 152
            },
            {
              "callingName": "Relief Society Music Leader",
              "positionId": 157
            },
            {
              "callingName": "Relief Society Meeting Coordinator",
              "positionId": 1554
            },
            {
              "callingName": "Relief Society Assistant Secretary",
              "positionId": 1900
            },
            {
              "callingName": "Assistant RS Service leader",
              "positionId": 999999
            },
            {
              "callingName": "Pianist",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Leader",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Leader",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "RS Service Committee Member",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        },
        {
          "groupKey": 75,
          "groupName": "Sunday School",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 45,
              "positionId": 204,
              "positionName": "Sunday School President"
            },
            {
              "displayOrder": 46,
              "positionId": 205,
              "positionName": "Sunday School First Counselor"
            },
            {
              "displayOrder": 47,
              "positionId": 206,
              "positionName": "Sunday School Second Counselor"
            },
            {
              "displayOrder": 48,
              "positionId": 207,
              "positionName": "Sunday School Secretary"
            },
            {
              "displayOrder": 49,
              "positionId": 208,
              "positionName": "Sunday School Teacher"
            },
            {
              "displayOrder": 54,
              "positionId": 1468,
              "positionName": "Teacher - Gospel Principles"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Gospel doctrine teacher"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Class President"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Gospel Essentials Teacher"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Activities Committee Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Co-Chair"
            }
          ],
          "leaders": [
            {
              "callingName": "Sunday School President",
              "positionId": 204
            },
            {
              "callingName": "Sunday School First Counselor",
              "positionId": 205
            },
            {
              "callingName": "Sunday School Second Counselor",
              "positionId": 206
            },
            {
              "callingName": "Sunday School Secretary",
              "positionId": 207
            },
            {
              "callingName": "Sunday School Teacher",
              "positionId": 208
            },
            {
              "callingName": "Teacher - Gospel Principles",
              "positionId": 1468
            },
            {
              "callingName": "Activities Committee Chair",
              "positionId": 999999
            },
            {
              "callingName": "Class President",
              "positionId": 999999
            },
            {
              "callingName": "Class President",
              "positionId": 999999
            },
            {
              "callingName": "FHE Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Gospel Essentials Teacher",
              "positionId": 999999
            },
            {
              "callingName": "Gospel doctrine teacher",
              "positionId": 999999
            },
            {
              "callingName": "Gospel doctrine teacher",
              "positionId": 999999
            },
            {
              "callingName": "Temple Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Temple Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "Temple Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "Temple Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "Temple Committee Member",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        },
        {
          "groupKey": 1185,
          "groupName": "Other Callings",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 166,
              "positionId": 689,
              "positionName": "History Specialist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Break the Fast Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Prayer Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Emergency Preparedness Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Institute Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 1 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 1 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 2 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 2 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 3 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 3 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 4 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 4 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Publicity Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Publicity Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Historical Assistant"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Committee member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Institute Committe Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Prayer Chorister"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee-Indexing"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Prayer Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Activities Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward History Committee"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Institute Co-Chair"
            }
          ],
          "leaders": [
            {
              "callingName": "History Specialist",
              "positionId": 689
            },
            {
              "callingName": "Activities Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "Activities Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "Break the Fast Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Break the Fast Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Emergency Preparedness Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Emergency Preparedness Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "FHE Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "FHE Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 1 (Dad)",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 1 (Mom)",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 2 (Dad)",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 2 (Mom)",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 3 (Mom)",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 3 (Dad)",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 4 (Dad)",
              "positionId": 999999
            },
            {
              "callingName": "FHE Group Leader 4 (Mom)",
              "positionId": 999999
            },
            {
              "callingName": "Institute Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Institute Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Institute Committe Member",
              "positionId": 999999
            },
            {
              "callingName": "Institute Committe Member",
              "positionId": 999999
            },
            {
              "callingName": "Publicity Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Publicity Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Service Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Service Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Service Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "Service Committee Member",
              "positionId": 999999
            },
            {
              "callingName": "Service Committee member",
              "positionId": 999999
            },
            {
              "callingName": "Service Committee member",
              "positionId": 999999
            },
            {
              "callingName": "Service Committee member",
              "positionId": 999999
            },
            {
              "callingName": "Service Committee member",
              "positionId": 999999
            },
            {
              "callingName": "Service Committee member",
              "positionId": 999999
            },
            {
              "callingName": "Temple Committee Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Temple Committee member",
              "positionId": 999999
            },
            {
              "callingName": "Temple Committee-Indexing",
              "positionId": 999999
            },
            {
              "callingName": "Ward Historical Assistant",
              "positionId": 999999
            },
            {
              "callingName": "Ward History Committee",
              "positionId": 999999
            },
            {
              "callingName": "Ward Prayer Chorister",
              "positionId": 999999
            },
            {
              "callingName": "Ward Prayer Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Ward Prayer Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Ward Prayer Committee Member",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        },
        {
          "groupKey": 1310,
          "groupName": "Ward Missionaries",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 175,
              "positionId": 221,
              "positionName": "Mission Leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Missionary"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sister Mission Leader"
            }
          ],
          "leaders": [
            {
              "callingName": "Mission Leader",
              "positionId": 221
            },
            {
              "callingName": "Sister Mission Leader",
              "positionId": 999999
            },
            {
              "callingName": "Ward Missionary",
              "positionId": 999999
            },
            {
              "callingName": "Ward Missionary",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        },
        {
          "groupKey": 1300,
          "groupName": "Music",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Choir President"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Choir Director"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Choir Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Chorister"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Music Co-Chair"
            }
          ],
          "leaders": [
            {
              "callingName": "Music Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Music Co-Chair",
              "positionId": 999999
            },
            {
              "callingName": "Sacrament Chorister",
              "positionId": 999999
            },
            {
              "callingName": "Sacrament Pianist",
              "positionId": 999999
            },
            {
              "callingName": "Ward Choir Director",
              "positionId": 999999
            },
            {
              "callingName": "Ward Choir Pianist",
              "positionId": 999999
            },
            {
              "callingName": "Ward Choir President",
              "positionId": 999999
            },
            {
              "callingName": "Ward Choir President",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        },
        {
          "groupKey": 1183,
          "groupName": "Young Single Adult",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Missionary Leader"
            }
          ],
          "leaders": [
            {
              "callingName": "Ward Missionary Leader",
              "positionId": 999999
            }
          ],
          "unitName": wardName
        }
      ],
      "wardLeadership": [
        {
          "groupKey": 1179,
          "groupName": "Bishopric",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 1,
              "positionId": 4,
              "positionName": "Bishop"
            },
            {
              "displayOrder": 3,
              "positionId": 54,
              "positionName": "Bishopric First Counselor"
            },
            {
              "displayOrder": 4,
              "positionId": 55,
              "positionName": "Bishopric Second Counselor"
            },
            {
              "displayOrder": 5,
              "positionId": 56,
              "positionName": "Ward Executive Secretary"
            },
            {
              "displayOrder": 6,
              "positionId": 57,
              "positionName": "Ward Clerk"
            },
            {
              "displayOrder": 7,
              "positionId": 58,
              "positionName": "Ward Assistant Clerk"
            },
            {
              "displayOrder": 8,
              "positionId": 787,
              "positionName": "Ward Assistant Clerk--Membership"
            },
            {
              "displayOrder": 9,
              "positionId": 786,
              "positionName": "Ward Assistant Clerk--Finance"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Assistant Executive Secretary"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Historical Clerk"
            }
          ]
        },
        {
          "groupKey": 70,
          "groupName": "Elders Quorum",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 17,
              "positionId": 138,
              "positionName": "Elders Quorum President"
            },
            {
              "displayOrder": 18,
              "positionId": 139,
              "positionName": "Elders Quorum First Counselor"
            },
            {
              "displayOrder": 19,
              "positionId": 140,
              "positionName": "Elders Quorum Second Counselor"
            },
            {
              "displayOrder": 20,
              "positionId": 141,
              "positionName": "Elders Quorum Secretary"
            },
            {
              "displayOrder": 22,
              "positionId": 142,
              "positionName": "Elders Quorum Instructor"
            },
            {
              "displayOrder": 23,
              "positionId": 1394,
              "positionName": "Elders Home Teaching District Supervisor"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Home teaching Coordinator"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Coordinator"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Coordinator Assistent"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Elder's Quorum Teacher"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Activities and service coordinator"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Fast Offerings"
            }
          ]
        },
        {
          "groupKey": 74,
          "groupName": "Relief Society",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 24,
              "positionId": 143,
              "positionName": "Relief Society President"
            },
            {
              "displayOrder": 25,
              "positionId": 144,
              "positionName": "Relief Society First Counselor"
            },
            {
              "displayOrder": 26,
              "positionId": 145,
              "positionName": "Relief Society Second Counselor"
            },
            {
              "displayOrder": 27,
              "positionId": 146,
              "positionName": "Relief Society Secretary"
            },
            {
              "displayOrder": 28,
              "positionId": 1900,
              "positionName": "Relief Society Assistant Secretary"
            },
            {
              "displayOrder": 29,
              "positionId": 1554,
              "positionName": "Relief Society Meeting Coordinator"
            },
            {
              "displayOrder": 32,
              "positionId": 150,
              "positionName": "Relief Society Teacher"
            },
            {
              "displayOrder": 34,
              "positionId": 152,
              "positionName": "Relief Society Visiting Teaching District Supervisor"
            },
            {
              "displayOrder": 35,
              "positionId": 157,
              "positionName": "Relief Society Music Leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Assistant RS Service leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "RS Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "RS Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "RS Service Committee Leader"
            }
          ]
        },
        {
          "groupKey": 75,
          "groupName": "Sunday School",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 45,
              "positionId": 204,
              "positionName": "Sunday School President"
            },
            {
              "displayOrder": 46,
              "positionId": 205,
              "positionName": "Sunday School First Counselor"
            },
            {
              "displayOrder": 47,
              "positionId": 206,
              "positionName": "Sunday School Second Counselor"
            },
            {
              "displayOrder": 48,
              "positionId": 207,
              "positionName": "Sunday School Secretary"
            },
            {
              "displayOrder": 49,
              "positionId": 208,
              "positionName": "Sunday School Teacher"
            },
            {
              "displayOrder": 54,
              "positionId": 1468,
              "positionName": "Teacher - Gospel Principles"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Gospel doctrine teacher"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Class President"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Gospel Essentials Teacher"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Activities Committee Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Co-Chair"
            }
          ]
        },
        {
          "groupKey": 1185,
          "groupName": "Other Callings",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Break the Fast Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Prayer Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Emergency Preparedness Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Institute Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 1 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 1 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 2 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 2 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 3 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 3 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 4 (Mom)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader 4 (Dad)"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Publicity Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Publicity Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Historical Assistant"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Committee member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Institute Committe Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Service Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Prayer Chorister"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee Co-Chair"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Temple Committee-Indexing"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Prayer Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Activities Committee Member"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "FHE Group Leader"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward History Committee"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Institute Co-Chair"
            },
            {
              "displayOrder": 166,
              "positionId": 689,
              "positionName": "History Specialist"
            }
          ]
        },
        {
          "groupKey": 1310,
          "groupName": "Ward Missionaries",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Missionary"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sister Mission Leader"
            },
            {
              "displayOrder": 175,
              "positionId": 221,
              "positionName": "Mission Leader"
            }
          ]
        },
        {
          "groupKey": 1300,
          "groupName": "Music",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Choir President"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Choir Director"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Choir Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Pianist"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Sacrament Chorister"
            },
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Music Co-Chair"
            }
          ]
        },
        {
          "groupKey": 1183,
          "groupName": "Young Single Adult",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Ward Missionary Leader"
            }
          ]
        }
      ]
    };
  }

  function getStakeLeadershipPositions(stakeName) {
    return {
      "stakeLeadership": [
        {
          "groupKey": 1186,
          "groupName": "Stake Presidency",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 1,
              "positionId": 1,
              "positionName": "Stake President"
            },
            {
              "displayOrder": 3,
              "positionId": 2,
              "positionName": "Stake Presidency First Counselor"
            },
            {
              "displayOrder": 4,
              "positionId": 3,
              "positionName": "Stake Presidency Second Counselor"
            },
            {
              "displayOrder": 5,
              "positionId": 52,
              "positionName": "Stake Clerk"
            },
            {
              "displayOrder": 6,
              "positionId": 53,
              "positionName": "Stake Assistant Clerk"
            },
            {
              "displayOrder": 10,
              "positionId": 51,
              "positionName": "Stake Executive Secretary"
            },
            {
              "displayOrder": 11,
              "positionId": 491,
              "positionName": "Stake Assistant Executive Secretary"
            }
          ]
        },
        {
          "groupKey": 1189,
          "groupName": "High Council",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 12,
              "positionId": 94,
              "positionName": "Stake High Councilor"
            }
          ]
        },
        {
          "groupKey": 1190,
          "groupName": "Patriarch",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 14,
              "positionId": 13,
              "positionName": "Patriarch"
            }
          ]
        },
        {
          "groupKey": 1281,
          "groupName": "Auditing",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 57,
              "positionId": 1276,
              "positionName": "Stake Audit Committee Chairman"
            },
            {
              "displayOrder": 58,
              "positionId": 1836,
              "positionName": "Stake Audit Committee Member"
            },
            {
              "displayOrder": 59,
              "positionId": 691,
              "positionName": "Stake Auditor"
            }
          ]
        },
        {
          "groupKey": 1280,
          "groupName": "Activities and Sports",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 62,
              "positionId": 720,
              "positionName": "Stake Activities Committee Chairman"
            }
          ]
        },
        {
          "groupKey": 1300,
          "groupName": "Music",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 79,
              "positionId": 728,
              "positionName": "Stake Music Chairman"
            }
          ]
        },
        {
          "groupKey": 717,
          "groupName": "Stake Relief Society Presidency",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Advisor"
            }
          ]
        }
      ],
      "unitLeadership": [
        {
          "groupKey": 1186,
          "groupName": "Stake Presidency",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 1,
              "positionId": 1,
              "positionName": "Stake President"
            },
            {
              "displayOrder": 3,
              "positionId": 2,
              "positionName": "Stake Presidency First Counselor"
            },
            {
              "displayOrder": 4,
              "positionId": 3,
              "positionName": "Stake Presidency Second Counselor"
            },
            {
              "displayOrder": 5,
              "positionId": 52,
              "positionName": "Stake Clerk"
            },
            {
              "displayOrder": 6,
              "positionId": 53,
              "positionName": "Stake Assistant Clerk"
            },
            {
              "displayOrder": 10,
              "positionId": 51,
              "positionName": "Stake Executive Secretary"
            },
            {
              "displayOrder": 11,
              "positionId": 491,
              "positionName": "Stake Assistant Executive Secretary"
            }
          ],
          "unitName": stakeName
        },
        {
          "groupKey": 1189,
          "groupName": "High Council",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 12,
              "positionId": 94,
              "positionName": "Stake High Councilor"
            }
          ], 
          "unitName": stakeName
        },
        {
          "groupKey": 1190,
          "groupName": "Patriarch",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 14,
              "positionId": 13,
              "positionName": "Patriarch"
            }
          ],
          "unitName": stakeName
        },
        {
          "groupKey": 1281,
          "groupName": "Auditing",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 57,
              "positionId": 1276,
              "positionName": "Stake Audit Committee Chairman"
            },
            {
              "displayOrder": 58,
              "positionId": 1836,
              "positionName": "Stake Audit Committee Member"
            },
            {
              "displayOrder": 59,
              "positionId": 691,
              "positionName": "Stake Auditor"
            }
          ],
          "unitName": stakeName
        },
        {
          "groupKey": 1280,
          "groupName": "Activities and Sports",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 62,
              "positionId": 720,
              "positionName": "Stake Activities Committee Chairman"
            }
          ],
          "unitName": stakeName
        },
        {
          "groupKey": 1300,
          "groupName": "Music",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 79,
              "positionId": 728,
              "positionName": "Stake Music Chairman"
            }
          ],
          "unitName": stakeName
        },
        {
          "groupKey": 717,
          "groupName": "Stake Relief Society Presidency",
          "instance": 1,
          "positions": [
            {
              "displayOrder": 0,
              "positionId": 0,
              "positionName": "Advisor"
            }
          ],
          "unitName": stakeName
        }
      ]
    };
  }

  // Thoughts on fake users
  // http://randomuser.me/
  // Star Wars
  // Lord of the Rings
  // Star Trek
  // Harry Potter
  genderedNamesTpl = [
    "f:Hannah Abbott",
    "f:Bathsheba Babbling",
    "m:Ludo Bagman",
    "f:Bathilda Bagshot",
    "Katie Bell",
    "m:Cuthbert Binns",
    "m:Regulus Arcturus Black",
    "m:Sirius Black",
    "Amelia Bones",
    "Susan Bones",
    "Terry Boot",
    "Lavender Brown",
    "Millicent Bulstrode",
    "Charity Burbage",
    "m:Frank Bryce",
    "m:Alecto Carrow",
    "m:Amycus Carrow",
    "m:Reginald Cattermole",
    "Mary Cattermole",
    "Cho Chang",
    "Penelope Clearwater",
    "m:Michael Corner",
    //"m:Vincent Crabbe, Sr.",
    "m:Vincent Crabbe",
    "m:Colin Creevey",
    "m:Dennis Creevey",
    "m:Dirk Cresswell",
    //"Bartemius \"Barty\" Crouch, Sr.",
    //"Bartemius \"Barty\" Crouch, Jr.",
    "m:Bartemius Crouch",
    "Fleur Delacour",
    "Gabrielle Delacour",
    "Dilys Derwent",
    "m:Dedalus Diggle",
    "m:Amos Diggory",
    "m:Cedric Diggory",
    "Elphias Doge",
    "m:Antonin Dolohov",
    "m:Aberforth Dumbledore",
    "m:Albus Dumbledore",
    "Ariana Dumbledore",
    "Kendra Dumbledore",
    "m:Percival Dumbledore",
    "m:Dudley Dursley",
    //"Marjorie \"Marge\" Dursley",
    "Marjorie Dursley",
    "Petunia Dursley",
    //"Petunia Dursley (née Evans)",
    "m:Vernon Dursley",
    "Marietta Edgecombe",
    //"Everard",
    "Arabella Figg",
    "m:Argus Filch",
    "m:Justin Finch",
    "m:Seamus Finnigan",
    "m:Nicolas Flamel",
    "m:Mundungus Fletcher",
    "m:Filius Flitwick",
    "m:Cornelius Fudge",
    "m:Marvolo Gaunt",
    "Merope Gaunt",
    "m:Morfin Gaunt",
    "m:Anthony Goldstein",
    //"Goyle Sr",
    "m:Gregory Goyle",
    "Hermione Granger",
    //"Gregorovitch",
    "m:Fenrir Greyback",
    "m:Gellert Grindelwald",
    "Wilhelmina Grubbly",
    "m:Godric Gryffindor",
    "m:Rubeus Hagrid",
    "Rolanda Hooch",
    "Helga Hufflepuff",
    "Angelina Johnson",
    "m:Lee Jordan",
    "m:Igor Karkaroff",
    "m:Viktor Krum",
    "Bellatrix Lestrange",
    //"Bellatrix Lestrange (née Black)",
    "m:Rabastan Lestrange",
    "m:Rodolphus Lestrange",
    "m:Gilderoy Lockhart",
    "Alice Longbottom",
    "Augusta Longbottom",
    "m:Frank Longbottom",
    "m:Neville Longbottom",
    "f:Luna Lovegood",
    "m:Xenophilius Lovegood",
    "m:Remus Lupin",
    "m:Teddy Lupin",
    "m:Draco Malfoy",
    "m:Lucius Malfoy",
    //"Narcissa Malfoy (née Black)",
    "f:Narcissa Malfoy",
    "f:Madam Malkin",
    "Olympe Maxime",
    "m:Ernie Macmillan",
    "f:Minerva McGonagall",
    "m:Cormac McLaggen",
    //"Alastor \"Mad-Eye\" Moody",
    "m:Theodore Nott",
    "m:Bob Ogden",
    "m:Tiberius Ogden",
    "m:Garrick Ollivander",
    "Pansy Parkinson",
    "Padma Patil",
    "Parvati Patil",
    "m:Peter Pettigrew",
    "m:Antioch Peverell",
    "m:Cadmus Peverell",
    "m:Ignotus Peverell",
    "f:Irma Pince",
    "m:Sturgis Podmore",
    "f:Poppy Pomfrey",
    "m:Harry Potter",
    "m:James Potter",
    "f:Lily Potter",
    //"Lily Potter (née Evans)",
    "m:Quirinus Quirrell",
    "f:Helena Ravenclaw",
    //"Helena Ravenclaw/The Grey Lady",
    "f:Rowena Ravenclaw",
    "f:Mary Riddle",
    "m:Thomas Riddle",
    "m:Tom Riddle Sr",
    "m:Tom Marvolo Riddle",
    "m:Augustus Rookwood",
    //"Scabior",
    "m:Newt Scamander",
    "m:Rufus Scrimgeour",
    "m:Kingsley Shacklebolt",
    "m:Stan Shunpike",
    "Rita Skeeter",
    "m:Horace Slughorn",
    "m:Salazar Slytherin",
    "f:Hepzibah Smith",
    "m:Zacharias Smith",
    "m:Severus Snape",
    "Alicia Spinnet",
    "Pomona Sprout",
    "m:Pius Thicknesse",
    "m:Dean Thomas",
    "Andromeda Tonks",
    //"Andromeda Tonks (née Black)",
    "Nymphadora Tonks",
    "m:Ted Tonks",
    "Sybill Patricia Trelawney",
    "Dolores Jane Umbridge",
    "Romilda Vane",
    "Septima Vector",
    "m:Lord Voldemort",
    "m:Arthur Weasley",
    "m:Bill Weasley",
    "m:Charlie Weasley",
    "m:Fred Weasley",
    "m:George Weasley",
    "Ginny Weasley",
    "Molly Weasley",
    //"Molly Weasley (née Prewett)",
    "m:Percy Weasley",
    "m:Ron Weasley",
    "m:Oliver Wood",
    //"Yaxley",
    "Blaise Zabini"
  ];

  function getRandomWardMembers() {
    var genderedNames = shuffle(genderedNamesTpl.slice(0))
      , flatMemberRecords = []
      ;

    genderedNames.forEach(function (c, i) {
      var info = c.split(/:/)
        , names = (info[1] || info[0]).split(/ /g)
        , year = (365 * 24 * 60 * 60 * 1000)
        , years18 = 18 * year
        , years31 = 31 * year
        , gender // = /(a|e|y)$/.test(names[0]) && 'MALE' || 'FEMALE' // meh, better than nothing
        , sex
        , photoNum
        , photoUrl
        , photoUrl2
        ;

      if ('m' === info[0]) {
        gender = 'MALE';
        if (!guyPics.length) {
          genGuyPhotoNums();
        }
        photoNum = guyPics.pop();
      } else {
        gender = 'FEMALE';
        if (!guyPics.length) {
          genGalPhotoNums();
        }
        photoNum = galPics.pop();
      }

      sex = ('MALE' === gender) ? 'men' : 'women';

      if ('number' === typeof photoNum) {
        if (Math.random() > 0.3) {
          photoUrl = getCachedImage('http://api.randomuser.me/portraits/' + sex + '/' + photoNum + '.jpg');
        }
        if (Math.random() > 0.1) {
          photoUrl2 = getCachedImage('http://api.randomuser.me/portraits/' + sex + '/' + photoNum + '.jpg');
        }
      }

      c = flatMemberRecords[i] = {
        id: (names[0] + names[1]).toLowerCase()
      , first: names[0]
      , last: names[names.length - 1]
      , gender: gender 
      , birthday: Date.now() - (Math.floor(Math.random() * years31) + years18)
      , email: (Math.random() > 0.3) && (names[1] + '.' + names[0] + '@example.com') || undefined
      , email2: (Math.random() > 0.2) && (names[1] + '_' + names[0] + '@test.net') || undefined
      , phone: (Math.random() > 0.3) && ('1 (555) ' + String(Math.random()).replace(/.*(\d{7})/, '$1')) || undefined
      , phone2: (Math.random() > 0.2) && ('1 (555) ' + String(Math.random()).replace(/.*(\d{7})/, '$1')) || undefined
      , photoNum: photoNum
      , photoNum2: photoNum
      , photoUrl: photoUrl
      , photoUrl2: photoUrl2
      }; 

      if (!photoUrl && !photoUrl2) {
        if ('MALE' === gender) {
          guyPics.push(photoUrl);
        } else {
          galPics.push(photoUrl);
        }
      }
    });

    return flatMemberRecords;
  }

  function getCurrentUnits(userInfo) {
    return {
      "areaUnitNo": userInfo.areaUnitNo,
      "branch": false,
      "district": false,
      "mission": false,
      "newPhotoCount": -1,
      "stake": true,
      "stakeName": userInfo.stakeName,
      "stakeUnitNo": userInfo.stakeUnitNo,
      "userHasStakeAdminRights": false,
      "userHasWardAdminRights": false,
      "userHasWardCalling": false,
      "usersHomeWard": true,
      "ward": true,
      "wardName": userInfo.wardName,
      "wardUnitNo": userInfo.wardUnitNo
    };
  }

  function getAvailableUnits(areaInfo) {
    var stakes = []
      ;
      
    areaInfo.stakes.forEach(function (stakeInfo) {
      var wards = []
        ;

      stakeInfo.wards.forEach(function (wardInfo) {
        wards.push({
          "areaUnitNo": areaInfo.areaUnitNo,
          "branch": false,
          "district": false,
          "mission": false,
          "newPhotoCount": -1,
          "stake": true,
          "stakeName": stakeInfo.stakeName,
          "stakeUnitNo": stakeInfo.stakeUnitNo,
          "userHasStakeAdminRights": false,
          "userHasWardAdminRights": false,
          "userHasWardCalling": false,
          "usersHomeWard": true,
          "ward": true,
          "wardName": wardInfo.wardName,
          "wardUnitNo": wardInfo.wardUnitNo
        });
      });

      stakes.push({
        "district": false,
        "mission": false,
        "stake": true,
        "stakeName": stakeInfo.stakeName,
        "stakeUnitNo": stakeInfo.stakeUnitNo,
        "userHasStakeAdminRights": false,
        "wards": wards
      });
    });

    return stakes;
  }

  function mapFlatToMemberList(c) {
    return {
      "children": [],
      "coupleName": c.last + ", " + c.first,
      "headOfHouse": {
        "directoryName": c.last + ", " + c.first,
        "gender": c.gender,
        "individualId": c.id,
        "latinName": c.last,
        "latinNameDifferent": false,
        "preferredName": c.last + ", " + c.first,
        "surname": c.last
      },
      "headOfHouseIndividualId": c.id,
      "householdName": c.last,
      "isProfilePrivate": false,
      "spouse": {
        "directoryName": "",
        "gender": "",
        "individualId": -1,
        "latinName": "",
        "latinNameDifferent": true,
        "preferredName": "",
        "surname": ""
      }
    };
  }

  function mapFlatToPhotos(c) {
    return {
      "householdId": c.id,
      "householdName": c.last + ", " + c.first,
      "phoneNumber": c.phone,
      "photoUrl": c.photoUrl
    };
  }

  function mapFlatToHousehold(c, address, areaInfo, stakeInfo, wardInfo) {
    return {
      "canViewMapLink": true,
      "hasEditRights": true,
      "headOfHousehold": {
        "address": null,
        "addressLevel": null,
        "birthDateLevel": "WARD",
        "email": c.email,
        "emailLevel": "STAKE",
        "imageId": c.photoNum,
        "imageLevel": "STAKE",
        "individualId": c.id,
        "isAllPrivate": false,
        "mapLevel": null,
        "masterLevel": null,
        "name": c.last + ', ' + c.first,
        "phone": c.phone,
        "phoneLevel": "STAKE",
        "photoUrl": c.photoUrl
      },
      "householdInfo": {
        "address": {
          "addr1": address,
          "addr2": "Provo, Utah 84604",
          "addr3": "",
          "addr4": "",
          "addr5": "",
          "city": "Provo",
          "countryCode": 251,
          "countryIsoAlphaCode": "USA",
          "district": "",
          "groupId": 1670219,
          "latitude": 40.2599249,
          "locallyVerifiedCode": "",
          "longitude": -111.6556598,
          "postal": "84604",
          "state": "Utah",
          "stateCode": 44,
          "streetAddr1": address,
          "streetAddr2": ""
        },
        "addressLevel": "STAKE",
        "birthDateLevel": null,
        "email": c.email2,
        "emailLevel": "STAKE",
        "imageId": c.photoNum2,
        "imageLevel": "STAKE",
        "individualId": c.id,
        "isAllPrivate": false,
        "mapLevel": "STAKE",
        "masterLevel": "STAKE",
        "name": c.last,
        "phone": c.phone2,
        "phoneLevel": "STAKE",
        "photoUrl": c.photoUrl2
      },
      "id": 0,
      "inWard": true,
      "isEuMember": false,
      "otherHouseholdMembers": [],
      "spouse": null,
      "ward": {
        "areaUnitNo": areaInfo.areaUnitNo,
        "branch": false,
        "district": false,
        "mission": false,
        "stake": true,
        "stakeName": stakeInfo.stakeName,
        "stakeUnitNo": stakeInfo.stakeUnitNo,
        "ward": true,
        "wardName": wardInfo.wardName,
        "wardUnitNo": wardInfo.wardUnitNo
      }
    };
  }

  function getStakeLeadership(cache, groupLeaders, stakeInfo, group) {
    var leaders = groupLeaders[group.groupKey].slice(0)
      ;

    groupLeaders[group.groupKey].sortedPositions = groupLeaders[group.groupKey].positions;
    // I think this is just something that I did and I'm copying myself
    // otherwise the next link is obselete
    group.leaders = leaders;

    cache['/1.1/unit/stake-leadership-group-detail/'
      + stakeInfo.stakeUnitNo + '/'
      + group.groupKey + '/'
        // some provo wards have two relief societies
        // I think that's what the instance is for
      + group.instance
    ] = { 
      leaders: group.leaders
    , unitName: stakeInfo.stakeName
    };
    group.leaders.forEach(function (leader) {
      var gender = 'MALE'
        , person
        , i = 0
        ;

      if (/music|activities/i.test(group.groupName)) {
        gender = null;
      }
      if (/Relief/i.test(group.groupName)) {
        gender = 'FEMALE';
      }

      while (!person || (gender && (person.gender !== gender))) {
        person = stakeInfo.callable.pop();
        if (!person || i > 20) {
          stakeInfo.callable = stakeInfo.members.slice(0).sort(badrand);
        } else {
          stakeInfo.callable.unshift(person);
        }
        i += 1;
      }

      //leader.callingName;
      leader.displayName = person.first + ' ' + person.last;
      leader.email = person.email;
      leader.householdPhoneNumber = person.phone2;
      leader.individualId = person.id;
      leader.phoneNumber = person.phone;
      leader.photoUri = person.photoUrl;
      //leader.positionId;
    });
  }

  function getUniverse(username, areaInfo) {
    var cache = {}
      ;

    cache['/unit/current-user-units/'] = getAvailableUnits(areaInfo);
    cache['/unit/current-user-ward-stake/'] = getCurrentUnits(areaInfo);
    cache['/mem/current-user-id/'] = username; // backwards compat
    cache['/mem/current-user-info/'] = { individualId: username, newOption2Member: false };

    areaInfo.stakes.forEach(function (stakeInfo) {
      var groupLeaders = getStakeLeadershipGroup()
        ;

      stakeInfo.members = [];

      cache['/1.1/unit/stake-leadership-positions/' + stakeInfo.stakeUnitNo]
        = getStakeLeadershipPositions(stakeInfo.stakeName);

      // Getting the big list of members is important to do first
      stakeInfo.wards.forEach(function (wardInfo) {
        cache['/mem/wardDirectory/photos/' + wardInfo.wardUnitNo] = [];
        cache['/mem/member-list/' + wardInfo.wardUnitNo] = [];

        stakeInfo.members = stakeInfo.members.concat(wardInfo.members);
      });

      stakeInfo.callable = stakeInfo.members.slice(0).sort(function () { return 0.5 - Math.random(); });
      cache['/1.1/unit/stake-leadership-positions/' + stakeInfo.stakeUnitNo]
        .unitLeadership.forEach(getStakeLeadership.bind(null, cache, groupLeaders, stakeInfo));
        // getStakeLeadership(cache, groupLeaders, stakeInfo, group) {


      stakeInfo.wards.forEach(function (wardInfo) {
        // household
        wardInfo.members.forEach(function (c) {
          var address = (('MALE' === c.gender) ? 750 : 754) + " W 1700 N Apt " + (Math.floor(Math.random() * 30) + 1)
            ;

          //cache['/mem/householdProfile/' + c.id] = mapFlatToHousehold(c, address, areaInfo, stakeInfo, wardInfo);
          cache['/mem/householdProfile/' + c.id] = mapFlatToHousehold(c, address, areaInfo, stakeInfo, wardInfo);
        });

        //
        // photos
        //
        wardInfo.members.forEach(function (c) {
          cache['/mem/wardDirectory/photos/' + wardInfo.wardUnitNo].push(mapFlatToPhotos(c));
        });

        //
        // member-list
        //
        wardInfo.members.forEach(function (c) {
          cache['/mem/member-list/' + wardInfo.wardUnitNo].push(mapFlatToMemberList(c));
        });

        Object.keys(organizations).forEach(function (key) {
          var organizationName = key.toUpperCase()
            , members
            ;

          if ('elder' === key) {
            members = wardInfo.members.slice(0).filter(function (c) {
              return 'MALE' === c.gender;
            });
          } else if ('relief_society' === key) {
            members = wardInfo.members.slice(0).filter(function (c) {
              return 'FEMALE' === c.gender;
            });
          } else if ('adults' === key) {
            members = wardInfo.members;
          } else {
            // Typical Single's Ward... no teens, no kids, no babies
            members = [];
          }

          cache["/1.1/unit/roster/" + wardInfo.wardUnitNo + '/' + organizationName] = members.map(function (m) {
            return {
              "birthdate": null,
              "directoryName": m.last + ', ' + m.first,
              "email": m.email,
              "formattedName": m.last + ', ' + m.first, // "Mad-Eye" Moody
              "givenName1": m.first + ' ' + m.last,     // Alastor Moody
              "individualId": m.id,
              "memberId": "", // member id field exists, but is not actually populated
              "phone": m.phone,
              "photoUrl": m.photoUrl,
              "preferredName": m.last + ', ' + m.first,
              "surname": m.last
            };
          });
        });

        cache["/1.1/unit/ward-leadership-positions/" + wardInfo.wardUnitNo + "/true"] = getWardLeadershipPositions(wardInfo.wardName);

        cache["/1.1/unit/ward-leadership-positions/" + wardInfo.wardUnitNo + "/true"].wardLeadership.forEach(function (group) {
          // no idea why these seem to be duplicates of each other...
          group.sortedPositions = group.positions;
        });
        cache["/1.1/unit/ward-leadership-positions/" + wardInfo.wardUnitNo + "/true"].unitLeadership.forEach(function (group) {
          var leaders = group.leaders.slice(0)
            ;

          // I think this is just something that I did and I'm copying myself
          // otherwise the next link is obselete
          group.leaders = leaders;
          group.sortedPositions = group.positions;

          // actually for wards, even though it stays stake
          // this seems to imply that a wardUnitNo
          // will never be the same as a stakeUnitNo
          cache['/1.1/unit/stake-leadership-group-detail/'
            + wardInfo.wardUnitNo + '/'
            + group.groupKey + '/'
              // some provo wards have two relief societies
              // I think that's what the instance is for
            + group.instance
          ] = { 
            leaders: group.leaders
          , unitName: wardInfo.wardName
          };
          group.leaders.forEach(function (leader) {
            var gender = null
              , person
              , mre = /(bishop|elder|clerk|exec|dad|home teach|patriarch|audit|high)/i
              , fre = /(\brs\b|relief|mom|sister|visit.*?teach)/i
              //, nre = /music|activities|adult/i
              , i = 0
              ;

            if (fre.test(group.groupName) || fre.test(leader.callingName)) {
              gender = 'FEMALE';
            } else if (mre.test(group.groupName) || mre.test(leader.callingName)) {
              gender = 'MALE';
            }

            while (!person || (gender && person.gender !== gender)) {
              person = stakeInfo.callable.pop();
              if (!person || i > 20) {
                stakeInfo.callable = stakeInfo.members.slice(0).sort(badrand);
              } else {
                stakeInfo.callable.unshift(person);
              }
              i += 1;
            }

            //leader.callingName;
            leader.displayName = person.first + ' ' + person.last;
            leader.email = person.email;
            leader.householdPhoneNumber = person.phone2;
            leader.individualId = person.id;
            leader.phoneNumber = person.phone;
            leader.photoUri = person.photoUrl;
            //leader.positionId;
          });
        });
      });
    });

    return cache;
  }

  defaults = { name: 'albusdumbledore' };
  defaults.units = {
    areaUnitNo: "hogwartsmagicrealm"
    // 'bettendorf' being one of the houses is an inside joke with my sister
  , stakeUnitNo: "bettendorf"
  , stakeName: "Provo YSA 0th Bettendorf Stake"
  , wardUnitNo: "gryffindor"
  , wardName: "Provo YSA 0th Griffindor Ward"
  , stakes: [
      {
        stakeUnitNo: "bettendorf"
      , stakeName: "Provo YSA 0th Bettendorf Stake"
      , wards: [
          { wardUnitNo: "gryffindor"
          , wardName: "Provo YSA 0th Griffindor Ward"
          , members: getRandomWardMembers(/*num*/)
          }
        ]
      }
    ]
  };

  // TODO simulate user log out
  Hogwarts.makeRequest = function (cb, url) {
    if (!singleton) {
      singleton = Hogwarts.create(defaults.name, defaults.units);
    }
    singleton.makeRequest(cb, url);
  };

  Hogwarts.create = function (name, units) {
    var myUniverse = getUniverse(name, units)
      ;

    return {
      makeRequest: function (cb, url) {
        url = url.replace('https://www.lds.org/directory/services/ludrs', '');
        cb(null, myUniverse[url]);
      }
    };
  };

  exports.Hogwarts = Hogwarts.Hogwarts = Hogwarts;

  if ('undefined' !== typeof module) {
    module.exports = exports.Hogwarts;
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
