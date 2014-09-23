/*jshint -W054 */
;(function (exports) {
  'use strict';

  var https = require('https')
    , LdsOrgNode = { init: function (LdsDir, ldsDirP, opts) {

    var PromiseA = require('bluebird').Promise
      , request = PromiseA.promisifyAll(require('request'))
      , requestAsync = PromiseA.promisify(require('request'))
      ;

    ldsDirP._rawLogin = function (auth) {
      var me = this
        ;
      me.__jar = request.jar();
      me.__pool = { maxSockets: 1000 };
      return request.postAsync(
        'https://signin.lds.org/login.html', {
        jar: me.__jar
      , pool: me.__pool
      , form: {
          username: auth.username
        , password: auth.password
        }
      }).spread(function (res, body) {
        if (/SSO/.test(body)) {
          throw new Error('Failed to authenticate. Check username / password');
        }

        if (/Access Denied/.test(body)) {
          throw new Error("You are signed in with a 'friend' account, not as a member of the church. "
            + "Use the username 'dumbledore' and password 'secret' "
            + "if you are a non-member developer working on a project and need access.");
        }

        return { username: auth.username, password: auth.password };
      });
    };

    ldsDirP._trustedLogin = function (auth) {
      var me = this
        , JarSON = require('jarson')
        , url = opts.proxy.url + '/api/login'
        ;

      if (auth.token) {
        url = opts.proxy.url + '/api/passthru';
      }

      return requestAsync({
        url: url
      , method: 'POST'
        // this will use EITHER user/pass OR token
      , json: { username: auth.username, password: auth.password, token: auth.token }
      , agent: new https.Agent({
          host: opts.proxy.hostname
        , port: opts.proxy.port
        , path: '/'
        , ca: opts.proxy.ca
        , key: opts.proxy.key
        , cert: opts.proxy.cert
        })
      }).spread(function (resp, body) {
        console.log('Proxy Login');
        console.log(body);

        if (body.error) {
          throw body.error;
        }

        me.__jar = JarSON.fromJSON(body.jar);
        me.__token = body.token;

        return { token: body.token, jar: me.__jar };
      });
    };

    ldsDirP._signin = function (auth) {
      var me = this
        ;

      me.__agent = new https.Agent({
        maxSockets: 100
      });

      if (!opts.proxy) {
        return me._rawLogin(auth);
      }

      // Exchange password for encrypted token
      // rather than keeping the password around in memory
      return me._trustedLogin(auth);
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
