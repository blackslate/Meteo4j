# Meteo4j

A barebones demo of how to use a Neo4j graph database in a Meteor project.

The demo uses [dr-dimitru's](https://github.com/dr-dimitru)[Neo4j Reactivity driver for Meteor](https://github.com/VeliovGroup/ostrio-Neo4jreactivity). You will also need to install Neo4j.

## What's a graph database?

A graph database uses nodes, edges and properties to represent and store data [(Wikipedia)](https://en.wikipedia.org/wiki/Graph_database).

A mental image: You know people. The people you know, know other people. People do things to things. You can think of each person and thing as a node, and each relationship or action as an edge. People have names, birthdays, interests and other 'properties'. In Neo4j, you create nodes like this: 

    CREATE (jack:Person {name: "Jack"})
         , (jill:Person {name: "Jill"})
         , (house:House {name: "House"})

The relationships between people have properties too. These relationships are defined using ascii art:

      (jill)-[:KNOWS {since: "childhood"}]->(jack)
    , (jack)-[:BUILT]->(house)

You can define patterns of nodes and the way they are linked, and then ask the database for all the matches for this pattern:

    MATCH (a:Person)-[:KNOWS]-(b:Person)-[:BUILT]->(h:House)
    RETURN a,b,h
    
    a            b            h
    name Jill    name Jack    name House

## Installing Neo4j

[Download Neo4j community edition](http://neo4j.com/download/)

Move it to User's root folder

    $ cd /path/to/your/download/folder
    $ tar zxvf neo4j-community-2.2.4-unix.tar.gz # unzip the file
    $ mv neo4j-community-2.2.4-unix ~/neo4j  # move it to the root of your user folder

Start Neo4j

    $ ~/neo4j/bin/neo4j start
    Starting Neo4j Server...WARNING: not changing user
    process [6493]... waiting for server to be ready................. OK.
    http://localhost:7474/ is ready.

You can now try out Neo4j [in your browser](http://localhost:7474/)

    Note: Neo4j database should be running before Meteor *
    
## Installing Node.js

Pick up the version for your system from the [Node.js web site](http://nodejs.org/download/). Follow the installer instructions.

## Installing Meteor

#### Linux and Mac OS

Run this in Terminal:

    curl https://install.meteor.com/ | sh
    
#### Windows

[Download the official Meteor installer here.](https://install.meteor.com/windows)

## Installing the Neo4j NPM Package

    $ sudo npm -g install neo4j
    password:

If you prefer to develop in a non-admin account, you must switch to an account with admin privileges, so that you can install as the root user:

    $ su admin # use your own admin account name
    password:
    $ sudo npm -g install neo4j
    password:
    $ exit # to return to your standard account

## Installing the Meteo4j demo

    $ cd /path/to/a/folder/
    $ git clone https://github.com/blackslate/Meteo4j.git .
    Cloning into ....
    remote: Counting objects: 18, done.
    remote: Compressing objects: 100% (14/14), done.
    remote: Total 18 (delta 1), reused 15 (delta 0), pack-reused 0
    Unpacking objects: 100% (18/18), done.
    $ cd app
    $ meteor
       
    [[[[[ /Volumes/Mata/Learning/JavaScript/tests/Neo4j/test/app ]]]]]
    
    => Started proxy.                             
    => Started MongoDB.                           
    => Started your app.                          
    
    => App running at: http://localhost:3000/

You can now see the demo [in your browser](http://localhost:3000/)
