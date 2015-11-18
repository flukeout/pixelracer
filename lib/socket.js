var sockjs = require('sockjs');
var util = require('util');
var playerStates = {}; //this badboy will keep all the player states
var race = {};

// 1. Echo sockjs server
var sockjs_opts = { sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js" };
var connections = {};

function socket(server) {
  var sockjs_socket = sockjs.createServer(sockjs_opts);
  sockjs_socket.on('connection', listener);
  sockjs_socket.installHandlers(server, {prefix:'/echo'});

  function tick() {
    // var tickDelay = 33;//
    var tickDelay = 33;//

    var send = {
      "type" : "playerStates",
      "message" : playerStates
    }

    broadcast_all(JSON.stringify(send));

    setTimeout(tick, tickDelay);
  }
  tick();

}

function listener(conn) {

  connections[conn.id] = conn;

  function tick() {
    var tickDelay = 4000; // 4 seconds
    setTimeout(tick, tickDelay);
  }

  tick();


  // Welcomes a new player!
  welcomePlayer(conn);

  // Send to all clients when someone else joins
  // Do we need this?

  var send = {
    "id" : conn.id,
    "message" : {
      "type" : "joined"
    }
  }
  broadcast_all(JSON.stringify(send));

  //Receive a message from a client < - this is the one we are worried about.....
  var readMessage = function(message) {
    if (!message || message.length <= 0) return; // skip

    //Receive a message....
    var message = JSON.parse(message);

    // And send it on..
    //If it's a type "update" - we shouldn't send it
    if(message.type == "update") {
      delete message["type"];
      playerStates[conn.id] = message;
    } else if (message.type == "finishlap"){
      race.finishLap(conn.id, message);
    } else {
      var send = {
        "id" : conn.id,
        "message" : message
      }
      broadcast(JSON.stringify(send));
    }
  }

  var closeConnection = function() {
    delete connections[conn.id];
    delete playerStates[conn.id];

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


// Race stuff starts here
// var tracks = ["moon.png","twitter.png","ampersand.png","oval-8.png","oval.png","turbo-8.png"];
var tracks = ["superjump.png"];

race = {
  mode : "racing",
  totallaps: 4,
  currentlap: 0,
  laptime : 0,
  track: "superjump.png",
  fastestlap: {
    player : "jim",
    time: 1000000000000000000
  },
  modeTiming : {
    "warmup" : 15000,     // pre-race free warmup
    "countdown" : 5000,   // countdown to race
    "over" : 10000        // after the race
  },
  winner : 0,
  startRace: function(){

    this.mode = "racing";
    this.currentlap = 0;

    var send = {
      "message" : {
        "type" : "startrace",
        "totallaps" : this.totallaps
      }
    }
    broadcast_all(JSON.stringify(send));

  },
  finishLap : function(id,message){

    if(this.mode == "racing") {

      var lapfinished = message.laps;


      if( Object.keys(connections).length == 1 ){
        this.currentlap++;
      } else if(lapfinished > this.currentlap) {
        this.currentlap = lapfinished;
      }

      if(this.currentlap > this.totallaps) {
        this.winner = message.driver;
        this.finishRace();
      }

      var send = {
        "message" : {
          "type" : "lapcount",
          "lapcount" : this.currentlap
        }
      }
      broadcast_all(JSON.stringify(send));

    }

  },
  changeTrack : function(){
    var trackCount = tracks.length;
    var random = Math.floor(Math.random() * trackCount);
    this.track = tracks[random];

    console.log("changing track to " + this.track);

    var send = {
      "message" : {
        "type" : "changetrack",
        "track" : this.track
      }
    }
    broadcast_all(JSON.stringify(send));


  },
  startWarmup : function(){
    this.changeTrack();

    var send = {
      "message" : {
        "type" : "startwarmup"
      }
    }
    broadcast_all(JSON.stringify(send));

    setTimeout(function(t){
      return function(){ t.startCountdown(); };
    }(this), this.modeTiming["warmup"]);

  },
  startCountdown : function(){

    var send = {
      "message" : {
        "type" : "startcountdown"
      }
    }
    broadcast_all(JSON.stringify(send));

    setTimeout(function(t){
      return function(){ t.startRace(); };
    }(this), this.modeTiming["countdown"]);

  },
  finishRace : function(){
    this.mode = "over";

    var send = {
      "message" : {
        "type" : "raceover",
        "winner" : this.winner
      }
    }
    broadcast_all(JSON.stringify(send));

    setTimeout(function(t){
      return function(){ t.startWarmup(); };
    }(this), this.modeTiming["over"]);



  }
}

// Welcomes a player to the game
// sends track and player info

function welcomePlayer(conn){

  // Figures out what other players are in the game

  var otherPlayers = [];
  for(var c in connections){
    if(conn.id != connections[c].id){
      otherPlayers.push(connections[c].id);
    }
  }

  var send = {
    "id" : "%s",
    "message" : {
      "type" : "welcome",
      "othercars" : otherPlayers,
      "track" : race.track,
      "totallaps" : race.totallaps,
      "currentlap" : race.currentlap,
      "mode" : race.mode
    }
  }
  send = JSON.stringify(send);
  conn.write(util.format(send, conn.id));

}

module.exports = {
  "server" : socket,
  "broadcast_all" : broadcast_all
}
