const request = require('request')
const config = require('../config')
const reqSend = require('./request_send')
const promSeries = require('./promSeries')
const cleanData = require('./cleanData')

class Q {

  constructor({sdk, credentials, project, source, dest}) {
    this.tables = {}
    this.project = project
    this.source = source
    this.dest = dest
    this.sourceId = false
    this.destId = false
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
      cells.entities.map((cell) => {
        if (cell.label === this.source) this.sourceId = cell.id
        if (cell.label === this.dest) this.destId = cell.id
      })
      if (!this.destId) {
        this.dt.table.createCell(this.dest, {description: this.dest, value: "No data yet"})
          .then((cell) => this.destId = cell.id)
      }
    })
  }

  onRequest(msg) {
    if (msg.type === 'CELL_MODIFIED' && msg.body.label === this.source) {
      this.dt.table.getCell(msg.body.id).fetch()
        .then( (cell) => {
          if (cell.value) {
            let val = cell.value
            if (!Array.isArray(val)) val = [val]

            var codePromises = val.map( (code) => {
              var lois = [2,3,4,5,6]
              var promises = lois.map( (loi) => () => reqSend (code, loi) )
              return () => promSeries(promises)
            } )

            var chain = promSeries(codePromises)

            chain.then((result_data) => {
              var final_result = cleanData(result_data)
              if(final_result){
                console.log('Done - Go to Flux!')
              }
              this.dt.table.getCell(this.destId).update({value: final_result})
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
