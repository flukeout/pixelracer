/*
* Connection IDs with messages & state
*/

var sockjs = require('sockjs');
var util = require('util');

// 1. Echo sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var connections = {};

function socket(server) {
  var sockjs_socket = sockjs.createServer(sockjs_opts);
  sockjs_socket.on('connection', listener);
  sockjs_socket.installHandlers(server, {prefix:'/echo'});
  function tick() {
    var tickDelay = 1000;
    //var messages = world.tick();
    //broadcast_all(messages);
    setTimeout(tick, tickDelay);
  }
  tick();
}

function listener(conn) {

  connections[conn.id] = conn;


  function tick() {
    // tick for individual connection
    var tickDelay = 4000; // 4 seconds
    //conn.write(makeGridMessage());
    setTimeout(tick, tickDelay);
  }

  tick();

  var otherPlayers = [];
  for(var c in connections){
    if(conn.id != connections[c].id){
      otherPlayers.push(connections[c].id);
    }
  }

  //Send to client when someone else joins
  var send = {
    "id" : "%s",
    "message" : {
      "type" : "welcome",
      "othercars" : otherPlayers
    }
  }
  send = JSON.stringify(send);
  conn.write(util.format(send, conn.id));

  // Send to all clients when someone else joins
  // Do we need this?
  var send = {
    "id" : conn.id,
    "message" : {
      "type" : "joined"
    }
  }
  broadcast_all(JSON.stringify(send));

  //Receive a message from a client
  var readMessage = function(message) {
    if (!message || message.length <= 0) return; // skip

    var message = JSON.parse(message);
    var send = {
      "id" : conn.id,
      "message" : message
    }
    broadcast(JSON.stringify(send));
  }

  var closeConnection = function() {
    delete connections[conn.id];
    var send = {
      "id" : conn.id,
      "message" : {
        "type" : "quit"
      }
    }
    broadcast_all(JSON.stringify(send));
  }

  function broadcast(message) {
    for (var id in connections) {
      if (id !== conn.id) {
        connections[id].write(message);
      }
    }
  }

  conn.on('data', readMessage);
  conn.on('close', closeConnection)
}

function broadcast_all(message) {
  var messages = message;
  if (!Array.isArray(message)) {
    messages = [message];
  }
  for (var i = 0; i < messages.length; i++) {
    for (var id in connections) {
      connections[id].write(messages[i]);
    }
  }
}

module.exports = socket;
