
var Rooms = Meteor.neo4j.collection('Rooms');

function showRooms() {
  var rooms = Rooms.find().fetch()
  console.log(rooms)
}

function insertCallback(error, result) {
  console.log("insertCallback: ". error, result)
  showRooms()
}

function matchCount(query, key) {
  var count = 0
  var cursor =  Meteor.neo4j.query(query + key)
  var object = cursor.get()

  if (object) {
    count = object[key].length
  }

  return count
}


showRooms()

if (Meteor.isServer) {

  Rooms.publish('allRooms', getQuery, onSubscribe)

  function getQuery() {
    return 'MATCH (room:Room) RETURN room'
  }

  function onSubscribe(a, b, c) {
    console.log("onSubscribe", a, b, c)
   
    var selector = { name: 'Hello', __labels:":Room" }
    var cursor = Rooms.find({})
    var count = cursor.count()

    console.log(count)

    // if (!count) {
    //   Rooms.insert({
    //     name: "Hello",
    //     __labels: ':Room'
    //   }, insertCallback)

    //   console.log("Inserted Hello room from Server")
    // }
  }
}

  // var key = "count(r)"
  // var query =  "MATCH (r:Room {name: 'Hello'}) RETURN "

  // var exists = matchCount(query, key)
  // console.log(exists)

  // if (!exists) {
  //   Rooms.insert({
  //     name: "Hello",
  //     __labels: ':Room'
  //   }, insertCallback);

  //   console.log("inserted room from Server")
  // }

if (Meteor.isClient) {
  
  Tracker.autorun(function(){
    Rooms.subscribe('allRooms', null, 'node');
  });


  // var key = "count(r)"
  // var query =  "MATCH (r:Room {name: 'World'}) RETURN "
  // var exists = matchCount(query, key)
  // console.log(exists)

  // if (!exists) {
  //   Rooms.insert({
  //     name: "World",
  //     __labels: ':Room'
  //   }, insertCallback)

  //   var query = "MATCH (hello:Room), (world:Room)" +
  //   " WHERE hello.name = 'Hello' AND world.name = 'World'" +
  //   " CREATE (hello)-[l:LINK]->(world)" +
  //   " RETURN l"

  //   var link = Meteor.neo4j.query(query)

  //   console.log("inserted room from Client and created link", link)
  // }

  Template.rooms.helpers({
    rooms: function () {
      //return Rooms.get()
    }
  })
}

showRooms()