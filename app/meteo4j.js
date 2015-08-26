

if (Meteor.isServer) {
  var query = 'MATCH (n) RETURN n'
  var options = null

  Meteor.N4JDB.query(query, options, callback) // output undefined
  
  function callback(error, result) {
    console.log(error, result) // JSON.stringify(result))
    // null 
    // [{ n: { db: [Object], _request: [Object], _data: [Object] } }]
    if (error) {
      return console.log(error)
    } 

    if (!result.length) {
      node = Meteor.N4JDB.createNode({hello: 'world'}) // not saved
      node.save(function (error, node) { // until you do this
        if (error) {
          return console.error('New node not saved:', error)
        }

        // The node is ready to use
      });
    }
  }
}
