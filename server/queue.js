const reqLOI = require('./requestLoi')
const reqClassification = require('./requestClassification')
const promSeries = require('./promSeries')
const cleanData = require('./cleanData')

class Q {
  constructor ({sdk, credentials, project, source, dest, notation, classification}) {
    this.tables = {}
    this.project = project
    this.source = source
    this.dest = dest
    this.notation = notation
    this.classification = classification
    this.sourceId = false
    this.destId = false
    this.notationId = false
    this.classificationId = false
    this.credentials = credentials
    this.debounced = this.debounce(this.onRequest.bind(this), 500)
    let dt = new sdk.Project(this.credentials, this.project).getDataTable()
    this.dt = { table: dt, handlers: {}, websocketOpen: false }
    this.createWebsocket()
    this.initCells()
  }

  debounce (func, wait, immediate) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  initCells () {
    this.dt.table.listCells().then((cells) => {
      cells.entities.forEach((cell) => {
        if (cell.label === this.source) this.sourceId = cell.id
        if (cell.label === this.dest) this.destId = cell.id
        if (cell.label === this.notation) this.notationId = cell.id
        if (cell.label === this.classification) this.classificationId = cell.id
      })
      if (!this.destId) {
        this.dt.table.createCell(this.dest, {description: this.dest, value: 'No data yet'})
          .then((cell) => { this.destId = cell.id })
      }
      if (!this.classificationId) {
        this.dt.table.createCell(this.error, {description: this.classification, value: 'No classifications yet!'})
          .then((cell) => { this.classificationId = cell.id })
      }
    })
  }

  onRequest (msg) {
    if (msg.type === 'CELL_MODIFIED' && msg.body.label === this.source) {
      this.dt.table.getCell(msg.body.id).fetch()
        .then((cell) => {
          if (cell.value) {
            let val = cell.value

            if (!Array.isArray(val)) {
              this.dt.table.getCell(this.destId).update({value: 'Please enter valid JSON Array for the SOURCE key'})
              return
            }

            var codePromises = val.map((code) => {
              var lois = [2, 3, 4, 5, 6]
              var promises = lois.map((loi) => () => reqLOI(code, loi))

              return () => promSeries(promises)
            })

            var chain = promSeries(codePromises)

            chain.then((resultData) => {
              var finalResult = cleanData(resultData)
              this.dt.table.getCell(this.destId).update({value: finalResult})
            }).catch((error) => this.dt.table.getCell(this.destId).update({value: error}))
          }
        })
    } else if (msg.type === 'CELL_MODIFIED' && msg.body.label === this.notation) {
      this.dt.table.getCell(msg.body.id).fetch()
        .then((cell) => {
          if (cell.value) {
            const notationCodes = cell.value
            if (!Array.isArray(notationCodes)) {
              this.dt.table.getCell(this.classificationId).update({value: 'Please enter valid JSON Array for the NOTATION key'})
              return
            }
            // The level of depth at which to return child classifications
            const depth = 5
            const responsesPs = notationCodes.map((code) => reqClassification(code, depth))
            Promise.all(responsesPs)
              .then((responses) => {
                this.dt.table.getCell(this.classificationId).update({value: responses})
              }).catch((error) => this.dt.table.getCell(this.classificationId).update({value: error}))
          }
        })
    }
  }

  clearError () {
    this.dt.table.getCell(this.errorId).update({message: 'you have no errors'})
  }

  createWebsocket () {
    var options = {}

    const websocketRefHandler = (msg) => {
      for (var k in this.dt.handlers) {
        this.dt.handlers[k](msg)
      }
    }

    this.dt.handlers[this.credentials.idToken.payload.sub] = this.debounced

    if (!this.dt.websocketOpen) {
      this.dt.websocketOpen = true
      this.dt.table.openWebSocket(options)
      this.dt.table.addWebSocketHandler(websocketRefHandler)
    }
  }
}

module.exports = Q
