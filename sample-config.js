module.exports = {
  env : 'development',
  url: process.env.URL || "http://localhost:3000", //enter flux auth callback url here.
  port: 3000,
  flux: {
    url: 'https://flux.io',
    id: process.env.FLUX_ID || "", //enter flux.id here
    secret: process.env.FLUX_SECRET || "", //enter flux.secret here
  },
  session: {
    secret: 'topSecret'
  },
  NBS_clientId: process.env.NBS_ID || "", //enter client.id from NBS here
  NBS_clientSecret: process.env.NBS_SECRET || "" //enter client.secret from NBS here
}
