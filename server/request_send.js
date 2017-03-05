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
        // console.log("request sent for :" + code + " loi :" + loi)
        if (err) {
          console.log('Cant reach NBS currently :', err)
          resolve(new WrapE(err.message, code, loi));
        } else {
          if (res.statusCode === 404){
            resolve(new WrapE("Not found in NBS toolkit API", code, loi));
          }
        //  setTimeout(() => {
            try {
              var data = JSON.parse(body)
            } catch (e) {
              resolve(new WrapE(e.message, code, loi));
              return
            }
            resolve(data)
        //  }, 000)
        }
      });
    })
  })
}

class WrapE extends Error {
  constructor(message, code, loi){
    super()
    this.message = message
    this.code = code
    this.loi = loi
  }
}
