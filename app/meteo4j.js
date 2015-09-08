
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
, "addDoor": {
    collection: Meteor.neo4j.collection("CreateNewDoor")
  , query: 
      "MATCH (entrance:Room), (exit:Room) " +
      "WHERE entrance.name = {fromRoomId} " +
      "AND exit.name = {toRoomId}  " +
      "CREATE entrance-[door:DOOR]->exit " +
      "RETURN door"
  , options: { fromRoomId: "", toRoomId: "" }
  , link: "door"
  , manualSubscription: true
  }
// , "lockDoor": {
//     collection: Meteor.neo4j.collection("LockDoor")
//   , query: 
//       "MATCH ()-[door:DOOR]-() " +
//           ", (room:Room)" +
//       "WHERE door._id = {_id} " +
//       "AND room.name = {keyRoom}  " //+
//       // "CREATE entrance-[door:DOOR]-exit " +
//       // "RETURN door" 
//       // Set lock on door, place key in room //
//   , options: { _id: 1, keyRoom2: "Room A" }
//   , link: "door"
//   , manualSubscription: true
//   }
}




if (Meteor.isServer) {
  ;(function (){
    var queryKeys = Object.keys(queries)
    queryKeys.forEach(publish)

    function publish(key) { //, index, array){
      //console.log(key, queries[key])

      var queryData = queries[key]
      var query = queryData.query
      var collection = queryData.collection

      collection.publish(key, publishCallback)

      function publishCallback(){
        return query
      }
    }
  })()


  Meteor.neo4j.methods({
    "addDoor": function(){
      var queryData = queries.addDoor
      var query = queryData.query
      console.log(query, this)
      return query
    }
  });
}

if (Meteor.isClient) {

  Session.set("fromRoomId", "")

  Tracker.autorun(function createSubscriptions(){
    var queryKeys = Object.keys(queries)
    queryKeys.forEach(subscribe)

    function subscribe(key) { //, index, array){
      var queryData = queries[key]
      if (!queryData.manualSubscription) {
        var options = queryData.options
        var link = queryData.link
        var collection = queryData.collection
        var subscription = collection.subscribe(key, options, link)
      }
    }
  })

  function getResult(queryData) {
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
      return getResult(queries.allRooms)
    }
  })

  Template.doorList.helpers({
    doors: function doors() {
      return getResult(queries.roomsWithDoors)
    }
  })

  Template.addRoom.events({
    'click #addRoom': addRoom
  , 'keypress #newRoomName': function (event) {
      if (event.keyCode === 13) {
        addRoom()
      }
    } 
  })

  Template.addDoor.onRendered (function () {
    var fromRoomId = $("#fromRoomName :selected").text()
    Session.set("fromRoomId", fromRoomId)
    var toRoomId = $("#toRoomName :selected").text()
    Session.set("toRoomId", toRoomId)

    //console.log("addDoor rendered", fromRoomId, toRoomId)
  })

  Template.addDoor.events({
    'change #fromRoomName': function () {
      var fromRoomId = $("#fromRoomName :selected").text()
      //console.log("From:", fromRoomId)
      Session.set("fromRoomId", fromRoomId)
    }

 , 'change #toRoomName': function () {
      var toRoomId = $("#toRoomName :selected").text()
      //console.log("To:", toRoomId)
      Session.set("toRoomId", toRoomId)
    }

  , 'change #locked': function (event) {
      Session.set("locked", event.currentTarget.checked)
    }

  , 'click #addDoor': function (event) {
      var options = {}
      options.fromRoomId = Session.get("fromRoomId")
      options.toRoomId = Session.get("toRoomId")
      //options.keyRoom = Session.get("keyRoom")
      Meteor.neo4j.call("addDoor", options, callback)

      function callback(error, data, a, b, c) {
        console.log("Add Door callback", error, data, a, b, c)
      }
    }
  })

  Template.entrance.helpers({
    fromRooms: function() {
      // Get a list of rooms not already linked to every other room
      var result = getResult(queries.roomsForNewDoors)
      var fromRoomId = Session.get("fromRoomId") // may be ""
      var fetched = result.fetch()

      if (!fromRoomId.length) {
        // If fromRoomId is not already set, set it to the first
        // available door. It will be reset each time the value of  
        // the #fromRoomName select element is changed.
    
        if (fetched.length > 0) {
          Session.set("fromRoomId", fetched[0].name)
        }
      } else {
        // If the user has just created the last possible door for the
        // current room, then `fromRoomId` will no longer appear in
        // the list of room names.
        changeRoomIfFull(fromRoomId, fetched)
      }

      //console.log("From:",result.fetch())
      return result

      function changeRoomIfFull(fromRoomId, fetched) {
        var fromRoomMissing = fetched.every(function (element) {
          return (element.name !== fromRoomId)
          // If fromRoomId is present in fetched, then fromRoomMissing
          // will be set to `false` and this anonymous function will
          // not be called again. Otherwise, this function will be
          // called for each element, and will return `true`.
        })

        if (fromRoomMissing) {
          fromRoomId = fetched[0].name
          Session.set("fromRoomId", fromRoomId)

          // Select this new item in the popup menu
          $("#fromRoomId option").filter(function() {
            return $(this).text() === fromRoomId
          }).prop('selected', true);
        }
      }
    }
  })


  Template.exit.helpers({
    toRooms: function () {
      var key = "newDoorsForRoom"
      var queryData = queries[key]
      var options = { fromRoomId: Session.get("fromRoomId") }
      var link = queryData.link
      var collection = queryData.collection
      // The options have changed, so subscribe() needs to be called
      // again.
      collection.subscribe(key, options, link)

      var result = getResult(queryData)
      // If toRoomId is not already set, set it to the first
      // available door. It will be reset each time the value of the 
      // #fromRoomName select element is changed.
      var fetched = result.fetch()
      if (fetched.length > 0) {
        setToRoomId(fetched[0].name) // current value takes priority
      }
 
      return result
    }
  })


  Template.addDoor.helpers({
    doorableRooms: function(){
      var cursor = getResult(queries.roomsForNewDoors)
      //console.log("Doorable rooms")
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
      var cursor = getResult(queries.allRooms)
      var fetched = cursor.fetch()
      var keyRoom = Session.get("keyRoom")

      if (!keyRoom) {
        if (fetched.length) {
          keyRoom = fetched[0].name
          Session.set("keyRoom", keyRoom)
        }
      }
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


  function addRoom() {
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
  
  function setToRoomId(value) {
    var toRoomId = $("#toRoomName :selected").text()
      
    if (!toRoomId) {
      // This will be the case on first launch
      toRoomId = value
      $("#toRoomId option").filter(function() {
        return $(this).text() === toRoomId
      }).prop('selected', true);
    }

    Session.set("toRoomId", toRoomId)
    //console.log("To:", toRoomId)
  }
}
