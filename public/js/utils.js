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


function trackAnimation(type){
  console.log("utils.trackAnimation("+type+")");
  if(type == "pop") {
    $(".track-wrapper").addClass("trackpop");
    setTimeout(function(){
      $(".track-wrapper").removeClass("trackpop");
    },200);
  }

  if(type == "finish") {
    $(".track-wrapper").addClass("trackpop");
    $(".finish-line").removeClass("finishpop");
    $(".finish-line").width($(".finish-line").width());
    $(".finish-line").addClass("finishpop");

    setTimeout(function(){
      $(".track-wrapper").removeClass("trackpop");
    },200);
  }

}

function prepareTrack(level){
  console.log("utils.prepareTrack("+level+")");
  canvasTrack = $("canvas.track-source");
  context = canvasTrack[0].getContext("2d");

  trackData = trackList[level];

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
    trackData.checkpointPositions = [];

    for(var i = 0; i < parseInt(trackWidth); i++){
      for(var j = 0; j < parseInt(trackHeight); j++){
        var result = checkPosition(i,j);

        if(result == "finish"){
          trackData.startPositions.push({"x": i, "y" : j});
        }

        if(result == "checkpoint"){
          trackData.checkpointPositions.push({"x": i, "y" : j});
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


    makeCheckpoints();
    addFinishLine();

  });

}

function makeCheckpoints(){
  console.log("makeCheckpoints()");

  id = 1;

  for(var i = 0; i < trackData.checkpointPositions.length; i++){
    var p = trackData.checkpointPositions[i];

    if(p.id == undefined) {
      p.id = id;
      id++;
    }

    for(var j = 0; j < trackData.checkpointPositions.length; j++){
      var q = trackData.checkpointPositions[j];
      if(i != j) {
        if((p.x == q.x && p.y + 1 == q.y) || (p.y == q.y && p.x + 1 == q.x)) {
          q.id = p.id;
        }
      }
    }
  }


  trackData.checkPoints = id - 1;

}


function addFinishLine(){
  console.log("addFinishline() - utils.js");

  $(".track .finish-line").remove();



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
  finishLine.css("top",startY * scaling).css("left",startX * scaling).height((endY - startY + 1) * scaling).width(scaling);
  finishLine.find(".line").css("background",finishColor);
  finishLine.css("background",roadColor);
  finishLine.css("border-color",roadColor);
  $(".track").append(finishLine);
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
  if(hex == "#000000") {
    return "void";
  } else {
    return trackData.hexes[hex];
  }
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

function spawnCar(car,x,y,angle){

  console.log("spawnCar("+x,y+") - spawning individual car");
  if(angle == undefined) {
    car.angle = 270;
  } else {
    car.angle = angle;
  }

  var random = Math.floor(Math.random() * trackData.startPositions.length);

  car.body.css("background",trackData.carcolors[0]);
  car.nameEl.css("color",trackData.carcolors[0]);
  car.trailColor = trackData.trailcolor;

  car.speed = 0;
  car.crashed = false;
  car.xRotation = 0;
  car.yRotation = 0;
  car.zRotation = 0;
  car.xRotationSpeed = 0;
  car.yRotationSpeed = 0;
  car.zRotationSpeed = 0;
  car.mode = "normal";
  car.zPosition = 100;
  car.laps = 0;

  $(".ghost").find(".body").css("background",trackData.carcolors[0]);

  // Place it where you're told, otherwise behind the start line
  if(x != undefined && y != undefined){
    car.x = x;
    car.y = y;
  } else {
    car.x = trackData.startPositions[random].x + 4;
    car.y = trackData.startPositions[random].y;
  }
  car.showx = car.x * scaling;
  car.showy = car.y * scaling;
}

function driveCar(car) {

  car.x = Math.round(car.showx / scaling);
  car.y = Math.round(car.showy / scaling);

  //Only check the current terrIain if we are on a new pixel

  movedPixels = false;

  if(car.x != car.lastx || car.y != car.lasty) {
    movedPixels = true;
  }

  if(movedPixels) {
    car.currentPosition = checkPosition(car.x,car.y) || "grass";
    if(car.mode != "crashed" && car.mode != "gone" && car.mode != "jumping" && car.zPosition == 0){
      car.positionHistory.push({x : car.x, y: car.y, angle : car.angle});
      if(car.positionHistory.length  > 10) {
        car.positionHistory.shift();
      }
    }
  }

  if(car.currentPosition == "checkpoint") {
    for(var i = 0; i < trackData.checkpointPositions.length; i++){
      var p = trackData.checkpointPositions[i];
      if(car.x == p.x && car.y == p.y) {
        if(car.checkpoints.indexOf(p.id) < 0){
          car.checkpoints.push(p.id);
        }
      }
    }
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
  } else if (car.mode == "crashed") {

  } else {
    if(car.speed > 0) {
      car.speed = car.speed - speedchange;
    }
    if(car.speed < 0) {
      car.speed = car.speed + speedchange;
    }
  }



  // CAR TURNING
  var turnspeed = 4;
  var turning = car.maxspeed - 1;

  if(car.zPosition > 0 || car.zPosition < 0 || car.mode == "frozen" || car.mode == "crashed") {
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
  if(car.currentPosition == "grass" && car.zPosition == 0){
    car.maxspeed = 2;
    if(car.speed > 2){
      car.speed = 2;
    }

    if(movedPixels && trackData.lawnmower) {
      for(var i = 0; i < 2; i++){
        makeParticle(car.x, car.y, car.speed, car.angle, "grass");
      }
    }

  } else {
    car.maxspeed = 5;
  }

  // CAR POSITION
  var done = false;
  // this should be more like the vectors of
  while(done == false) {

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

    //If the next position is a wall, then add the bump off
    //and re-check the next position
    if(nextPosition == "wall" && car.zPosition == 0 && car.speed < 4.5 && car.mode != "crashed") {
      var direction = "forward";
      if(car.speed < 0){
        direction = "backwards";
      }
      if(direction == "forward") {
        car.speed = -2;
      } else {
        car.speed = 2;
      }
    } else {
      done = true;
    }
  }

  //Write down the old position
  car.lastx = car.x;
  car.lasty = car.y;

  if(nextPosition == "wall" && car.zPosition == 0){

    if(car.speed >= 4.5 ) {

      car.zVelocity =  .7 * car.speed; // .5 car speed for normal jump
      car.speed = car.speed * .5;
      car.mode = "crashed";

      car.xRotationSpeed = getRandom(8,16);
      car.yRotationSpeed = getRandom(1,3);
      car.zRotationSpeed = getRandom(1,3);

      for(var j = 0; j < 10; j++){
        makeParticle(car.x, car.y, car.speed, car.angle);
      }

      trackAnimation("pop");

    }
  }

  // CAR SKIDS
  // Leave a skid mark on the track
  // If it's on the road - then depends on speed and turning radius
  // If it's not, then just rip it up a bit

  if(movedPixels){
    if(trackData.leaveSkids && car.mode != "jumping" && car.zPosition == 0) {
      var turnpercent = Math.abs(car.turnvelocity) / 4;
      var speedpercent = car.speed / car.maxspeed;
      var averagepercent = (speedpercent + turnpercent) / 2 * 100;
      var jam  = -75 + averagepercent;
      var opacity = jam/25 * .1;
      if(opacity > .12){
        opacity = .12;
      }
      if(car.currentPosition == "road" || car.currentPosition == "overpass" || car.currentPosition == "checkpoint") {
        ctx.fillStyle = "rgba(0,0,0,"+opacity+")";
        ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
      } else if (car.currentPosition == "grass"){
        ctx.fillStyle = "rgba(0,0,0,.05)";
        ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
      }
    }
  }

  // CAR SKID SOUND

  //Controls the Skidding volume oscillator, which is always on
  // if(turnpercent == 1 && speedpercent > .5) {
  //   vol.gain.value = .012 * turnpercent || 0;
  // } else {
  //   vol.gain.value = 0;
  // }


  var move = true;

  if(car.mode == "frozen"){
    move = false;
  }

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

  car.el.attr("mode",car.mode);

  if(move){
    car.showx = car.showx + xd;
    car.showy = car.showy + yd;
  } else {
    car.speed = 1;
  }

  // CAR ENGINE
  // var maxfq = 800;
  // var minfq = 400;
  //
  // if(car.mode == "jumping"){
  //   maxfq = 0;
  // }
  //
  // var frequency = minfq + ((car.speed/car.maxspeed) * (maxfq - minfq));
  //
  // enginesine.frequency.value = frequency / 10;
  // engine.frequency.value = frequency;
  // car.el.attr("mode",car.mode);

  if(car.currentPosition == "finish" && car.mode != "jumping" && car.angle > 180 && car.angle < 360){
    if(car.x != car.nextx) {
      race.finishLap(car);
      car.laptime = 0;
    }
  }

  //JUMPING
  if(car.currentPosition == "jump" && car.speed >= car.minJumpSpeed && car.zPosition == 0){
    car.zVelocity = .5 * car.speed; // .5 car speed for normal jump
    car.mode = "jumping";
  }

  //Apply any car rotations if the car is flyin'....
  if(car.zPosition > 0 || car.zPosition < 0) {
    car.xRotation = car.xRotation + car.xRotationSpeed;
    car.yRotation = car.yRotation + car.yRotationSpeed;
    car.zRotation = car.zRotation + car.zRotationSpeed;
  }

  if(car.currentPosition == "void" || car.zPosition > 0) {
    car.zVelocity = car.zVelocity - car.gravity
  }

  car.zPosition = car.zPosition + car.zVelocity;

  if(car.zPosition < 0 && car.currentPosition == "void") {
    if(car.mode != "gone") {
      if(!car.respawning){
        car.respawn();
        car.respawning = true;
      }
    }
    car.mode = "gone";
  } else {

  }

  if(car.zPosition < 0){
    car.shadow.hide();
  } else {
    car.shadow.show();
  }

  // Safe Landing
  if(car.zPosition < 0 && car.zVelocity < 0 && car.mode != "gone" && car.mode != "crashed"){
    console.log("safe landing");
    car.mode = "normal";
    car.zPosition = 0;
    car.zVelocity = 0;
    car.zRotation = 0;
    car.xRotation = 0;
    car.yRotation = 0;
  }

  // Crash landing
  if(car.zPosition < 0 && car.zVelocity < 0 && car.mode != "gone" && car.mode == "crashed"){
    car.zPosition = 0;
    car.speed = 0;
    car.zRotationSpeed = 0;
    car.xRotationSpeed = 0;
    car.yRotationSpeed = 0;
    if(!car.respawning){
      car.respawn();
      car.respawning = true;
    }
  }

  // CAR JUMP TRAIL
  if(movedPixels){
    if(car.zPosition > 0 && car.mode != "crashed"){
      var trail = $("<div class='trail'></div>");
      trail.css("background",car.trailColor || "#32a6dc")
      trail.height(scaling).width(scaling);
      trail.css("left",car.x * scaling).css("top",car.y * scaling);
      trail.css("transform","translateZ("+ car.zPosition +"px)");
      $(".track").append(trail); // <- gotta figure this out i guess
      setTimeout(function(el) { return function() { el.remove(); }; }(trail), 400);
    }
  }

  // moves the car holder
  car.el.css("transform", "translateY("+car.showy+"px) translateX("+car.showx+"px)");

  //makes the body jump
  if(car.currentPosition == "overpass" && car.mode == "normal") {
    car.jumper.css("transform", "scale(1.1) rotateZ("+car.angle+"deg) translateZ("+car.zPosition+"px");
    car.body.css("transform", "rotateZ("+car.zRotation+"deg)");
  } else {
    car.jumper.css("transform", " rotateZ("+car.angle+"deg) translateZ("+car.zPosition+"px");
    car.body.css("transform", "rotateX("+car.xRotation+"deg) rotateY("+car.yRotation+"deg) rotateZ("+car.zRotation+"deg)");
    car.nameEl.css("transform", "translateZ("+ parseInt(38 + car.zPosition) + "px) rotateX(-70deg)");
  }

  car.shadow.css("transform", "rotateZ("+car.angle+"deg)");
}

function newCar(id,config){

  var carconfig = config || {};

  var car = {
    id : id,
    x : 0,
    checkpoints : [],
    y : 0,
    crashed : false,
    showx : 410,
    xRotationSpeed : 0,
    yRotationSpeed : 0,
    zRotationSpeed : 0,
    showy : 230,
    nextx :0,
    nexty : 0,
    lastx : 0,
    lasty : 0,
    zRotation : 0,
    xRotation: 0,
    yRotation: 0,
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
    zVelocity : 0,
    zPosition : 0,
    gravity : .180,
    minJumpSpeed : 2.5,
    angle: 270,
    acceleration : .06,
    turnacceleration: .5,
    turnvelocity : 0,
    gas : "off",
    left : "off",
    right : "off",
    positionHistory : []
  };

  // Updates car defaults based on what is passed in
  for(var key in carconfig){
    car[key] = carconfig[key];
  }

  car.respawn = function(){
    setTimeout(function(c){
      return function() {
        var x = c.positionHistory[0].x;
        var y = c.positionHistory[0].y;
        var angle = c.positionHistory[0].angle;
        c.respawning = false;
        if(car.mode != "normal") {
          spawnCar(c,x,y,angle);
        }
      };
    }(this), 500);
  }

  // Limit the driver name to 3 uppercase letters
  car.changeDriver = function(name){
    car.driver = name.substr(0,3).toUpperCase();
    car.el.find(".name").text(car.driver);
    if(car.id == myid){
      localStorage.setItem("drivername", car.driver);
    }
    $(".driver-name").val(car.driver);
  }

  // SHOW A CHAT MESSAGE
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

  var jumper = $("<div class='jumper'></div>");
  car.jumper = jumper;

  car.jumper.append(body);

  var randomColor = Math.floor(Math.random() * trackData.carcolors.length);

  var chosenColor = trackData.carcolors[randomColor]

  car.body.css("background", chosenColor);

  car.el.append(shadow);
  car.el.append(jumper);

  return car;
}

function buildTrackChooser(){
  console.log("buildTrackChooser()");

  for(var k in trackList){
    var track = trackList[k];

    var trackOption = $("<div class='track-option' track='"+track.filename+"'></div>");

    var trackThumb = $("<div class='track-thumbnail'><img src='/tracks/"+track.filename+"'/></div>");
    trackOption.append(trackThumb);

    var trackName = $("<div class='track-name'>" + track.filename + "</div>");
    trackOption.append(trackName);

    var medals = $("<div class='medals'><div class='gold'/><div class='silver'/><div class='bronze'/></div>");
    trackOption.append(medals);

    $(".track-chooser .tracks").append(trackOption)

    trackOption.on("click",function(){
      var track = $(this).attr('track');
      trackData = trackList[track];
      race.changeTrack(trackData.filename);
      race.startTrial();
      $(".track-chooser").hide();
    });
  }

  $(window).on("keydown",function(e){
    if(e.keyCode == 27 && $(".track-chooser:visible").length > 0){
      $(".track-chooser").hide();
    }
  });

  $(".change-track").on("click",function(){
    $(".track-chooser").show();
  });
}


var particles = [];

// Ooky going to leave this off for now
function makeParticle(x,y, speed, angle,type){

  // and... apply some motion and stuff to these...?
  // Move them in a similar direction ot the car...... ?
  var particle = {
    xRot : 0,
    yRot : 0,
    zRot : 0
  };

  if(type == undefined){
    type = "crash";
  }

  if(type == "grass") {

    particle.xVel = getRandom(-1.5,1.5);
    particle.yVel = getRandom(-1.5,1.5);
    particle.zVel = 1;
    particle.gravity = .175;

    particle.opacity = 1;
    particle.opacityVelocity = 0.02;

    particle.xPos = x * scaling;
    particle.yPos = y * scaling;
    particle.zPos = 0;

    particle.xRotVel = getRandom(2,8);
    particle.yRotVel = getRandom(2,8);
    particle.zRotVel = getRandom(2,8);

  } else {
    var angleChange = getRandom(-20,20);
    angle = angle + angleChange;

    // var adjacent = Math.cos(toRadians(angle)) * speed;
    // var opposite = Math.sin(toRadians(angle)) * speed;
    // var xd = opposite;
    // var yd = -1 * adjacent;

    particle.xVel = getRandom(-3,3);
    particle.yVel = getRandom(-3,3);
    particle.zVel = speed;
    particle.gravity = .175;

    particle.opacity = 1;
    particle.opacityVelocity = 0.02;

    particle.xPos = x * scaling;
    particle.yPos = y * scaling;
    particle.zPos = 0;

    particle.xRotVel = getRandom(2,10);
    particle.yRotVel = getRandom(2,10);
    particle.zRotVel = getRandom(2,10);
  }

  var trail = $("<div class='particle'></div>");
  var rotator = $("<div class='rotator'></div>");
  trail.append(rotator);

  if(type == "grass"){
    trail.find(".rotator").css("background",trackData.lawnmower);
    particle.zVel = 4;
  } else {
    trail.find(".rotator").css("background","white");
  }

  trail.height(scaling/2).width(scaling/2);

  particle.el = trail;

  $(".track").append(particle.el); // <- gotta figure this out i guess

  setTimeout(function(el,p) {
    return function(){
      el.remove();
      for(var i = 0, len = particles.length; i < len; i++){
        if(particles[i] == p){
          particles.splice(i, 1);
        }
      }
    };
  }(trail,particle), 2000);

  particles.push(particle);

}

function animateParticles(){
  for(var i = 0; i < particles.length; i++){
    var p = particles[i];

    //Position
    p.xPos = p.xPos + p.xVel;
    p.yPos = p.yPos + p.yVel;
    p.zPos = p.zPos + p.zVel;
    p.zVel = p.zVel - p.gravity;
    p.el.css("transform", "translateY("+p.yPos+"px)  translateX("+p.xPos+"px) translateZ("+p.zPos+"px)");

    p.opacity = p.opacity - p.opacityVelocity;
    p.el.css("opacity",p.opacity);

    //Rotation
    p.xRot = p.xRot + p.xRotVel;
    p.yRot = p.yRot + p.yRotVel;
    p.zRot = p.zRot + p.zRotVel;
    p.el.find(".rotator").css("transform", "rotateX("+p.xRot+"deg) rotateY("+p.yRot+"deg) rotateZ("+p.zRot+"deg)");

  }
}

function getRandom(min,max){
  return min + Math.random() * (max - min);
}