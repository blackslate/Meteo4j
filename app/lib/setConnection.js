(function(){
  /* Allow client query execution */
  Meteor.neo4j.allowClientQuery = true
  /* Custom URL to Neo4j should be here */
  Meteor.neo4j.connectionURL = 'http://neo4j:1234@localhost:7474'
  /* But deny all writing actions on client 
     ["CREATE", "SET", "DELETE", "REMOVE", "INDEX", "DROP", "MERGE"]
  */
  // Meteor.neo4j.set.deny(Meteor.neo4j.rules.write)
})()