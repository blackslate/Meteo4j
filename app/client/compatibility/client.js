// var Rooms = Meteor.neo4j.collection("Rooms") // any collection name
// var roomKey = "Rooms" // any publish-subscribe name


// Tracker.autorun(function trackDataChanges(){
//   var options = null // becomes `this` in the publishRoomQuery() method
//   var link = "room" // object name, to link as MongoDB row(s).
//   var subscription = Rooms.subscribe(roomKey, options, link)
//   console.log("Rooms: ", Rooms)
//   console.log("subscription: ", subscription)
// })

// Template.roomList.helpers({
//   rooms: function rooms() {
//     var cursor = Rooms.find()
//     return cursor
//   }
// })