const config = require('../config')
const express = require('express')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const cookies = require('cookie-parser')
const crypto = require('crypto')
const url = require('url')
const Queue = require('./queue')
const FluxSdk = require('flux-sdk-node')
const sdk = new FluxSdk(config.flux.id, { clientSecret: config.flux.secret, fluxUrl: config.flux.url });
let queue

function generateRandomValue() {
  return crypto.randomBytes(24).toString('hex');
}

const app = express()
app.set('port', config.port || 1337)
app.set('views', path.join(__dirname, 'views'))
app.use(cookies(config.session.secret))
app.use(bodyParser.json())
app.use(session({ maxAge: 1000 * 60 * 60 * 24, resave: true, saveUninitialized: true, secret: config.session.secret }))
app.use(express.static('public'))

app.get('/login', (req, res, next) => { //setting a route. run a function and pass it two objects. "Whenever you click on the login button, it redirects you to the /login route handler (line 26) which will get an authorization url from the SDK and redirect you to it."
  const redirectUri = url.resolve(config.url, 'login'); //new node api
  if (!req.query.code) { //if no code param sent, run this block of code. unused feature?
    req.session.state = generateRandomValue();
    req.session.nonce = generateRandomValue();
    const authorizeUrl = sdk.getAuthorizeUrl(req.session.state, req.session.nonce, { redirectUri });
    res.redirect(authorizeUrl);
  } else {
    return sdk.exchangeCredentials(req.session.state, req.session.nonce, req.query, { redirectUri })
      .then((credentials) => {
        req.session.state = null;
        req.session.nonce = null;
        let t = credentials.idToken.payload
        let user = {
          id: t.flux_id_hash,
          name: t.given_name,
          last: t.family_name,
          email: t.email,
          credentials: credentials,
          stale: false
        }
        req.session.user = user;
        req.session.credentials = credentials
        req.session.save(function (err) {
          if (err) return next(err)
          res.redirect('/');
        })
      }).catch((err) => {
        console.log('err', err)
        next()
      })
  }
});

app.checkUser = (req, res, next) => {
  if (!req.session.user) return res.status(401).send('Didnt send token');
  return next()
}

app.get('/user', (req, res, next) => {
  return res.json({success: req.session.credentials !=  null})
})

app.use('/api', app.checkUser)

app.use('/api', (req, res, next) => {
  if (req.session.credentials) {
    req.userInfo = req.session.user
    req.user = sdk.getUser(req.session.credentials);
  } else {
    res.status(401).send('Need to login')
  }
  return next();
});

app.post('/api/request', (req, res, next) => {
  queue = new Queue({sdk: sdk, user: req.user, project: req.body.project, source: req.body.source, dest: req.body.dest, credentials: req.session.credentials})
  res.status(200).json({success: true})
})

app.get('/api/projects', (req, res, next) => {
  req.user.listProjects()
    .then(response => res.json(response.entities))
    .catch(next);
});


function getDataTable(user, projectId) {
      return user.getProject(projectId).getDataTable()
}

function getCells(user, projectId) {
  return getDataTable(user, projectId).listCells()
}

app.get('/api/keys', (req, res, next) => {
  getCells(req.user, req.query.projectId)
    .then(response => res.json(response.entities))
    .catch(next);
});

app.listen(config.port)

console.log('Server listening on port 3000')
