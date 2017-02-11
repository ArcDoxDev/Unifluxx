// instantiate the Flux SDK with your appliation key
var sdk = new FluxSdk(config.flux_client_id, { redirectUri: config.url, fluxUrl: config.flux_url })
var helpers = new FluxHelpers(sdk)
var user = null
var dataTables = {}

/**
 * Get the Flux user.
 */
function getUser() {
  if (!user) {
    user = helpers.getUser()
  }
  return user
}

/**
 * Get the user's Flux projects.
 */
function getProjects() {
  return getUser().listProjects()
}

/**
 * Get a project's data table.
 */
function getDataTable(project) {
  if (!(project.id in dataTables)) {
    var dt = getUser().getDataTable(project.id)
    dataTables[project.id] = { table: dt, handlers: {}, websocketOpen: false }
  }
  return dataTables[project.id]
}

/**
 * Get a list of the project's cells (keys).
 */
function getCells(project) {
  return getDataTable(project).table.listCells()
}

/**
 * Get a specific project cell (key).
 */
function getCell(project, cell) {
  return getDataTable(project).table.getCell(cell.id)
}

/**
 * Get the value contained in a cell (key).
 */
function getValue(project, cell) {
  return getCell(project, cell).fetch()
}

/**
 * Update the value in a project cell (key).
 */
function updateCellValue(project, cell, value) {
  var cell = getUser().getCell(project.id, cell.id)
    cell.update({value:value})
    window.alert("Written to Flux successfully!")
}

/**
 * Create a project cell (key) in Flux.
 */
function createCell(project, name) {
  var dt = getDataTable(project).table
  return dt.createCell(name, {description: name, value: ''})
}
