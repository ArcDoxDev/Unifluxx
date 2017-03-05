const request = require('request')
const config = require('../config')
const reqSend = require('./request_send')
const promSeries = require('./promSeries')
const cleanData = require('./cleanData')
const util = require('util')

class Q {

  constructor({sdk, credentials, project, source, dest, error}) {
    this.tables = {}
    this.project = project
    this.source = source
    this.dest = dest
    this.error = error
    this.sourceId = false
    this.destId = false
    this.errorId = false
    this.credentials = credentials
    this.debounced = this.debounce(this.onRequest.bind(this), 500)
    let dt = new sdk.Project(this.credentials, this.project).getDataTable()
    this.dt = { table: dt, handlers: {}, websocketOpen: false }
    this.createWebsocket()
    this.initCells()
  }

  debounce(func, wait, immediate) {
    var timeout
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  initCells() {
    this.dt.table.listCells().then((cells) => {
      cells.entities.forEach((cell) => {
        if (cell.label === this.source) this.sourceId = cell.id
        if (cell.label === this.dest) this.destId = cell.id
        if (cell.label === this.error) this.errorId = cell.id
      })

      // tbc add that user can type name of cell for target and error keys to documentation

      // tbc add promise to initcells function because of race condition

      if (!this.destId) {
        this.dt.table.createCell(this.dest, {description: this.dest, value: "No data yet"})
          .then((cell) => this.destId = cell.id)
      }
      if (!this.errorId) {
        this.dt.table.createCell(this.error, {description: this.error, value: "No errors yet - thank god!"})
          .then((cell) => this.errorId = cell.id)
      }
    })
  }

  onRequest(msg) {
    if (msg.type === 'CELL_MODIFIED' && msg.body.label === this.source) {
      this.dt.table.getCell(msg.body.id).fetch()
        .then( (cell) => {
          if (cell.value) {
            let val = cell.value

            if (!Array.isArray(val)) {
                this.dt.table.getCell(this.errorId).update({value: "Please enter valid JSON Array"})
                return
            }

            var codePromises = val.map( (code) => {
              var lois = [2,3,4,5,6]
              var promises = lois.map( (loi) => () => reqSend (code, loi) )

              //  promises = () => reqSend (code, loi),() => reqSend (code, loi),() => reqSend (code, loi),() => reqSend (code, loi),() => reqSend (code, loi)

              return () => promSeries(promises)
            } )

            var chain = promSeries(codePromises)

            chain.then( (result_data) => {

              // tbc First loi error message for code implies subsequent LOI fail with same error message

              var final_error_result = result_data.map( (jar) => {
                var errors = jar.filter( (result) => (result instanceof Error))
                var lois = errors.reduce( (err, value) => {
                  return err.concat(value.loi)
                }, [])
                if (lois.length === 0) {
                  return(undefined)
                }

                return new CollapsedE ( errors[0].message, errors[0].code, lois )

              }).filter( (empty) => !!empty)

              result_data = result_data.map( (arr) => {
                return arr.filter( (result) => !(result instanceof Error))
              }).filter( (empty) => empty.length > 0)

              var final_result = cleanData(result_data)
              console.log('Done! \n #%d Codes fetched successfully \n #%d Codes failed to fetch across #%d uniclass code', result_data.length, final_error_result.length , result_data.length + final_error_result.length )

              if (final_error_result.length === 0){
                final_error_result = "You have no errors - Well done!"
              }
              
              this.dt.table.getCell(this.destId).update({value: final_result})
              this.dt.table.getCell(this.errorId).update({value: final_error_result})
            }).catch(console.log)
          }
        })
    }
  }

  createWebsocket() {
    var options = {}

    const websocketRefHandler = (msg) => {
      for (var k in this.dt.handlers) {
        this.dt.handlers[k](msg)
      }
    }

    this.dt.handlers[this.credentials.idToken.payload.sub] = this.debounced

    if (!this.dt.websocketOpen) {
      this.dt.websocketOpen = true
      let ws = this.dt.table.openWebSocket(options)
      this.dt.table.addWebSocketHandler(websocketRefHandler) // every dataTable (project) has a method called addWebSocketHandler (line 89) which takes a function. This function will be called whenever the project has a change
    }
  }
}

module.exports = Q

class CollapsedE extends Error {
  constructor(message, code, lois){
    super()
    this.message = message
    this.code = code
    this.lois = lois
  }
}
