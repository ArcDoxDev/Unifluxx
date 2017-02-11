var upperCamelCase = require('uppercamelcase');

module.exports = function cleanData(data){
    if (!data) {
      return data
    }
    return data.map( cleanItem )
}

function cleanItem( lois ) {
    var result = {}
    result[ lois[0].Notation ] = lois[0].Title
    result.attributes = lois.map(cleanLOI)
    return result
}

function cleanLOI ( loi ) {
    return loi.Data.map( detail => {
      var result = {}
      var name = camelCase(detail.Name)
      result[ name ] = detail.Definition
      return result
    } )
}

function camelCase( str ) {
  return str.replace(/[^\w ]/g, "").replace(/ +/g, " ").replace(/ (.)/g, function (m, $1) {
    return $1.toUpperCase()
  }).trim()
}
