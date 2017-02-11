module.exports = {
  env : 'development',
  url: "", //enter flux auth callback url here. http://localhost:3000 for local development.
  port: 3000,
  flux: {
    url: 'https://flux.io',
    id: "", //enter flux.id here
    secret: "", //enter flux.secret here
  },
  session: {
    secret: 'topSecret'
  },
  NBS_clientId: "", //enter client.id from NBS here
  NBS_clientSecret: "" //enter client.secret from NBS here
}
