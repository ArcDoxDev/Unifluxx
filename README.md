# Unifluxx

Make requests to [NBS BIM toolkit api](https://toolkit.thenbs.com/articles/for-software-developers/) from [flux.io](https://flux.io/) cell values

### Prerequisites

[Node](https://nodejs.org), version >= 7.5

Flux app key and secret. See https://flux.io/developer/apps/

NBS ClientID and ClientSecret. Contact info@thenbs.com for API key.


## Getting Started

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

7. Select a project, source, target and error keys. The app will listen for changes in the source key (takes an array of uniclass code strings)

8. Click 'save', and visit flux project.

9. Update value of source key (e.g data/sampleSource.json) and wait for server to finish fetching from NBS (NBS API currently has rate limit of one request per second so 3 uniclass codes = 3 * 5(ForEach Level of Information 2-6) = 15 requests = 15 seconds.)

10. See target key for reponse from NBS API (e.g data/sampleOutput.json) and the Error key for details on whihc codes failed to fetch from the NBS toolkit API.

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

## Contributing

We welcome any contributions and are here to help for any developers looking to get started.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Authors

* **Javier Vizoso** - *Flux sample app* - [Javiz](https://github.com/javiz)
* **John Egan** - *Requests to NBS, Error handling* - [bigdoods](https://github.com/bigdoods)

## Acknowledgments

* Hat tip to Alan Smith for NBS contributions
