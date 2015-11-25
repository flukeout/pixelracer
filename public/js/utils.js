var scaling = 15;
var othercars = {};
var ctx, oscillator,sine,vol;
var cars = [];
var keyboardcar;
var enginevol;
var time, delta, elapsedTime; //keep track of time between laps
var canvasTrack, context, trackHeight, trackWidth; //Need to revisit where these gos
var trackData = {};

// filename
// carcolors
// trailcolor
// leaveskids
// hexes
// startPositions - added by prepareTrack()
// laps

function showMessage(message){
  console.log("showMessage() - " + message);
  $(".game-message").css("opacity",1);

  setTimeout(function(){
    $(".game-message .message").html(message).css("opacity",1);
  },500);

  setTimeout(function(){
    $(".game-message .message").css("opacity",0);
  },1500);

  setTimeout(function(){
    $(".game-message").css("opacity",0);
  },2000);
}


function audioStuff(){
  // create web audio api context
  var context = new AudioContext();

  vol = context.createGain();
  vol.gain.value = 0;
  vol.connect(context.destination);

  oscillator = context.createOscillator();
  oscillator.connect(vol);
  oscillator.type = 'square';
  oscillator.frequency.value = 1200; // value in hertz
  // oscillator.start(0);

  sine = context.createOscillator();
  sine.type = 'square';
  sine.frequency.value = 20;
  // sine.start(0);

  var sineGain = context.createGain();
  sineGain.gain.value = 10;

  sine.connect(sineGain);
  sineGain.connect(oscillator.frequency);

  // ENGINE

  enginevol = context.createGain();
  enginevol.gain.value = .15;
  enginevol.connect(context.destination);

  engine = context.createOscillator();
  engine.connect(enginevol);
  engine.type = 'sine';
  engine.frequency.value = 440; // value in hertz
  // engine.start(0);


  enginesine = context.createOscillator();
  enginesine.type = 'sine';
  enginesine.frequency.value = 40;
  // enginesine.start(0);

  var sineGainba = context.createGain();
  sineGainba.gain.value = 400;

  enginesine.connect(sineGainba); //connecxts the sine wave to the gain
  sineGainba.connect(engine.frequency);
}


function trackAnimation(){
  $(".track-wrapper").addClass("trackpop");

  $(".finish-line").removeClass("finishpop");
  $(".finish-line").width($(".finish-line").width());
  $(".finish-line").addClass("finishpop");

  setTimeout(function(){
    $(".track-wrapper").removeClass("trackpop");
  },200);
}

// var tracks = ["moon.png","twitter.png","ampersand.png","oval-8.png","oval.png","turbo-8.png"];
// var tracks = ["floppy.png"];


function prepareTrack(level){
  canvasTrack = $("canvas.track-source");
  context = canvasTrack[0].getContext("2d");

  var image = new Image();
  $("body").append(image);
  $(image).hide();
  image.src = '/tracks/' + level;

  $(".track").css("background-image", "url(/tracks/"+level+")");

  $(image).on("load",function(){

    $(".lamp, .tree, .windmill").remove();

    context.drawImage(image, 0, 0);

    trackHeight = $(this).height();
    trackWidth = $(this).width();
    $(".track").height(trackHeight * scaling);
    $(".track").width(trackWidth * scaling);
    canvasTrack.height(trackHeight);
    canvasTrack.width(trackWidth);

    // Set up the skid canvas
    var skidCanvas = $(".skids");
    ctx = skidCanvas[0].getContext("2d");
    skidCanvas.attr("width", trackWidth * scaling).attr("height",trackHeight * scaling);

    var bodyHeight = $("body").height();
    var offset = (bodyHeight - $(".track-wrapper").height())/2;
    // $(".track-wrapper").css("margin-top",offset - 50);

    // var coin = $("<div class='coin'><div class='vert'></div></div>");
    // $(".track").append(coin)
    // coin.css("left", scaling * 5);
    // coin.css("top", scaling * 5);

    trackData.startPositions = [];

    for(var i = 0; i < parseInt(trackWidth); i++){
      for(var j = 0; j < parseInt(trackHeight); j++){
        var result = checkPosition(i,j);

        if(result == "finish"){
          trackData.startPositions.push({"x": i, "y" : j});
        }

        if(result == "lamp"){
          var lamp = $("<div class='lamp'></div>");
          $(".track").append(lamp)
          lamp.css("left", scaling * (i - 1));
          lamp.css("top", scaling * (j - 4));
        }

        if(result == "windmill"){
          var el = $("<div class='windmill'><div class='prop'></div>");
          $(".track").append(el)
          el.css("left", scaling * (i - 1));
          el.css("top", scaling * (j - 3));
        }

        if(result == "tree"){
          var tree = $("<div class='tree'></div>");
          $(".track").append(tree)
          tree.css("left", scaling * (i - 1));
          tree.css("top", scaling * (j - 4));
        }

      }
    }

    addFinishLine();

  });

}

function addFinishLine(){
  console.log("addFinishline() - utils.js");

  $(".track").remove(".finish-line");

  //This is such garbage... come on.
  var startX = 999999999;
  var endX = -1;
  var startY = 999999999;
  var endY = -1;

  var sP = trackData.startPositions;

  for(i = 0; i < sP.length; i++){
    if(sP[i].x < startX) {
      startX = sP[i].x
    }
    if(sP[i].x > endX) {
      endX = sP[i].x
    }

    if(sP[i].y < startY) {
      startY = sP[i].y
    }
    if(sP[i].y > endY) {
      endY = sP[i].y
    }
  }


  var finishColor = "orange";
  var roadColor = "pink";

  for(var k in trackData.hexes){
    if(trackData.hexes[k] == "road"){
      roadColor = k;
    }
    if(trackData.hexes[k] == "finish"){
      finishColor = k;
    }
  }

  var finishLine = $("<div class='finish-line'><div class='line'></div></div>");
  $(".track").append(finishLine);
  finishLine.css("top",startY * scaling).css("left",startX * scaling).height((endY - startY + 1) * scaling).width(scaling);
  finishLine.find(".line").css("background",finishColor);
  finishLine.css("background",roadColor);
  finishLine.css("border-color",roadColor);
}


function getCar(id){
  var foundcar;
  for(var c in cars){
    var car = cars[c];
    if(car.id == id){
      foundcar = car;
    }
  }
  return foundcar;
}

function easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
}

function easeInCubic(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * Math.pow(currentIteration / totalIterations, 3) + startValue;
}

function checkPosition(x,y){
  var p = context.getImageData(x, y, 1, 1).data;
  var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  return trackData.hexes[hex];
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

function tiltTrack(){

  //Tilts the track according to where all the cars are

  var xtotal = 0;
  var ytotal = 0;

  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    xtotal = xtotal + car.x;
    ytotal = ytotal + car.y;
  }

  var xavg = xtotal / cars.length || 0;
  var yavg = ytotal / cars.length || 0;
  var xdeg = 5 * (-1 + (2 * xavg / trackWidth));
  var ydeg = 45 + 5 * (1 - (2 * yavg / trackHeight));
  $(".track").css("transform","rotateX(" +ydeg+"deg) rotateY("+xdeg+"deg)");
}

function formatTime(total){
  var ms = Math.floor(total / 10 % 100);
  if(ms < 10){
    ms = "0" + ms;
  }
  var sec = Math.floor(total / 1000 % 60);

  return sec + "." + ms;
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}


function spawnCars(){
  console.log("spawnCars() - placing cars near start line");
  for(var c in cars) {
    var car = cars[c];
    spawnCar(car);
  }


}

function spawnCar(car){
  console.log("spawnCar() - spawning individual car");
  car.angle = 270;
  var random = Math.floor(Math.random() * trackData.startPositions.length);

  car.body.css("background",trackData.carcolors[0]);
  car.nameEl.css("color",trackData.carcolors[0]);
  car.trailColor = trackData.trailcolor;

  $(".ghost").find(".body").css("background",trackData.carcolors[0]);

  car.x = trackData.startPositions[random].x + 2;
  car.y = trackData.startPositions[random].y;
  car.showx = car.x * scaling;
  car.showy = car.y * scaling;
}

function driveCar(car) {

  car.x = Math.round(car.showx / scaling);
  car.y = Math.round(car.showy / scaling);

  //Only check the terain if we've moved pixels...

  if(car.x != car.lastx || car.y != car.lasty) {
    car.currentPosition = checkPosition(car.x,car.y) || "grass";
  }

  // SPEED
  if(car.currentPosition == "turbo") {
    car.speed = car.speed + 4;
  }

  if(car.speed > car.maxAbsoluteSpeed){
    car.speed = car.maxAbsoluteSpeed;
  }

  var speedchange = car.acceleration;
  var frameAdjuster = 16.67 / delta;

  speedchange = speedchange * frameAdjuster;

  // If gas is on, make it faster - otherwise slow it down

  if(car.gas == "on" && car.speed <= car.maxspeed) {
    car.speed = car.speed + speedchange;
  } else if (car.mode == "jumping") {
    //no change to car speed
  }
  else {
    car.speed = car.speed - speedchange;
  }

  // car.maxspeed = car.maxspeed + car.maxspeedModifier;

  console.log(car.maxspeed);

  if(car.speed > car.maxspeed) {
    car.speed = car.speed - speedchange;
  }

  if(car.speed < 0){
    car.speed = 0;
  }

  // CAR TURNING



  // Rate at which the car turns
  // var turnspeed = car.maxspeed - 1;
  var turnspeed = 4;
  var turning = true;

  if(car.mode == "jumping" || car.mode == "frozen") {
    turning = false;
  }

  if(car.currentPosition == "water"){
    turnspeed = turnspeed / 3;
  }

  var turnchange = car.turnacceleration * frameAdjuster;

    if(car.direction == "right" || car.direction == "left"){
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
    } else if (car.direction == "none" || car.wheelturn == 0) {
      if(car.turnvelocity > 0) {
        car.turnvelocity = car.turnvelocity - turnchange;
        if(car.turnvelocity < 0){
          car.turnvelocity = 0;
        }
      }
      if(car.turnvelocity < 0 ){
        car.turnvelocity = car.turnvelocity + turnchange;
        if(car.turnvelocity > 0){
          car.turnvelocity = 0;
        }
      }
    } else if (Math.abs(car.wheelturn) > 0) {
      car.turnvelocity = car.turnvelocity + turnchange;
      turnspeed = turnspeed * car.wheelturn;
      if(car.turnvelocity > turnspeed){
        car.turnvelocity = turnspeed;
      }
    }

    if(turning) {
      car.angle = car.angle + car.turnvelocity;
    }

    if(car.angle > 360) {
      car.angle = car.angle - 360;
    }
    if(car.angle < 0){
      car.angle = car.angle + 360;
    }
  // END TURNING


  //GRASS SPEED
  if(car.currentPosition == "grass" && car.mode != "jumping"){
    car.maxspeed = 2;
    if(car.speed > 2){
      car.speed = 2;
    }
  } else {
    car.maxspeed = 5;
  }

  // CAR POSITION

  var adjacent = Math.cos(toRadians(car.angle)) * car.speed;
  var opposite = Math.sin(toRadians(car.angle)) * car.speed;
  var xd = opposite;
  var yd = -1 * adjacent;

  car.nextx = Math.round((car.showx + xd) / scaling);
  car.nexty = Math.round((car.showy + yd) / scaling);

  var movedPixelPosition = false;

  var nextPosition;
  if(car.x != car.nextx || car.y != car.nexty) {
    movedPixelPosition = true;
  }

  if(movedPixelPosition) {
    nextPosition = checkPosition(car.nextx,car.nexty);
  } else {
    nextPosition = car.currentPosition;
  }
  //Write down the old position
  car.lastx = car.x;
  car.lasty = car.y;


  // CAR SKIDS

  // Leave a skid mark on the track
  // If it's on the road - then depends on speed and turning radius
  // If it's not, then just rip it up a bit

  var turnpercent = Math.abs(car.turnvelocity) / 4;
  var speedpercent = car.speed / car.maxspeed;

  if(trackData.leaveSkids) {
    if(car.x != car.nextx || car.y != car.nexty){
      var averagepercent = (speedpercent + turnpercent) / 2 * 100;
      var jam  = -75 + averagepercent;
      var opacity = jam/25 * .1;
      if(opacity > .12){
        opacity = .12;
      }
      if(car.currentPosition == "road" || car.currentPosition == "overpass") {
        ctx.fillStyle = "rgba(0,0,0,"+opacity+")";
        ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
      } else {
        ctx.fillStyle = "rgba(0,0,0,.05)";
        ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
      }
    }
  }

  // CAR SKID SOUND

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


  if(car.mode == "normal") {
    if(car.currentPosition == "overpass" && nextPosition == "ledge" ) {
      move = false;
    }
    if(car.currentPosition == "road" && nextPosition == "ledge" ) {
      car.mode = "under";
    }
  } else if (car.mode == "under") {
    if(car.currentPosition == "overpass" && nextPosition == "road"){
      move = false;
    }
    if(car.currentPosition == "ledge" && nextPosition == "road") {
      car.mode = "normal";
    }
    if(car.currentPosition == "ledge" && nextPosition == "grass") {
      move = false;
    }
  }

  if(move){
    car.showx = car.showx + xd;
    car.showy = car.showy + yd;
  } else {
    car.speed = 1;
  }


  // CAR ENGINE

  var maxfq = 800;
  var minfq = 400;

  if(car.mode == "jumping"){
    maxfq = 0;
  }

  var frequency = minfq + ((car.speed/car.maxspeed) * (maxfq - minfq));

  enginesine.frequency.value = frequency / 10;
  engine.frequency.value = frequency;

  car.el.attr("mode",car.mode);

  if(car.currentPosition == "finish" && car.angle > 180 && car.angle < 360){
    if(car.x != car.nextx) {
      car.laps++;
      race.finishLap(car);
      car.laptime = 0;
    }
  }

  if(car.mode == "normal" && car.currentPosition == "jump" && car.speed >= car.minJumpSpeed) {
    car.jumpElapsed = 0;
    car.jumpTotal = car.speed * scaling / 2.5 ;//jump distance relative to speed
    car.mode = "jumping";
  }

  //Jump the car

  car.jumpHeight = 0;

  if(car.mode == "jumping") {
    var maxHeight = car.jumpTotal / scaling;

    if(car.jumpElapsed < car.jumpTotal /2) {
      car.jumpHeight = easeOutCubic(car.jumpElapsed + 1 , 0, maxHeight , car.jumpTotal/2);
    } else {
      car.jumpHeight = easeInCubic(car.jumpElapsed - car.jumpTotal/2, maxHeight, -1 * maxHeight, car.jumpTotal/2);
    }

    car.jumpHeight = car.jumpHeight * scaling;
    car.jumpElapsed++; //moon

    if(car.jumpElapsed >= car.jumpTotal){
      car.mode = "normal";
    }
  }

  // CAR JUMP TRAIL
  if(car.jumpHeight > 0){
    if(car.x != car.nextx || car.y != car.nexty){
      var trail = $("<div class='trail'></div>");
      trail.css("background",car.trailColor || "#32a6dc")
      trail.height(scaling).width(scaling);
      trail.css("left",car.x * scaling).css("top",car.y * scaling);
      trail.css("transform","translateZ("+ car.jumpHeight +"px)");
      $(".track").prepend(trail);
      setTimeout(function(el) { return function() { el.remove(); }; }(trail), 400);
    }
  }

  // moves the car holder
  car.el.css("transform", "translateY("+car.showy+"px) translateX("+car.showx+"px)");

  //makes the body jump
  if(car.currentPosition == "overpass" && car.mode == "normal") {
    car.body.css("transform", "scale(1.1) rotateZ("+car.angle+"deg) translateZ("+car.jumpHeight+"px");
  } else {
    car.body.css("transform", " rotateZ("+car.angle+"deg) translateZ("+car.jumpHeight+"px");
    car.nameEl.css("transform", "translateZ("+ parseInt(38 + car.jumpHeight) + "px) rotateX(-70deg)");
  }

  car.shadow.css("transform", "rotateZ("+car.angle+"deg)");
}

function newCar(id,config){

  var carconfig = config || {};

  var car = {
    id : id,
    x : 0,
    y : 0,
    showx : 410,
    showy : 230,
    nextx :0,
    nexty : 0,
    lastx : 0,
    lasty : 0,
    mode: "normal",
    driver : "Bob",
    showname : true,
    laps : 0,
    wheelturn : false,
    maxspeed : 5,
    maxspeedModifier : 0,
    maxAbsoluteSpeed : 10,
    direction : "none",
    speed : 0,
    trailColor : "#ffffff",
    bestlap : 0,
    laptime: 0,
    height: 0,
    jumpElapsed: 0,
    jumpTotal: 0,
    jumpHeight : 0,
    minJumpSpeed : 2.5,
    angle: 270,
    acceleration : .06,
    turnacceleration: .5,
    turnvelocity : 0, // Max turn per frame
    gas : "off",
    left : "off",
    right : "off"
  };

  // Updates car defaults based on what is passed in
  for(var key in carconfig){
    car[key] = carconfig[key];
  }

  //Limit the driver name to 3 uppercase letters
  car.changeDriver = function(name){
    car.driver = name.substr(0,3).toUpperCase();
    car.el.find(".name").text(car.driver);

    if(car.id == myid){
      localStorage.setItem("drivername", car.driver);
    }

    $(".driver-name").val(car.driver);
  }

  //SHOW A CHAT MESSAGE
  car.showMessage = function(message){

    car.el.find(".name").css("opacity",0);
    var messageEl = $("<div class='message'>"+message+"</div>");
    car.el.prepend(messageEl);
    setTimeout(function(el) {
      return function() {
        el.parent().find(".name").css("opacity",.8);
        el.remove();
      };
    }(messageEl), 2000);
  }

  car.setDirection = function(action, direction){

    if(action == "steering") {

      if(direction == "right-on"){
        this.right = "on";
        if(this.direction == "none") {
          this.direction = "right";
        } else if (this.direction == "left") {
          this.direction = "none";
        }
      }

      if(direction == "right-off"){
        this.right = "off";
        if(this.left == "on") {
          this.direction = "left";
        } else {
          this.direction = "none";
        }
      }

      if(direction == "left-on"){
        this.left = "on";
        if(this.direction == "none") {
          this.direction = "left";
        } else if (this.direction == "right") {
          this.direction = "none";
        }
      }

      if(direction == "left-off"){
        this.left = "off";
        if(this.right == "on") {
          this.direction = "right";
        } else {
          this.direction = "none";
        }
      }
    }

    if(action == "gas"){
      this.gas = direction;
    }
  }

  car.el = $("<div class='car'></div>");
  car.el.width(scaling);
  car.el.height(scaling);

  $(".track").append(car.el)

  var nameEl = $("<div class='name'>" + car.driver + "</div>");
  car.nameEl = nameEl;

  if(car.showname){
    car.el.append(car.nameEl);
  }

  var shadow = $("<div class='shadow'></div>");
  car.shadow = shadow;

  var body = $("<div class='body'></div>");
  car.body = body;

  var randomColor = Math.floor(Math.random() * trackData.carcolors.length);

  var chosenColor = trackData.carcolors[randomColor]

  car.body.css("background", chosenColor);

  car.el.append(shadow);
  car.el.append(body);

  return car;
}