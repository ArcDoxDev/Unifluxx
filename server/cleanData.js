module.exports = function cleanData (data) {
  if (!data) {
    return data
  }
  return data.map(cleanItem)
}

function cleanItem (lois) {
  var result = {}
  const notation = lois[0].Notation
  result[notation] = lois[0].Title || 404
  if (result[notation] === 404) result.error = 404
  result.attributes = lois.map(cleanLOI)
  return result
}

function cleanLOI (loi) {
  if (!loi.Data) return loi
  return loi.Data.map(detail => {
    var result = {}
    var name = camelCase(detail.Name)
    result[ name ] = detail.Definition
    return result
  })
}

function camelCase (str) {
  return str.replace(/[^\w ]/g, '').replace(/ +/g, ' ').replace(/ (.)/g, function (m, $1) {
    return $1.toUpperCase()
  }).trim()
}
