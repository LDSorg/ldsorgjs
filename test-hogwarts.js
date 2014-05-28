'use strict';

var fs = require('fs')
  , hogwarts = require('./hogwarts').Hogwarts.create()
  ;

fs.writeFile('./hogwarts.cache', JSON.stringify(hogwarts.cache, null, '  '), function () {
  console.log('wrote ./hogwarts.cache');
});
