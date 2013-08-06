(function () {
  "use strict";

  // Poor Man's Join
  var Join = {
    create: function () {
      var things = []
        , len = Infinity
        , fn
        , complete = 0
        ;

      return {
          when: function (_fn) {
            fn = _fn;
            len = things.length;
            if (complete === len) {
              fn.apply(null, things);
            }
          }
        , add: function () {
            var i = things.length
              ;

            things[things.length] = null;

            return function () {
              var args = [].slice.call(arguments)
                ;

              complete += 1;
              things[i] = args;
              if (fn && (complete === len)) {
                fn.apply(null, things);
              }
            };
          }
      };
    }
  };

  module.exports = Join;
}());
