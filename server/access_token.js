var querystring = require('querystring');
var request = require('request');
var config =  require('../config');

var tokens;

var authCode = "Basic " + new Buffer(config.NBS_clientId + ":" + config.NBS_clientSecret).toString('base64');

var formData = querystring.stringify({ scope: 'bimtoolkitapi', grant_type: 'client_credentials' });

module.exports = function getTokens() {
  if (tokens) return Promise.resolve(tokens);
  else {
    return new Promise((resolve, reject) => {
      request({
        headers: {
          'Authorization': authCode,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: 'https://identity.thenbs.com/core/connect/token',
        body: formData,
        method: 'POST'
        }, function (err, res, body) {
          if(err) reject(err);
          else {
            tokens = JSON.parse(body).access_token;
            resolve(tokens);
          }
        }
      );
    });
  }
}
