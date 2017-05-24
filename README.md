[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# Unifluxx

App that makes requests to [NBS BIM toolkit api](https://toolkit.thenbs.com/articles/for-software-developers/) from [flux.io](https://flux.io/) cell values.

This app uses the following endpoints from the NBS BIM toolkit API:

 - [GET-definitions-loi-notation-level](https://toolkit-api.thenbs.com/routes/GET-definitions-loi-notation-level)

 - [GET-definitions-uniclass2015-notation-depth](https://toolkit-api.thenbs.com/routes/GET-definitions-uniclass2015-notation-depth)


### Prerequisites

[Node](https://nodejs.org), version >= 7.5

Flux app key and secret. See https://flux.io/developer/apps/

NBS ClientID and ClientSecret. Contact info@thenbs.com for API key.


## Getting Started

If you are an end-user of the application please go to step #7.

1. Clone this repository to your local system and change into this directory

2. Insert Keys to sample-config.js in this directory and rename to config.js (see Prerequisites section)

  ```
  $ mv sample-config.js config.js
  ```

3. Install node modules

  ```
  $ npm install
  ```

4. Start the server

  ```
  $ npm start
  ```

5. Open your browser to http://localhost:3000 .

6. Click on the login button and authorize the application to access your flux projects.

7. Select keys as follows:

 - Select Flux Project => the flux project that you would like to select keys from

 -  Uniclass Code Source => Key with uniclass codes to fetch from NBS

 - LOI data from NBS target => The key that the app will return LOI data from NBS

 -  Starting Notation Source => Key with specified starting notation to fetch from NBS

 -  Classification tree target => The target key for classification tree response from NBS

Please See NBS BIM toolkit endpoints for further details.

8. Click 'save', and visit flux project.

9. The app will listen for changes in Source keys and will trigger updates to target keys when values modified. Update soure keys and wait for target keys to populate. See [sampleData](/sampleData/README.md) for example data for keys. 

## Deployment

Use docker:

```
 $ docker run -d \
    -e FLUX_ID=xxx \
    -e FLUX_SECRET=xxx \
    -e NBS_ID=xxx \
    -e NBS_SECRET=xxx \
    -p 3000:3000 \
    bigdoods/unifluxx
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Authors

[jenca](http://jenca.org/)

## Acknowledgments

* Hat tip to [Javier Vizoso](https://github.com/javiz) from flux for help getting started
