
var queries = {
  "allRooms": {
    collection: Meteor.neo4j.collection("Rooms")
  , query: "MATCH (room:Room) RETURN room"
  , link: "room"
  }
, "roomsWithDoors": {
    collection: Meteor.neo4j.collection("RoomsWithDoors")
  , query:
      "MATCH (entrance:Room)-[door:DOOR]->(exit:Room) " +
      "WHERE NOT (entrance)-[:DOOR]->(exit) " +
      "RETURN entrance;" 
  , link: "entrance"
  }
, "roomsForNewDoors": {
    collection: Meteor.neo4j.collection("RoomsForNewDoors")
  , query: 
     "MATCH (entrance:Room), (exit:Room) " +
     "WHERE NOT (entrance)-[:DOOR]->(exit) " +
     "AND entrance <> exit " +
     "RETURN entrance"
  , link: "entrance"
  }
, "newDoorsForRoom": {
    collection: Meteor.neo4j.collection("NewDoorsForRoom")
  , query: 
      "MATCH (entrance:Room), (exit:Room) " +
      "WHERE entrance.name = '{name}' " +
      "AND NOT (entrance)-[:DOOR]->(exit) " +
      "AND entrance <> exit " +
      "RETURN exit"
  , options: {name: "Room 2"}
  , link: "exit"
  }
}


if (Meteor.isServer) {
  ;(function (){
    var queryKeys = Object.keys(queries)
    queryKeys.forEach(publish)

    function publish(key) { //, index, array){
      // console.log(key, queries[key])

      var queryData = queries[key]
      var query = queryData.query
      var collection = queryData.collection

      collection.publish(key, publishCallback)

      function publishCallback(){
        return query
      }
    }
  })()
}

if (Meteor.isClient) {
  Tracker.autorun(function createSubscriptions(){
    var queryKeys = Object.keys(queries)
    queryKeys.forEach(subscribe)

    function subscribe(key) { //, index, array){
      var queryData = queries[key]
      var options = queryData.options
      var link = queryData.link
      var collection = queryData.collection
      var subscription = collection.subscribe(key, options, link)
    
      // console.log(key + ": ", collection)
      // console.log("subscription: ", subscription)
    }
  })

  function getResults(queryData) {
    var collection = queryData.collection
    var cursor = collection.find()
    var order = queryData.sort

    if (order) {
      cursor.sort(order)
    }

    return cursor
  }

  Template.roomList.helpers({
    rooms: function rooms() {
      return getResults(queries.allRooms)
    }
  })

  Template.doorList.helpers({
    doors: function doors() {
      return getResults(queries.roomsWithDoors)
    }
  })

  Template.addRoom.events({
    'click #addRoom': function () {
      var collection = queries.allRooms.collection
      var $input = $('#newRoomName')
      var roomName = $input.val()

      if(roomName){
        collection.insert({
          name: roomName,
          keys: [],
          __labels: ':Room'
        });
        $input.val('');
      }
    }
  })

  Template.addDoor.helpers({
    fromRooms: function() {
      return getResults(queries.roomsForNewDoors)
    }
  , toRooms: getNewDoorsForRoom // See below
  , keyRooms: function () {
      return ["a", "b"]
    }
  })

  Template.addDoor.events({
    'click #addDoor': function () {
      var $from = $('#fromRoomName')
      var $to = $('#toRoomName')
      var $locked = $('#locked')
      var $key = $('#keyRoomName')

      var fromName = $from.val()
      var toName = $to.val()
      var keyName = $locked.checked ? $key.val() : null

      var query = 
      "MATCH (from:Room), (to:Room)" +
      " WHERE from.name = '" + fromName + "'" +
      " AND to.name = '" + toName + "'" +
      " CREATE (from)-[door:DOOR"

      if ($locked.attr("checked")) {
        query += " {lock: '" + toName+ "'}"
      }
      
      query += "]->(to)" +
      " RETURN from, door, to"

      if(fromName){
        if(toName){
          Meteor.neo4j.query(query, null, doorAdded)
        }
      }

      function doorAdded(error, data){
        //console.log("doorAdded: ", error, data)
        // { door: [ {
        //     lock: "Room 2"
        //   , metadata: {
        //       id: 7
        //     , type: "DOOR"
        //     }
        //   , relation: {
        //       end: "87"
        //     , extensions: {}
        //     , self: "7"
        //     , start: "86"
        //     , type: "DOOR"
        //     }
        //   } ]
        // , [ { _id: "gaDMbc6KpmpGwyzTS"
        //     , keys: []
        //     , metadata: {
        //         id: 86
        //       , labels: ["Room"]
        //       }
        //     , name: "Room 1"
        //     }]
        // , [ { _id: ""d6TJWJ3jBtKMfYgLX""
        //     , keys: []
        //     , metadata: {
        //         id: 86
        //       , labels: ["Room"]
        //       }
        //     , name: "Room 2"
        //     }]
        // }
      }
    }
  })

  Template.addDoor.events({
    'change #fromRoomName': function () {
      var fromRoomId = $("#fromRoomName :selected").text()
      Session.set("fromRoomId", fromRoomId)
    }
  })

  function getNewDoorsForRoom() {
  //   var collection = Meteor.neo4j.collection("NewDoorsForRoom")
  //   var query =
  //     "MATCH (entrance:Room), (exit:Room) " +
  //     "WHERE entrance.name = '{name}' " +
  //     "AND (entrance)-[:DOOR]->(exit) " +
  //     "AND entrance <> exit" +
  //     "RETURN exit"
  // , options: {name: "Room 2"}
  // , link: "room"
    var key = "newDoorsForRoom"
    var queryData = queries[key]
    var options = { name: Session.get("fromRoomId") }
    var link = queryData.link
    var collection = queryData.collection
    var subscription = collection.subscribe(key, options, link)
    var results = getResults(queryData)
    return results
  }
}
