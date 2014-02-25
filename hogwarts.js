/*jshint -W054 */
;(function (exports) {
  'use strict';

  var Hogwarts = {}
    , characters
    , cache = {}
    , things = {}
    , groupLeaders
    , stakeCallable = []
    ;

  things.areaUnitNo = "hogwartsmagicrealm";
  // 'bettendorf' being one of the houses is an inside joke with my sister
  things.stakeUnitNo = "bettendorf";
  things.stakeName = "Provo YSA 0th Bettendorf Stake";
  things.wardUnitNo = "gryffindor";
  things.wardName = "Provo YSA 0th Griffindor Ward";

  // Star Wars
  // Lord of the Rings
  // Harry Potter
  characters = [
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

  // men 0-79
  // pics 0-59
  characters.forEach(function (c, i) {
    var info = c.split(/:/)
      , names = (info[1] || info[0]).split(/ /g)
      , year = (365 * 24 * 60 * 60 * 1000)
      , years18 = 18 * year
      , years31 = 31 * year
      , gender // = /(a|e|y)$/.test(names[0]) && 'MALE' || 'FEMALE' // meh, better than nothing
      , num = ('MALE' === gender) ? 80: 60
      , sex = ('MALE' === gender) ? 'men' : 'women'
      , photoNum = (Math.random() > 0.4) && Math.floor(Math.random() * 4800) || undefined
      , photoUrl
      , photoUrl2
      ;

    if ('m' === info[0]) {
      gender = 'MALE';
    } else {
      gender = 'FEMALE';
    }

    if ('number' === typeof photoNum) {
      photoUrl = 'http://api.randomuser.me/0.3.1/portraits/' + sex + '/' + (photoNum % num) + '.jpg';
      if (Math.random() > 0.2) {
        photoUrl2 = 'http://api.randomuser.me/0.3.1/portraits/' + sex + '/' + (photoNum % num) + '.jpg';
      }
    }

    characters[i] = {
      id: (names[0] + names[1]).toLowerCase()
    , first: names[0]
    , last: names[names.length - 1]
    , gender: gender 
    , birthday: Date.now() - (Math.floor(Math.random() * years31) + years18)
    , email: (Math.random() > 0.4) && (names[1] + '.' + names[0] + '@example.com') || undefined
    , email2: (Math.random() > 0.6) && (names[1] + '_' + names[0] + '@test.net') || undefined
    , phone: (Math.random() > 0.4) && ('1 (555) ' + String(Math.random()).replace(/.*(\d{7})/, '$1')) || undefined
    , phone2: (Math.random() > 0.6) && ('1 (555) ' + String(Math.random()).replace(/.*(\d{7})/, '$1')) || undefined
    , photoNum: photoNum
    , photoNum2: photoNum
    , photoUrl: photoUrl
    , photoUrl2: photoUrl2
    }; 
  });

  cache = {
    '/unit/current-user-units/': [
      {
        "district": false,
        "mission": false,
        "stake": true,
        "stakeName": things.stakeName,
        "stakeUnitNo": things.stakeUnitNo,
        "userHasStakeAdminRights": false,
        "wards": [
          {
            "areaUnitNo": things.areaUnitNo,
            "branch": false,
            "district": false,
            "mission": false,
            "newPhotoCount": -1,
            "stake": true,
            "stakeName": things.stakeName,
            "stakeUnitNo": things.stakeUnitNo,
            "userHasStakeAdminRights": false,
            "userHasWardAdminRights": false,
            "userHasWardCalling": false,
            "usersHomeWard": true,
            "ward": true,
            "wardName": things.wardName,
            "wardUnitNo": things.wardUnitNo
          }
        ]
      }
    ]
  , '/unit/current-user-ward-stake/': {
      "areaUnitNo": things.areaUnitNo,
      "branch": false,
      "district": false,
      "mission": false,
      "newPhotoCount": -1,
      "stake": true,
      "stakeName": things.stakeName,
      "stakeUnitNo": things.stakeUnitNo,
      "userHasStakeAdminRights": false,
      "userHasWardAdminRights": false,
      "userHasWardCalling": false,
      "usersHomeWard": true,
      "ward": true,
      "wardName": things.wardName,
      "wardUnitNo": things.wardUnitNo
    }
  , '/mem/current-user-id/': 'albusdumbledore'
  };
  cache['/mem/wardDirectory/photos/' + things.wardUnitNo] = [];
  cache['/mem/member-list/' + things.wardUnitNo] = [];
  cache['/1.1/unit/stake-leadership-positions/' + things.stakeUnitNo] = {
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
        ],
        "sortedPositions": [
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
        ],
        "sortedPositions": [
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
        ],
        "sortedPositions": [
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
        ],
        "sortedPositions": [
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
        ],
        "sortedPositions": [
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
        ],
        "sortedPositions": [
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
        ],
        "sortedPositions": [
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
        "sortedPositions": [
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
        "unitName": things.stakeName
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
        "sortedPositions": [
          {
            "displayOrder": 12,
            "positionId": 94,
            "positionName": "Stake High Councilor"
          }
        ], 
        "unitName": things.stakeName
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
        "sortedPositions": [
          {
            "displayOrder": 14,
            "positionId": 13,
            "positionName": "Patriarch"
          }
        ],
        "unitName": things.stakeName
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
        "sortedPositions": [
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
        "unitName": things.stakeName
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
        "sortedPositions": [
          {
            "displayOrder": 62,
            "positionId": 720,
            "positionName": "Stake Activities Committee Chairman"
          }
        ],
        "unitName": things.stakeName
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
        "sortedPositions": [
          {
            "displayOrder": 79,
            "positionId": 728,
            "positionName": "Stake Music Chairman"
          }
        ],
        "unitName": things.stakeName
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
        "sortedPositions": [
          {
            "displayOrder": 0,
            "positionId": 0,
            "positionName": "Advisor"
          }
        ],
        "unitName": things.stakeName
      }
    ]
  };

  // attach to key "leaders"
  groupLeaders = {
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

  stakeCallable = characters.slice(0).sort(function () { return 0.5 - Math.random(); });
  cache['/1.1/unit/stake-leadership-positions/' + things.stakeUnitNo].unitLeadership.forEach(function (group) {
    var leaders = groupLeaders[group.groupKey].slice(0)
      ;

    group.leaders = leaders;
    group.leaders.forEach(function (leader) {
      var gender = 'MALE'
        , person
        ;

      if (/music|activities/i.test(group.groupName)) {
        gender = null;
      }
      if (/Relief/i.test(group.groupName)) {
        gender = 'FEMALE';
      }

      person = stakeCallable.pop();
      while (gender && person.gender !== gender) {
        stakeCallable.unshift(person);
        person = stakeCallable.pop();
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

  // household
  characters.forEach(function (c) {
    var address = (('MALE' === c.gender) ? 750 : 754) + " W 1700 N Apt " + (Math.floor(Math.random() * 30) + 1)
      ;

    cache['/mem/householdProfile/' + c.id] = {
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
        "name": "Doe, John",
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
        "areaUnitNo": things.areaUnitNo,
        "branch": false,
        "district": false,
        "mission": false,
        "stake": true,
        "stakeName": things.stakeName,
        "stakeUnitNo": things.stakeUnitNo,
        "ward": true,
        "wardName": things.wardName,
        "wardUnitNo": things.wardUnotNo
      }
    };
  });

  //
  // photos
  //
  characters.forEach(function (c) {
    cache['/mem/wardDirectory/photos/' + things.wardUnitNo].push(
      {
        "householdId": c.id,
        "householdName": c.last + ", " + c.first,
        "phoneNumber": c.phone,
        "photoUrl": c.photoUrl
      }
    );
  });

  //
  // member-list
  //
  characters.forEach(function (c) {
    cache['/mem/member-list/' + things.wardUnitNo].push(
      {
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
      }
    );
  });

  // TODO simulate user log out
  Hogwarts.makeRequest = function (cb, url) {
    url = url.replace('https://www.lds.org/directory/services/ludrs', '');
    console.log('[URL]', url);
    console.log(cache[url]);
    cb(null, cache[url]);
  };

  // http://randomuser.me/
/*
ldsorg.js:  LdsOrg._urls.wardLeadershipPositions = "/1.1/unit/ward-leadership-positions/{{ward_unit_no}}/true";
ldsorg.js:  LdsOrg._urls.wardLeadershipGroup = "/1.1/unit/stake-leadership-group-detail/{{ward_unit_no}}/{{group_key}}/{{instance}}";
ldsorg.js:  LdsOrg._urls.wardOrganization = "/1.1/unit/roster/{{ward_unit_no}}/{{organization}}";

ldsorg.js:  LdsOrg._urls.stakeLeadershipPositions = "/1.1/unit/stake-leadership-positions/{{stake_unit_no}}";
ldsorg.js:  LdsOrg._urls.stakeLeadershipGroup = "/1.1/unit/stake-leadership-group-detail/{{stake_unit_no}}/{{group_key}}/{{instance}}";
*/

  exports.Hogwarts = Hogwarts.Hogwarts = Hogwarts;

  if ('undefined' !== typeof module) {
    module.exports = exports.Hogwarts;
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
