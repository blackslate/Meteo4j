

if (Meteor.isServer) {
  // Check if there are any nodes at all in the database
  var query = 'MATCH (n) RETURN n'
  var options = null
  Meteor.N4JDB.query(query, options, callback) // output is undefined
  
  // The database sends its response to a callback
  function callback(error, nodeArray) {
    console.log(error, nodeArray) // JSON.stringify(nodeArray))
    // null 
    // [{ n: { db: [Object], _request: [Object], _data: [Object] } }]
    if (error) {
      return console.log(error)
    } 

    if (!nodeArray.length) {
      var node = Meteor.N4JDB.createNode({name: 'hello world'})

      // node is not saved to the database: you must manually save it
      node.save(function (error, savedNode) { 
        if (error) {
          return console.error('New node not saved:', error)
        }

        // The node is ready to use. See it at...
        // http://localhost:7474/browser/
        // ... using the query:
        // MATCH (n) RETURN n
       })
    }
  }
}