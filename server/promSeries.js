module.exports = function promSeries (promises) {  // () => reqSend (code, loi)

  var resultsArray = []

  return promises.reduce((chain, promise) =>
    chain.then( result =>
      promise().then(result =>
        resultsArray.push(result)
      )
    ),
    Promise.resolve()
  ).then( () => {
      return resultsArray
    }
  )
}
