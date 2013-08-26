// Part of FuturesJS. See https://github.com/FuturesJS/forEachAsync
/*jshint -W054 */
(function (exports) {
  "use strict";

  function forEachAsync(arr, fn, thisArg) {
    var done
      , index = -1
      ;

    function next(BREAK) {
      if (0 === arr.length || BREAK === forEachAsync.BREAK) {
        if ('undefined' !== typeof thisArg) {
          done.call(thisArg);
        } else {
          done(thisArg);
        }
        return;
      }

      index += 1;
      if ('undefined' !== typeof thisArg) {
        fn.call(thisArg, next, arr.shift(), index, arr);
      } else {
        fn(next, arr.shift(), index, arr);
      }
    }

    setTimeout(next, 4);

    return {
      then: function (_done) {
        done = _done;
      }
    };
  }
  forEachAsync.BREAK = {};

  exports = forEachAsync.forEachAsync = forEachAsync;
  if ('undefined' !== module) {
    module.exports = forEachAsync;
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
