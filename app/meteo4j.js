
var queries = {
  "allRooms": {
    collection: Meteor.neo4j.collection("Rooms")
  , query: "MATCH (room:Room) RETURN room ORDER BY room.name"
  , link: "room"
  }
, "roomsWithDoors": {
    collection: Meteor.neo4j.collection("RoomsWithDoors")
  , query:
      "MATCH (entrance:Room)-[door:DOOR]->(exit:Room) " +
      "RETURN exit " +
      "ORDER BY entrance.name" 
  , link: "exit"
  }
, "roomThatCouldUseADoor": {
    collection: Meteor.neo4j.collection("RoomThatCouldUseADoor")
  , query: 
      "MATCH (entrance:Room), (exit:Room) " +
      "WHERE entrance <> exit " +
      "AND NOT (entrance)-[:DOOR]->(exit) " +
      "RETURN DISTINCT entrance " +
      "ORDER BY entrance.name " +
      "LIMIT 1"
  , link: "entrance"
  }
, "roomsForNewDoors": {
    collection: Meteor.neo4j.collection("RoomsForNewDoors")
  , query: 
     "MATCH (entrance:Room), (exit:Room) " +
     "WHERE NOT (entrance)-[:DOOR]->(exit) " +
     "AND entrance <> exit " +
     "RETURN entrance " + // "RETURN DISTINCT entrance" fails silently
     "ORDER BY entrance.name" 
  , link: "entrance"
  }
, "newDoorsForRoom": {
    collection: Meteor.neo4j.collection("NewDoorsForRoom")
  , query: 
      "MATCH (entrance:Room), (exit:Room) " +
      "WHERE entrance.name = {fromRoomId} " +
      "AND NOT (entrance)-[:DOOR]->(exit) " +
      "AND entrance <> exit " +
      "RETURN exit " +
      "ORDER BY exit.name" 
  , options: {fromRoomId: "Room A"}
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

  Session.set("fromRoomId", "")

  Tracker.autorun(function createSubscriptions(){
    var queryKeys = Object.keys(queries)
    queryKeys.forEach(subscribe)

    function subscribe(key) { //, index, array){
      var queryData = queries[key]
      var options = queryData.options
      var link = queryData.link
      var collection = queryData.collection
      var subscription = collection.subscribe(key, options, link)
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

  Template.addDoor.onRendered (function () {
    var fromRoomId = $("#fromRoomName :selected").text()
    Session.set("fromRoomId", fromRoomId)
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
        console.log("doorAdded: ", error, data)
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

  , 'change #fromRoomName': function () {
      var fromRoomId = $("#fromRoomName :selected").text()
      console.log("Change:", fromRoomId)
      Session.set("fromRoomId", fromRoomId)
    }

  , 'change #locked': function (event) {
      Session.set("locked", event.currentTarget.checked)
    }
  })

  Template.addDoor.helpers({
    fromRooms: function() {
      var results = getResults(queries.roomsForNewDoors)
      if (!Session.get("fromRoomId").length) {
        var fetched = results.fetch()
        if (fetched.length > 0) {
          Session.set("fromRoomId", fetched[0].name)
        }
      }
      //console.log("From:",results.fetch())
      return results
    }

  , toRooms: function () {
      var key = "newDoorsForRoom"
      var queryData = queries[key]
      var options = { fromRoomId: Session.get("fromRoomId") }
      var link = queryData.link
      var collection = queryData.collection
      // The options have changed, so subscribe() needs to be called
      // again.
      collection.subscribe(key, options, link)

      var results = getResults(queryData)
      //console.log("To:", results.fetch())
      return results
    }

  , doorableRooms: function(){
      var cursor = getResults(queries.roomsForNewDoors)
      console.log("Doorable rooms")
      return !!cursor.count()
    }

  , locked: function () {
      var state = Session.get("locked") ? "locked" : "unlocked"
      return state
    }

  , isLocked: function(){
      return Session.get("locked")
    }
  })

  Template.keyRooms.helpers({
    keyRooms: function(){
      var cursor = getResults(queries.allRooms)
      return cursor
    }
  })

  Template.keyRooms.events({
    'change #keyRoomName': function (event) {
      var menu = event.currentTarget
      var keyRoom = menu.options[menu.selectedIndex].value
      Session.set("keyRoom", keyRoom)
    }
  })

  Template.keyRooms.onRendered (function(event) {
    var keyRoom = Session.get("keyRoom")

    $("#keyRoomName option").filter(function() {
      return $(this).text() === keyRoom
    }).prop('selected', true);

    // http://stackoverflow.com/a/496126/1927589
  })
  
}
