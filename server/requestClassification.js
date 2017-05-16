var request = require('request')
var access = require('./accessToken')

module.exports = (notation, depth) => {
  return access().then((token) => {
    return new Promise((resolve, reject) => {
      var uri = 'https://toolkit-api.thenbs.com/definitions/uniclass2015/' + notation + '/' + depth
      request({
        headers: {
          'Authorization': 'bearer ' + token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: uri,
        method: 'GET'
      }, function (err, res, body) {
        if (err) {
          reject(err)
        } else {
          let bodyObject
          try {
            bodyObject = JSON.parse(body)
          } catch (error) {
            reject(error)
            return
          }
          resolve(bodyObject)
        }
      })
    })
  })
}
