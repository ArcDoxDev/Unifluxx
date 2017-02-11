var querystring = require('querystring');
var request = require('request');
var access = require('./access_token');

module.exports = (code, loi) => {
  return access().then((token) => {
    return new Promise((resolve, reject) => {
      var uri = 'https://toolkit-api.thenbs.com/definitions/loi/' + code + '/' + loi
      request({
        headers: {
          'Authorization': 'bearer '+ token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: uri,
        method: 'GET'
      }, function (err, res, body) {
        if (err) {
          reject(err);
        } else {
          setTimeout(() => {
            try {
              var data = JSON.parse(body)
            } catch (e) {
              reject(e)
              return
            }
            resolve(data)
          }, 1000)
        }
      });
    })
  })
}
