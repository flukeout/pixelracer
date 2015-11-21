var cars = [];
var keyboardcar;
var ctx, oscillator,sine, vol; // Audio stuff
var frameAdjuster; // Adjusts speed based on framerate

//Should move this to the race object
var ghostRecording = false;
var ghostData = [];
var ghostFrameIndex = 0;
var ghostPlayData = [];
var updateTime = false;

var scaling = 15;
var canvasTrack, context, trackHeight, trackWidth; //Need to revisit where these go
var time, delta; //keep track of time between laps

var carcolors = ["#FFFFFF"];
var trailcolor;
var leaveSkids = true;

$(document).ready(function(){

  race.startTrial();

  //add this to the fricken car??
  audioStuff();

  $(window).on("keypress", function(e){
    if(e.keyCode == 114){
      race.startTrial();
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

  // startEditor();
});

var race = {
  currentlap: 0,
  laptime : 0,
  bestlap : "",
  prepareTrack: function(track){
    setTimeout(function(){
      prepareTrack(track);
    },500);
  },
  startTrial: function(laps){

    console.log("race.startTrial - begin the single player time trial");

    $(".track-wrapper").css("opacity",0);
    prepareRandomTrack();
    showMessage("do fast laps!");

    //Resets all the the cars in case there are other ones...
    cars = [];
    $(".car").remove();

    var car = newCar("single");
    car.changeDriver("bob");
    car.el.find(".name").remove();
    cars.push(car);
    keyboardcar = car;

    setTimeout(function(){
      spawnCars();
      $(".track-wrapper").css("opacity",1);
    },500);


  },
  finishLap : function(car){

    ghostRecording = true;
    updateTime = false;

    $(".delta-time").show();

    if(this.currentlap == 0) {
      updateTime = true;
    } else {
      setTimeout(function(){
        updateTime = true;
        $(".delta-time").hide();
      },1000);
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
      $(".best-time").text(formatTime(this.bestlap));

      if(this.laptime < this.bestlap){
        this.bestlap = this.laptime;
        ghostPlayData = ghostData;
      }

    }

    if(ghostPlayData.length == 0) {
      ghostPlayData = ghostData;
    }

    ghostData = [];
    ghostFrameIndex = 0;

    this.laptime = 0;
    this.currentlap++;
  }
}


function prepareRandomTrack(){
  console.log("prepareRandomTrack() - picks a track at random and loads it");
  var tracks = ["superjump.png","moon.png","twitter.png","ampersand.png","oval-8.png","oval.png","turbo-8.png"];
  var tracks = ["noirjump.png"];
  var randomTrack = Math.floor(Math.random() * tracks.length);
  var chosenTrack = tracks[randomTrack];

  var trackDefinition = trackDefinitions[chosenTrack];

  if(trackDefinition){
    hexes = trackDefinition.hexes;
    carcolors = trackDefinition.carcolors;
    trailcolor = trackDefinition.trailcolor;
    leaveSkids = trackDefinition.leavekids;
  }

  console.log(chosenTrack);
  prepareTrack(chosenTrack);
}


function gameLoop() {

  var now = new Date().getTime();
  delta = now - (time || now);
  time = now;

  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    driveCar(car);
  }

  race.laptime = race.laptime + delta; //update the race lap timer

  if(updateTime){
    $(".lap-time").text(formatTime(race.laptime));
  }

  tiltTrack();
  window.requestAnimationFrame(gameLoop);
}


function driveCar(car) {

  car.x = Math.round(car.showx / scaling);
  car.y = Math.round(car.showy / scaling);

  car.currentx = car.x;
  car.currenty = car.y;

  var currentPosition = checkPosition(car.x,car.y) || "grass"; //What it's currently sitting on

  if(currentPosition == "turbo") {
    car.speed = car.speed + 4;
  }

  if(car.speed > 10){
    car.speed = 10;
  }

  var xd = 0;
  var yd = 0;

  var speedchange = car.acceleration;

  frameAdjuster = 16.67 / delta;

  speedchange = speedchange * frameAdjuster;

  if(car.gas == "on" && car.speed < car.maxspeed) {
    car.speed = car.speed + speedchange;
  } else if (car.mode == "jumping") {

  } else {
    car.speed = car.speed - speedchange;
  }

  if(car.speed > car.maxspeed) {
    car.speed = car.speed - speedchange;
  }

  if(car.speed < 0){
    car.speed = 0;
  }

  var turnspeed = car.maxspeed - 1; //rate at which the wheel turns

  // var turnspeed = 4; // moon


  var turning = true;

  if(car.mode == "jumping" || car.mode == "frozen") {
    turning = false;
  }

  if(currentPosition == "water"){
    turnspeed = turnspeed / 3;
  }

  var turnchange = car.turnacceleration * frameAdjuster;
  var turnchange = car.turnacceleration;

  if((car.direction == "right" || car.direction == "left") && turning){

    if(car.direction == "left") {
      car.turnvelocity = car.turnvelocity - turnchange;

      if(Math.abs(car.turnvelocity) > turnspeed){
        car.turnvelocity = -1 * turnspeed;
      }

    }

    if(car.direction == "right") {
      car.turnvelocity = car.turnvelocity + turnchange;

      if(car.turnvelocity > Math.abs(turnspeed)){
        car.turnvelocity = turnspeed;
      }
    }

    if(car.angle > 360) {
      car.angle = car.angle - 360;
    }

    if(car.angle < 0){
      car.angle = car.angle + 360;
    }

  } else if (car.direction == "none") {
    if(car.turnvelocity > 0) {
      car.turnvelocity = car.turnvelocity - turnchange;
    }
    if(car.turnvelocity < 0 ){
      car.turnvelocity = car.turnvelocity + turnchange;
    }
  } else if (Math.abs(car.wheelturn) > 0) {

    car.turnvelocity = car.turnvelocity + turnchange;
    turnspeed = turnspeed * car.wheelturn;
    if(car.turnvelocity > turnspeed){
      car.turnvelocity = turnspeed;
    }

  } else if (car.wheelturn == 0) {

    if(car.turnvelocity > 0) {
      car.turnvelocity = car.turnvelocity - turnchange;
    }
    if(car.turnvelocity < 0 ){
      car.turnvelocity = car.turnvelocity + turnchange;
    }

  }

  car.angle = car.angle + car.turnvelocity;

  var adjacent = Math.cos(toRadians(car.angle)) * car.speed;
  var opposite = Math.sin(toRadians(car.angle)) * car.speed;
  var xd = opposite;
  var yd = -1 * adjacent;

  car.nextx = Math.round((car.showx + xd) / scaling);
  car.nexty = Math.round((car.showy + yd) / scaling);

  var nextPosition = checkPosition(car.nextx,car.nexty);

  if(car.currentx != car.nextx || car.currenty != car.nexty){
    if(nextPosition == "tree"){
    }
  }

  // Leave a skid mark on the track
  // If it's on the road - then depends on speed and turning radius
  // If it's not, then just rip it up a bit

  var turnpercent = Math.abs(car.turnvelocity) / 4;
  var speedpercent = car.speed / car.maxspeed;

  if(leaveSkids) {
    if(car.currentx != car.nextx || car.currenty != car.nexty){
      var averagepercent = (speedpercent + turnpercent) / 2 * 100;
      var jam  = -75 + averagepercent;
      var opacity = jam/25 * .1;

      if(currentPosition == "road") {
        ctx.fillStyle = "rgba(0,0,0,"+opacity+")";
        ctx.fillRect(car.currentx * scaling, car.currenty * scaling, scaling, scaling);
      } else {
        ctx.fillStyle = "rgba(0,0,0,.05)";
        ctx.fillRect(car.currentx * scaling, car.currenty * scaling, scaling, scaling);
      }
    }
  }

  //Controls the Skidding volume oscillator, which is always on
  if(turnpercent == 1 && speedpercent > .5) {
    vol.gain.value = .012 * turnpercent || 0;
  } else {
    vol.gain.value = 0;
  }


  var move = true;

  if(car.mode == "frozen"){
    move = false;
  }

  $(".place").css("left",car.x * scaling).css("top",car.y * scaling);

  if(currentPosition == "grass" && car.mode != "jumping"){
    if(car.speed > 1){
      car.speed = 1;
    }
  }

  if(car.mode == "normal") {
    if(currentPosition == "overpass" && nextPosition == "ledge" ) {
      move = false;
    }
    if(currentPosition == "road" && nextPosition == "ledge" ) {
      car.mode = "under";
    }
  } else if (car.mode == "under") {
    if(currentPosition == "overpass" && nextPosition == "road"){
      move = false;
    }
    if(currentPosition == "ledge" && nextPosition == "road") {
      car.mode = "normal";
    }
    if(currentPosition == "ledge" && nextPosition == "grass") {
      move = false;
    }


  }
  //
  if(car.mode == "jumping") {
    move = true;
  }

  if(move){
    car.showx = car.showx + xd;
    car.showy = car.showy + yd;
  } else {
    car.speed = 1;
  }

  var maxfq = 800;
  var minfq = 400;

  if(car.mode == "jumping"){
    maxfq = 0;
  }

  var frequency = minfq + ((car.speed/car.maxspeed) * (maxfq - minfq));

  enginesine.frequency.value = frequency / 10;
  engine.frequency.value = frequency;

  car.el.attr("mode",car.mode);

  if(currentPosition == "finish" && car.angle > 180 && car.angle < 360){
    if(car.currentx != car.nextx) {
      race.finishLap(car);
    }
  }

  if(car.mode == "normal" && currentPosition == "jump" && car.speed > 1) {
    car.jumpElapsed = 0;
    car.jumpTotal = car.speed * scaling / 2.5 ;//jump distance relative to speed
    car.mode = "jumping";
  }



  //Jump the car

  var jumpHeight = 0;
  if(car.mode == "jumping") {
    var maxHeight = car.jumpTotal / scaling;

    if(car.jumpElapsed < car.jumpTotal /2) {
      jumpHeight = easeOutCubic(car.jumpElapsed + 1 , 0, maxHeight , car.jumpTotal/2);
    } else {
      jumpHeight = easeInCubic(car.jumpElapsed - car.jumpTotal/2, maxHeight, -1 * maxHeight, car.jumpTotal/2);
    }

    jumpHeight = jumpHeight * 15;
    car.jumpElapsed++; //moon

    if(car.jumpElapsed >= car.jumpTotal){
      car.mode = "normal";
    }
  }

  if(jumpHeight > 0){
    if(car.currentx != car.nextx || car.currenty != car.nexty){
      var trail = $("<div class='trail'></div>");
      trail.css("background",trailcolor || "#32a6dc")
      trail.height(scaling).width(scaling);
      trail.css("left",car.x * scaling).css("top",car.y * scaling);
      trail.css("transform","translateZ("+ jumpHeight +"px)");
      $(".track").prepend(trail);
      setTimeout(function(el) { return function() { el.remove(); }; }(trail), 400);
    }
  }

  // moves the car holder
  car.el.css("transform", "translateY("+car.showy+"px) translateX("+car.showx+"px)");

  //makes the body jump
  if(currentPosition == "overpass" && car.mode == "normal") {
    car.body.css("transform", "scale(1.1) rotateZ("+car.angle+"deg) translateZ("+jumpHeight+"px");
  } else {
    car.body.css("transform", " rotateZ("+car.angle+"deg) translateZ("+jumpHeight+"px");
  }

  car.shadow.css("transform", "rotateZ("+car.angle+"deg)");

  //Ghost Stuff

  if(ghostRecording){
    ghostData.push({
      "time" : race.laptime,
      "x" : car.showx,
      "y" : car.showy,
      "angle" : car.angle,
      "jumpHeight" : jumpHeight
    })
  }

  if(ghostPlayData.length > 1) {
    for(var i = ghostFrameIndex-1; i < ghostPlayData.length; i++){
      var frame = ghostPlayData[i];
      if(frame){
        if(frame.time >= race.laptime){
          var thisFrame = frame;
          ghostFrameIndex = i;
          break;
        }
      }
    }
  }

  if(thisFrame){
    $(".ghost").css("left", thisFrame.x).css("top", thisFrame.y).css("transform","rotateZ("+thisFrame.angle+"deg)");
    $(".ghost").find(".body").css("transform", "translateZ("+ thisFrame.jumpHeight+"px)");
  }
  // end ghost stuff

}

window.startEditor = function () {
  var inspector = document.querySelector('#inspector');
  var cursor = document.querySelector('#track-editor-cursor');
  var cursorCube = cursor.querySelector('.cube');
  var skidCanvas = document.querySelector('canvas.skids');

  cursor.classList.add('show');
  inspector.classList.add('show');

  skidCanvas.onmousemove = function (e) {
    var fixX = Math.round(e.offsetX/15) * 15;
    var fixY = Math.round(e.offsetY/15) * 15;
    var px = fixX/15;
    var py = fixY/15;
    var mapType = checkPosition(px, py) || '[none]';
    cursorCube.style.transform = 'translate3d(' + fixX + 'px, ' + fixY + 'px, 7px)';
    inspector.innerText = 'P: ' + px + ',' + py + ' => ' + mapType + '';
  };
};
