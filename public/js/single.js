$(document).ready(function(){

  audioStuff(); // build into the car??

  $(window).on("keypress",function(e){
    if(e.keyCode == 114){
      race.quickRestart();
    }
    if(e.keyCode == 99){
      $(".track-chooser").show();
    }
  });

  $(".quick-restart").on("click",function(){
    race.quickRestart();
  })

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

  buildTrackChooser();

  var lastTrack = localStorage.getItem("lastSingleTrack");

  if(!lastTrack){
    $(".track-chooser").show();
  } else {
    race.changeTrack(lastTrack);
    race.startTrial();
  }

  gameLoop();

});

var race = {
  ghostRecording : false,
  ghostData : [],
  tinyGhostData : [],
  ghostFrameIndex : 0,
  ghostPlayData : [],
  updateTime : false,
  currentlap: 0,
  ghostPlaying : false,
  laptime : 0,
  track : "",
  bestlap : "",
  quickRestart : function(){
    spawnCars();
    this.laptime = 0;
    this.currentlap = 0;
    this.ghostRecording = false;
    this.ghostData = [];
    this.updateTime = false;
    this.ghostPlaying = false;

    for(var k in cars){
      var c = cars[k];
      console.log(c);
      c.speed = 0;
      c.mode = "normal";
      c.jumpHeight = 0;
      c.showx = c.showx + 6 * scaling;
    }
  },
  startTrial: function(){

    console.log("race.startTrial() - begin the single player time trial");

    $(".track-wrapper").css("opacity",0);

    showMessage("do fast laps!");

    //Resets all the the cars in case there are other ones...
    cars = [];
    $(".car").remove();

    //Add a new car
    // we need to wait until the track has loaded
    // solving this with a half second delay, but that's not great

    setTimeout(function(){
      var car = newCar("single", {"showname" : false, "trailColor" : trackData.trailcolor});
      cars.push(car);
      keyboardcar = car;
      spawnCars();
      $(".track-wrapper").show();
      $(".track-wrapper").css("opacity",1);
    },500);
  },
  changeTrack: function(trackName){
    console.log("race.changeTrack() - " + trackName);

    $(".track-wrapper").css("opacity",0);
    $(".track-wrapper").hide();
    prepareTrack(trackName);
    localStorage.setItem("lastSingleTrack",trackName);
    this.track = trackName;

    this.laptime = 0;
    this.currentlap = 0;
    this.ghostRecording = false;
    this.ghostData = [];
    this.updateTime = false;
    // end of reset block

    this.resetStandings();
  },
  resetStandings : function(){
    console.log("race.resetStandings()");

    var standingsEl = $(".standings");
    $("body").removeClass("with-standings");

    if(trackTimes[this.track]){
      var times = trackTimes[this.track];
      standingsEl.find(".gold").text(formatTime(times.gold)+"s");
      standingsEl.find(".silver").text(formatTime(times.silver)+"s");
      standingsEl.find(".bronze").text(formatTime(times.bronze)+"s");
      $("body").addClass("with-standings");
    }

  },
  finishLap : function(car){

    //Spit out the 'minified' ghost data
    // console.log(JSON.stringify(race.tinyGhostData));

    console.log("race.finishLap()");

    this.ghostRecording = true;
    this.updateTime = false;
    this.ghostPlaying = true;

    $(".delta-time").show();

    if(this.currentlap == 0) {
      this.updateTime = true;
    } else {
      setTimeout(function(t) {
        return function() {
          t.updateTime = true;
          $(".delta-time").hide();
        };
      }(this), 1000);
    }

    var timeString = "";
    var faster = false;
    $(".delta-time").removeClass("slower").removeClass("faster");

    if(this.currentlap == 1) {
      this.bestlap = this.laptime;
    }

    if(this.currentlap > 0) {

      if(this.laptime - this.bestlap > 0) {
        timeString = timeString + "+";
        $(".delta-time").addClass("slower");
      } else {
        timeString = timeString + "-";
        $(".delta-time").addClass("faster");
      }

      timeString = timeString + formatTime(Math.abs(this.laptime - this.bestlap))

      $(".delta-time").text(timeString);
      $(".best-time-wrapper").show();

      //If person got the best lap
      if(this.laptime < this.bestlap){
        this.bestlap = this.laptime;
        this.ghostPlayData = this.ghostData;
      }

      // Give em the achievemenets....
      // Need to create a data structure that remembers these
      var medalTimes = trackTimes[this.track];
      for(var k in medalTimes){
        if(this.bestlap <= medalTimes[k]){
          $("." + k).addClass("achieved");
          car.showMessage("Got " + k + "!");     //But... only if they already haven't?
        }
      }

      $(".best-time").text(formatTime(this.bestlap));
    }

    if(this.ghostPlayData.length == 0) {
      this.ghostPlayData = this.ghostData;
    }

    this.ghostData = [];
    this.tinyGhostData = [];
    this.ghostFrameIndex = 0;
    this.laptime = 0;
    this.currentlap++;

    trackAnimation();
  }
}

function prepareRandomTrack(){
  console.log("prepareRandomTrack() - picks a track at random and loads it");

  var tracknames = [];
  for(key in trackList){
    tracknames.push(key);
  }

  var randomIndex = Math.floor(Math.random() * tracknames.length);
  var trackName = tracknames[randomIndex];

  trackData = trackList[trackName];
  prepareTrack(trackData.filename);
}

function gameLoop() {

  var now = new Date().getTime();
  delta = now - (time || now);
  time = now;

  //Drive each car
  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    driveCar(car);
  }

  // Ghost Stuff - I SHOULD TAKE THIS OUT OF DRIVECAR

  if(race.ghostRecording){
    race.ghostData.push({
      "time" : race.laptime,
      "x" : keyboardcar.showx,
      "y" : keyboardcar.showy,
      "angle" : keyboardcar.angle,
      "jumpHeight" : car.jumpHeight
    });

    if (car.jumpHeight > 0) {
      car.jumpHeight = car.jumpHeight.toFixed(1);
    }
    // This is that fricken compressed data format attempt....
    race.tinyGhostData.push(race.laptime +","+ keyboardcar.showx.toFixed(1)+","+keyboardcar.showy.toFixed(1)+","+keyboardcar.angle.toFixed(1)+","+car.jumpHeight);

  }

  // PLAY THE GHOST

  if(race.ghostPlayData.length > 1 && race.ghostPlaying) {
    for(var i = race.ghostFrameIndex-1; i < race.ghostPlayData.length; i++){
      var frame = race.ghostPlayData[i];
      if(frame){
        if(frame.time >= race.laptime){
          var thisFrame = frame;
          race.ghostFrameIndex = i;
          break;
        }
      }
    }
  }

  if(thisFrame){
    $(".ghost").show();
    $(".ghost").css("left", thisFrame.x).css("top", thisFrame.y).css("transform","rotateZ("+thisFrame.angle+"deg)");
    $(".ghost").find(".body").css("transform", "translateZ("+ thisFrame.jumpHeight+"px)");
    if(thisFrame.jumpHeight > 0){
      $(".ghost").find(".shadow").show();
    } else {
      $(".ghost").find(".shadow").hide();
    }
  } else {
    $(".ghost").hide();
  }
  // end ghost stuff

  race.laptime = race.laptime + delta; //update the race lap timer

  if(race.updateTime){
    $(".lap-time").text(formatTime(race.laptime));
  } else {
    $(".lap-time").text(formatTime(0));
  }

  tiltTrack();

  window.requestAnimationFrame(gameLoop);
}