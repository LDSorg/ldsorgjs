/*jshint -W054 */
;(function (exports) {
  'use strict';

  var LdsOrgNode = { init: function (LdsDir, ldsDirP) {

    var PromiseA = require('bluebird').Promise
      , request = PromiseA.promisifyAll(require('request'))
      ;

    ldsDirP._signin = function (cb, auth) {
      var me = this
        ;

      me.__jar = request.jar();
      me.__pool = { maxSockets: 1000 };
      request.post(
        'https://signin.lds.org/login.html', {
        jar: me.__jar
      , pool: me.__pool
      , form: {
          username: auth.username
        , password: auth.password
        }
      }, function (err, res, body) {
        if (err) {
          cb(err);
          return;
        }

        if (/SSO/.test(body)) {
          cb(new Error('Failed to authenticate. Check username / password'));
          return;
        }
        if (/Access Denied/.test(body)) {
          cb(new Error("You are signed in with a 'friend' account, not as a member of the church. "
            + "Use the username 'dumbledore' and password 'secret' "
            + "if you are a non-member developer working on a project and need access."));
          return;
        }

        cb(null);
      });
    };
    ldsDirP._signout = function () {
      var me = this
        , url = 'https://www.lds.org/signinout/?lang=eng&signmeout'
        ;

      return new PromiseA(function (resolve) {
        // TODO is there any real purpose in hitting the url?
        // doesn't it just tell the browser to delete the cookies?
        request.get(url, { jar: me.__jar }, function (/*err, res, body*/) {
          me.__jar = null;
          resolve();
        });
      });
    };

    ldsDirP._makeRequest = function (url) {
      var me = this
        ;

      return new PromiseA(function (resolve, reject) {
        request.get(url, {
          jar: me.__jar
        , pool: me.__pool
        }, function (err, res, body) {
          var data
            ;

          if (err) {
            return reject(err);
          }

          try {
            data = JSON.parse(body);
          } catch(e) {
            console.log(url);
            console.error(e);
            console.log('typeof body:', typeof body);
            console.log('JSON.stringify(body)');
            console.log(JSON.stringify(String(body).substr(0, 100)));
            err = e;
            return reject(err);
          }

          resolve(data);
        });
      });
    };

    ldsDirP._getImageData = function (next, imgSrc) {
      var me = this
        ;

      if (!imgSrc) {
        next(new Error('no imgSrc'));
        return;
      }

      // encoding is utf8 by default
      request.get(
        imgSrc
      , { 
          jar: me.__jar
        , pool: me.__pool
        , encoding: null
        }
      , function (err, res, body) {
          // TODO inspect res.status or res.statusCode or whatever
          if (body && body.length < 1024) {
            next(new Error("404"));
            return;
          }

          next(err, body && ('data:image/jpeg;base64,' + body.toString('base64')) || "");
        }
      );
    };
  }};

  module.exports = exports = LdsOrgNode.LdsOrgNode = LdsOrgNode;
}('undefined' !== typeof exports && exports || new Function('return this')()));
