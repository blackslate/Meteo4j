
var Rooms = Meteor.neo4j.collection("Rooms") // any collection name
var roomKey = "Rooms" // any publish-subscribe name

if (Meteor.isServer) {
  var roomQuery = "MATCH (room:Room) RETURN room"
  Rooms.publish(roomKey, publishRoomQuery)

  function publishRoomQuery(){
    return roomQuery
  }
}

if (Meteor.isClient) {
  Tracker.autorun(function trackDataChanges(){
    var options = null // becomes `this` in the publishRoomQuery() method
    var link = "room" // object name, to link as MongoDB row(s).
    var subscription = Rooms.subscribe(roomKey, options, link)
    console.log("Rooms: ", Rooms)
    console.log("subscription: ", subscription)
  })

  Template.roomList.helpers({
    rooms: function rooms() {
      var cursor = Rooms.find()
      return cursor
    }
  })

  Template.doorList.helpers({
    doors: function doors() {
      var cursor = Rooms.find()
      return cursor
    }
  })

  Template.addRoom.events({
    'click #addRoom': function () {
      var $input = $('#newRoomName')
      var roomName = $input.val()
      if(roomName){
        Rooms.insert({
          name: roomName,
          keys: [],
          __labels: ':Room'
        });
        $input.val('');
      }
    }
  })

// <template name="addPlayer">
//   <hr>
//   <h3>Add new Player:</h3>
//   <div class="details">
//     <input class="input addPlayer" id="newPlayerName" placeholder="Type name here"> 
//     <button class="button" id="addPlayer">Add Player</button>
//   </div>
// </template>
}