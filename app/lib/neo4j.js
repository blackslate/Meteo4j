/* Allow client query execution. If allowClientQuery is not set to 
   true, then all calls to Meteor.neo4j.query('...') will return
   undefined
*/
Meteor.neo4j.allowClientQuery = true

/* Custom URL to Neo4j should be here */
Meteor.neo4j.connectionURL = 'http://neo4j:1234@localhost:7474'
/* For security's sake, deny all writing actions on client 
    ["CREATE", "SET", "DELETE", "REMOVE", "INDEX", "DROP", "MERGE"]
   
  Here's the list of permitted read actions:
    ["RETURN", "MATCH", "SKIP", "LIMIT", "OPTIONAL", "ORDER BY", "WITH", "AS", "WHERE", "CONSTRAINT", "UNWIND", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END", "UNIQUE", "FOREACH", "ON", "USING"]

  Here's the list of all actions:
    ["RETURN", "MATCH", "SKIP", "LIMIT", "OPTIONAL", "ORDER BY", "WITH", "AS", "WHERE", "CONSTRAINT", "UNWIND", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END", "CREATE", "UNIQUE", "MERGE", "SET", "DELETE", "REMOVE", "FOREACH", "ON", "INDEX", "USING", "DROP"]
*/
//Meteor.neo4j.set.deny(Meteor.neo4j.rules.write)
