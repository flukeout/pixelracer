var sockjs = require('sockjs');
var util = require('util');
var playerStates = {}; //this badboy will keep all the player states
var race = {};

var sockjs_opts = { sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js" };
var connections = {};
var playerStats = {};

function socket(server) {
  var sockjs_socket = sockjs.createServer(sockjs_opts);
  sockjs_socket.on('connection', listener);
  sockjs_socket.installHandlers(server, {prefix:'/echo'});

  function tick() {
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
      playerStats[conn.id].driver = playerStates[conn.id].driver;
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
    delete playerStats[conn.id];

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


var tracks = ["turbo-8.png","noirjump.png","oval.png","superjump.png","twitter.png","ampersand.png","oval-8.png"];
var trackData = {
  "noirjump.png" : {
    "laps" : 3
  },
  "turbo-8.png" : {
    "laps" : 7
  },
  "oval.png" : {
    "laps" : 10
  },
  "superjump.png" : {
    "laps" : 3
  },
  "twitter.png" : {
    "laps" : 3
  },
  "ampersand.png" : {
    "laps" : 4
  },
  "oval-8.png" : {
    "laps" : 10
  }
}
//We can really simply this.. come on.. man.. man....

race = {
  mode : "racing",
  totallaps: 1,
  currentlap: 0,
  laptime : 0,
  currentplace : 1,
  track: "oval.png",
  modeTiming : {
    "warmup" : 15000,     // pre-race free warmup
    "afterFinish" : 5000, // after someone wins, how long the race continues for
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

    console.log(id + " finished a lap");

    //If the leading car finishes a lap, then let the client know the lap has incremented....
    var player = playerStats[id];
    var lapfinished = message.laps;
    player.laps = message.laps;

    if(this.mode == "racing" && player.mode == "racing") {

      if( Object.keys(connections).length == 1 ){
        this.currentlap++;
      } else if(player.laps > this.currentlap) {
        this.currentlap = player.laps;
      }

      var send = {
        "message" : {
          "type" : "lapcount",
          "lapcount" : this.currentlap
        }
      }

      broadcast_all(JSON.stringify(send));

      //When a player finishes....

      if(player.laps > this.totallaps) {
        player.mode = "finished";
        player.place = this.currentplace;
        this.currentplace++;


        if(this.mode == "racing") {

          var send = {
            "message" : {
              "type" : "raceOverCountdown",
              "time" : this.modeTiming["afterFinish"]
            }
          }
          broadcast_all(JSON.stringify(send));

          setTimeout(function(t){
            return function(){ t.finishRace(); };
          }(this), this.modeTiming["afterFinish"]);

          var send = {
            "message" : {
              "type" : "playerfinished",
              "player" : player
            }
          }
          broadcast_all(JSON.stringify(send));
        }
      }

      if(!player.bestlap || player.bestlap > message.laptime){
        player.bestlap = message.laptime;
      }

      if(!player.worstlap || message.laptime > player.worstlap){
        player.worstlap = message.laptime;
      }

    }
  },
  changeTrack : function(){
    console.log("race.changeTrack()");

    var trackCount = tracks.length;
    var foundTrack = false;

    while(foundTrack == false){
      var random = Math.floor(Math.random() * trackCount);
      var newTrack = tracks[random];
      if(newTrack != this.track){
        foundTrack = true;
        this.track = tracks[random];
      }
    }

    var trackConfig = trackData[this.track];
    this.totallaps = trackConfig.laps;

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
    this.currentplace = 1; //Reset the place counter

    //Add up points and reset stuff
    for(var key in playerStats){
      var player = playerStats[key];
      if(player.place == 0){
        player.newPoints = 0;
      } else {
        player.newPoints = Math.round(10/player.place);
      }

      player.totalPoints = player.totalPoints + player.newPoints;
    }

    var send = {
      "message" : {
        "type" : "raceover",
        "winner" : this.winner,
        "stats" : playerStats
      }
    }

    broadcast_all(JSON.stringify(send));

    // Reset player stats
    // Keep points
    for(var key in playerStats){
      var player = playerStats[key];
      player.mode = "racing";
      player.laps = 0;
      player.place = 0;
      delete player.bestlap;
      delete player.worstlap;
    }

    setTimeout(function(t){
      return function(){
        t.startWarmup();
      };
    }(this), this.modeTiming["over"]);

  }
}

// Welcomes a player to the game
// sends track and player info

function welcomePlayer(conn){

  // Figures out what other players are in the game

  playerStats[conn.id] = {
    "laps" : 0,
    "driver" : "unnamed",
    "place" : 0,
    "mode" : "racing",
    "newPoints" : 0,
    "totalPoints" : 0
  };

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
