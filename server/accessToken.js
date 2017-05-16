const querystring = require('querystring')
const request = require('request')
const config = require('../config')

const authCode = 'Basic ' + Buffer.from(config.NBS_clientId + ':' + config.NBS_clientSecret).toString('base64')
const formData = querystring.stringify({ scope: 'bimtoolkitapi', grant_type: 'client_credentials' })

let tokens

module.exports = function getTokens () {
  if (tokens) return Promise.resolve(tokens)
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
        if (err) reject(err)
        else {
          tokens = JSON.parse(body).access_token
          resolve(tokens)
        }
      }
      )
    })
  }
}
