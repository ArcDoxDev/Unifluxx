var request = require('request')
var access = require('./accessToken')

module.exports = (code, loi) => {
  return access().then((token) => {
    return new Promise((resolve, reject) => {
      var uri = 'https://toolkit-api.thenbs.com/definitions/loi/' + code + '/' + loi
      request({
        headers: {
          'Authorization': 'bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: uri,
        method: 'GET'
      }, function (err, res, body) {
        if (err) {
          err.type = 'cant reach nbs'
          reject(err)
        } else {
          if (res.statusCode === 404) {
            resolve({ error: 404, Notation: code, Loi: loi })
          }
          try {
            var data = JSON.parse(body)
          } catch (err) {
            err.type = 'bad json response from nbs'
            reject(err)
            return
          }
          resolve(data)
        }
      })
    })
  })
}
