
var Nodes = Meteor.neo4j.collection("Nodes") // any collection name
var publishKey = "Meteo4jNodes" // any publish-subscribe name

if (Meteor.isServer) {
   var label = "Meteo4j"
   var matchQuery = "MATCH (node:" + label + ") RETURN node"
 
  ;(function createTheFirstNode(){
    // Check if there are already any nodes with the Meteo4J label    
    var options = null
    Meteor.N4JDB.query(matchQuery, options, matchCallback)

    function matchCallback(error, nodeArray) {
      console.log(error, nodeArray)
      if (error) {
        return console.log(error)
      } 

      // There are no nodes, create one
      if (!nodeArray.length) {
        var createQuery = "CREATE (n:" + label + " {name: 'Start'})"
        Meteor.N4JDB.query(createQuery, options, createCallback)

        function createCallback(error, resultArray) { 
          if (error) {
            return console.error('New node not created:', error)
          }
        }
      }
    }  
  })()

  Nodes.publish(publishKey, publishQuery, onSubscribe)

  function publishQuery(){
    return matchQuery
  }

  function onSubscribe(){
    console.log("Client subscribed to 'Nodes' collection")
    var options = null
    Meteor.N4JDB.query(matchQuery, options, matchCallback)

    function matchCallback (error, result) {
      // console.log(JSON.stringify(result))
      // [ { "node": {"_data": { "data" { "name": <string> } } } ]
      var node
      var name = (result instanceof Array)
                 ? result[0]
                   ? (node = result[0].node, node)
                     ? node._data
                       ? node._data.data
                         ? node._data.data.name
                         : "no node._data.data"
                       : "no node._data"
                     : "result[0] has no 'node' key"
                   : "result[0] doesn't exist"
                 : "result is not an array"

      console.log("onSubscribe — error:", error, ", node name:", name)
    }
  }
}

if (Meteor.isClient) {
  Tracker.autorun(function trackDataChanges(){
    var options = null // becomes `this` in the publishQuery() method
    var link = "node" // object name, to link as MongoDB row(s).
    var subscription = Nodes.subscribe(publishKey, options, link)
    console.log("Nodes: ", Nodes)
    console.log("subscription: ", subscription)
  })

  Template.nodeList.helpers({
    nodes: function nodes() {
      var cursor = Nodes.find()
      console.log("nodes: ", cursor.fetch())
      return cursor
    }
  })

  Template.node.helpers({
    label: function label() {
      return this.metadata.labels[0]
    }
  })
}