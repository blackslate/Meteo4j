

if (Meteor.isServer) {
  // Check if there are any nodes with the Meteo4J label in the
  // database, using a standard cypher query
  var label = "Meteo4j"
  var cypher = "MATCH (n:" + label + ") RETURN n"
  var options = null
  Meteor.N4JDB.query(cypher, options, matchCallback)

  function matchCallback(error, nodeArray) {
    console.log(error, nodeArray)
    if (error) {
      return console.log(error)
    } 

    // There are no nodes, create one
    if (!nodeArray.length) {
      cypher = "CREATE (n:" + label + " {name: 'hello world'})"
      Meteor.N4JDB.query(cypher, options, createCallback)

      function createCallback(error, resultArray) { 
        if (error) {
          return console.error('New node not created:', error)
          // { [Error: Unexpected end of input: expected whitespace, ')' or a relationship pattern...
        }

        //console.log(result) // []
        
        // The node is ready to use. See it at...
        // http://localhost:7474/browser/
        // ... using the query:
        // MATCH (n:Meteo4j) RETURN n
       }
    }
  }
}