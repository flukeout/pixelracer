var sockjs_url = '/echo';
var sockjs = new SockJS(sockjs_url);
var myid = 0;

var race = {
  mode : "warmup",
  totallaps: 2,
  currentlap: 0,
  laptime : 0,
  winner : 0,
  prepareTrack: function(track){
    console.log("race.prepareTrack() " + track);
    trackData = trackList[track];
    prepareTrack(trackData.filename);
  },
  welcome : function(details,id){
    console.log("race.welcome()");

    myid = id;

    this.prepareTrack(details.track);


    var car = newCar(id,{"trailColor":trackData.trailcolor});
    car.changeDriver("bob");
    cars.push(car);

    setTimeout(function(){
      spawnCar(car);
    },1000);




    for(var i = 0; i < cars.length; i++){
      if(cars[i].id == id){
        keyboardcar = cars[i];
      }
    }

    for(var i = 0; i < details.othercars.length; i++){
      addOtherCar(details.othercars[i]);
    }

    this.mode = details.mode;
    this.currentlap = details.currentlap;
    this.totallaps = details.totallaps;
    this.updateUI();
  },
  updateUI: function(){
    if(this.mode == "racing"){
      $(".laps .message").hide();
      $(".lap-info").show();
      $(".lap-info .lap-count").text(this.currentlap);
      $(".lap-info .total-laps").text(this.totallaps);
    }
  },
  startWarmup : function(){

    $(".stats-wrapper").hide();

    showMessage("warmup");
    this.mode = "warmup";

    setTimeout(function(){
      spawnCars();
    },1000);

    $(".laps .lap-info").hide();

    setTimeout(function(){
      $(".laps .message").show().text("Warm up");
    },500);

    for(var c in cars) {
      var car = cars[c];
      car.speed = 0;
    }
  },
  startCountdown : function(){

    showMessage("race time!");
    this.mode = "countdown";

    setTimeout(function(){
      spawnCars();
    },1000);


    for(var c in cars) {
      var car = cars[c];
      car.mode = "frozen";
    }

    $(".laps .lap-info").hide();

    $(".laps .message").text("").show();
    setTimeout(function(){  $(".laps .message").text("READY");    },3000);
    setTimeout(function(){  $(".laps .message").text("SET");    },4000);
    setTimeout(function(){  $(".laps .message").text("GO!!!");    },5000);

  },
  updateLap : function(lap){
    console.log("updateLap",lap);

    this.currentlap = lap;

    if(this.mode == "racing") {
      if(this.currentlap >= this.totallaps) {
        $(".lap-info").hide();
        $(".laps .message").show().text("Final Lap!!");
      } else {
        $(".lap-info").show();
        $(".laps .lap-count").text(this.currentlap);
        $(".laps .total-laps").text(this.totallaps);
      }
    }
  },
  playerFinishedRace : function(player){
    console.log("race.playerFinishedRace()");

    var placesuffix = "th";
    if(player.place == 1) {
      placesuffix = "st";
    } else if (player.place == 2) {
      placesuffix = "nd"
    } else if (player.place == 3) {
      placesuffix = "rd"
    }

    var message = player.place + placesuffix + " place - " + player.driver + "!!";
    $(".laps .message").show().text(message);

  },
  startRace: function(laps){

    setTimeout(function(){
      $(".laps .message").hide();
      $(".laps .lap-info").show();
    },1000);

    //Rest all car lap counts
    for(var c in cars){
      var car = cars[c];
      car.laps = 0;
      car.mode = "normal";
    }

    this.totallaps = laps;
    this.currentlap = 0;
    this.mode = "racing";

    $(".laps .lap-count").text(this.currentlap);
    $(".laps .total-laps").text(this.totallaps);

  },
  finishLap : function(car){
    console.log("race.finishLap() " + car.laps);

    var update = {
      "type" : "finishlap",
      "laps" : car.laps,
      "driver" : car.driver,
      "laptime" : car.laptime
    }

    sockjs.send(JSON.stringify(update));
    trackAnimation();
  },
  showStats : function(stats){
    console.log("race.showStats()");
    console.log(stats);

    $(".stats-wrapper .details .detail").remove();
    $(".laps .message").hide();

    $(".stats-wrapper").show();
    $(".stats-wrapper .this-race").show();
    $(".stats-wrapper .overall").hide();

    //Show the overall stats after the race stats
    setTimeout(function(){
      $(".stats-wrapper .this-race").hide();
      $(".stats-wrapper .overall").show();
    },5000)


    // START LAP STATS
    var slowestlap = { time: 0 };
    var fastestlap = { time : 999999999999999999 };

    var playerStandings = [];

    for(var key in stats){
      var player = stats[key];

      if(player.bestlap < fastestlap.time){
        fastestlap.time = player.bestlap;
        fastestlap.driver = player.driver;
      }

      if(player.worstlap > slowestlap.time){
        slowestlap.time = player.worstlap;
        slowestlap.driver = player.driver;
      }

      playerStandings.push(player);

    }

    //Sort results by place!
    playerStandings.sort(function(x,y){
      if(x.place < y.place){
        return -1;
      }
      if(x.place > y.place){
        return 1;
      }
      return 0;
    });


    for(var i = 0; i < playerStandings.length; i++){
      var player = playerStandings[i];
      var details = $("<div class='detail'></div>");
      details.append("<span class='position'>"+player.place+". </span>");
      details.append("<span class='name'>"+player.driver+"</span>");
      details.append("<span class='points'>"+player.newPoints+" pts</span>");
      $(".stats-wrapper .this-race .details").append(details);
    }


    //Sort results by totalpoints!
    // console.log(standings);

    playerStandings.sort(function(x,y){
      if(x.totalPoints > y.totalPoints){
        return -1;
      }
      if(x.totalPoints < y.totalPoints){
        return 1;
      }
      return 0;
    });

    for(var i = 0; i < playerStandings.length; i++){
      var player = playerStandings[i];
      var details = $("<div class='detail'></div>");
      details.append("<span class='name'>"+player.driver+"</span>");
      details.append("<span class='points'>"+player.totalPoints+" pts</span>");
      $(".stats-wrapper .overall .details").append(details);
    }


    $(".stats .fastest-lap .driver").text(fastestlap.driver);
    $(".stats .fastest-lap .time").text(formatTime(fastestlap.time));
    $(".stats .slowest-lap .driver").text(slowestlap.driver);
    $(".stats .slowest-lap .time").text(formatTime(slowestlap.time));


  },
  finishRace : function(winner,stats){
    console.log("race.finishRace() " + winner);
    console.log(stats);

    this.showStats(stats);
    this.mode = "over";
  }
}



var chatting = false;


function sendChat(message){

  var car = getCar(myid);

  var update = {
    "driver" : car.driver,
    "type" : "chat",
    "text": message
  }
  sockjs.send(JSON.stringify(update));

  addChat(car.driver,message);
}


// When a car finishes a lap


$(document).ready(function(){

  audioStuff();

  $(window).on("keypress", function(e){

    if(e.keyCode == 13) {
      if(chatting == false){
        $(".chat-input").show().focus();
        $(".chat-input-wrapper .instructions").hide();
        chatting = true;
      } else if (chatting == true){
        var message = $(".chat-input").val();
        if(message.length > 0){
          sendChat(message);
        }
        $(".chat-input").val("").blur().hide();
        chatting = false;
        $(".chat-input-wrapper .instructions").show();
      }
    }
  });


  $(".driver-name").on("click", function(e){
    $(this).select();
  });

  $(".driver-name").on("keyup", function(e){
    var newName = $(this).val();
    var car = getCar(myid);
    car.changeDriver(newName);
    if(e.keyCode == 13) {
      $(this).blur();
    }
  });



  $(window).on("keydown",function(e){

    if(e.keyCode == 37) {
      keyboardcar.setDirection("steering","left-on");
    }
    if(e.keyCode == 39) {
      keyboardcar.setDirection("steering","right-on");
    }
    if(e.keyCode == 38) {
      keyboardcar.setDirection("gas","on");
    }
  });


  $(window).on("keyup",function(e){
    if(e.keyCode == 37) {
      keyboardcar.setDirection("steering","left-off");
    }
    if(e.keyCode == 39) {
      keyboardcar.setDirection("steering","right-off");
    }
    if(e.keyCode == 38) {
      keyboardcar.setDirection("gas","off");
    }
  });

  gameLoop();

});

function gameLoop() {

  var now = new Date().getTime();
  delta = now - (time || now);
  time = now;

  //Drive each car and send a server update
  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    driveCar(car);
    car.laptime = car.laptime + delta; // update the car lap timer

    var update = {
      "type" : "update",
      "x": car.showx,
      "y": car.showy,
      "gas" : car.gas,
      "driver" : car.driver,
      "rotation" : car.angle,
      "height" : car.jumpHeight,
      "velocity" : car.speed,
      "turnvelocity" : car.turnvelocity
    }

    try {
      sockjs.send(JSON.stringify(update));
    } catch(err) {
      console.log("Couldn't send update to the server!");
    }
  }

  if(othercars){
    updateGhostCars();
  }

  tiltTrack();

  window.requestAnimationFrame(gameLoop);
}

//This checks the playerStates and updates the cars accordingly....
// Except - we need to drive this shit, not just 'update it'
function updateGhostCars(){

  for(var k in othercars){
    var thisState = playerStates[k];

      var c = othercars[k];

      //If there is some new info, that we haven't seen yet.....
      if(thisState){
        c.x =             thisState.x;
        c.y =             thisState.y;
        c.turnvelocity =  thisState.turnvelocity;
        c.driver =        thisState.driver;
        c.velocity =      thisState.velocity;
        c.rotation =      thisState.rotation;
        c.gas =           thisState.gas;
        c.height =        thisState.height || 0;

        delete playerStates[k];

      }

      c.rotation = parseInt(c.rotation) + parseInt(c.turnvelocity);

      if(c.rotation > 360) {
        c.rotation = c.rotation - 360;
      }

      if(c.rotation < 0){
        c.rotation = c.rotation + 360;
      }

      if(c.gas == "on") {
        c.velocity = c.velocity + .06;
        if(c.velocity > 5) {
          c.velocity = 5;
        }
      }

      if(c.gas == "off") {
        c.velocity = c.velocity - .06;
        if(c.velocity < 0){
          c.velocity = 0;
        }
      }

      var opposite = Math.sin(toRadians(c.rotation)) * c.velocity;
      var adjacent = Math.cos(toRadians(c.rotation)) * c.velocity;

      var xd = opposite;
      var yd = -1 * adjacent;

      c.x = parseFloat(c.x) + xd;
      c.y = parseFloat(c.y) + yd;

      if(c.height > 0){
        c.shadow.show();
      } else {
        c.shadow.hide();
      }

      c.el.find(".name").text(c.driver);
      c.el.find(".body").css("transform","rotateZ("+c.rotation+"deg");
      c.shadow.css("transform","translateZ("+ -1 * c.height+"px)");
      c.el.css("transform","translateX("+ c.x +"px) translateY("+c.y+"px) translateZ("+c.height+"px)");
  }
}
