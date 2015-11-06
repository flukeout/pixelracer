var sockjs_url = '/echo';
var sockjs = new SockJS(sockjs_url);

var laps = 0;
var scaling = 15;
var cars = [];

var canvasTrack, context, trackHeight, trackWidth;

var hexes = {
  "#000000" : "road",
  "#8fcf4b" : "grass",
  "#f1aa22" : "turbo",
  "#2194ca" : "water",
  "#6ba52d" : "tree",
  "#ffffff" : "finish",
  "#a9a9a9" : "ledge",
  "#373737" : "overpass",
  "#333333" : "start",
  "#7dba3d" : "lamp",
  "#d4c921" : "jump"
}

function prepareTrack(level){
  canvasTrack = $("canvas");
  context = canvasTrack[0].getContext("2d");

  var image = new Image();
  $("body").append(image);
  $(image).hide();
  image.src = '/tracks/' + level;

  $(".track").css("background-image", "url(/tracks/"+level+")");

  $(image).on("load",function(){
    context.drawImage(image, 0, 0);
    trackHeight = $(this).height();
    trackWidth = $(this).width();
    $(".track").height(trackHeight * scaling);
    $(".track").width(trackWidth * scaling);
    canvasTrack.height(trackHeight);
    canvasTrack.width(trackWidth);

    var bodyHeight = $("body").height();
    var offset = (bodyHeight - $(".track-wrapper").height())/2;
    $(".track-wrapper").css("margin-top",offset - 50);

    for(var i = 0; i < parseInt(trackWidth); i++){
      for(var j = 0; j < parseInt(trackHeight); j++){
        var result = checkPosition(i,j);
        if(result == "start"){
          // console.log(i,j);
        }
        if(result == "lamp"){
          var lamp = $("<div class='lamp'></div>");
          $(".track").append(lamp)
          lamp.css("left", scaling * (i - 1));
          lamp.css("top", scaling * (j - 4));
        }

        if(result == "tree"){
          var tree = $("<div class='tree'></div>");
          $(".track").append(tree)
          tree.css("left", scaling * (i - 1));
          tree.css("top", scaling * (j - 4));
        }

      }
    }

  });

}

function trackAnimation(){
  $(".track-wrapper").addClass("trackpop");

  setTimeout(function(){
    $(".track-wrapper").removeClass("trackpop");
  },200);
}

var tracks = ["jump.png","oval-jump.png","eight.png","oval.png"];
var tracks = ["oval-jump.png"];

function loadRandomTrack(){
  var trackCount = tracks.length;
  var random = Math.floor(Math.random() * trackCount);
  prepareTrack(tracks[random]);
}

$(document).ready(function(){

  var car = newCar("one");
  cars.push(car);

  loadRandomTrack();

  $(window).on("keydown",function(e){
    var direction;

    if(e.keyCode == 37) {
      cars[0].setDirection("steering","left");
    }

    if(e.keyCode == 39) {
      cars[0].setDirection("steering","right");
    }

    if(e.keyCode == 38) {
      cars[0].setDirection("gas","on");
    }

    // if(e.keyCode == 40) {
    //   cars[0].setDirection("down");
    // }

  });


  $(window).on("keyup",function(e){
    var direction;

    if(e.keyCode == 37) {
      cars[0].setDirection("steering","none");
    }

    if(e.keyCode == 39) {
      cars[0].setDirection("steering","none");
    }

    if(e.keyCode == 38) {
      cars[0].setDirection("gas","off");
    }
    //
    // if(e.keyCode == 40) {
    //   cars[0].setDirection("down");
    // }

  });


  gameLoop();

});

var time;
var delta;
var elapsedTime = 0;

function gameLoop() {

  var now = new Date().getTime();
  delta = now - (time || now);
  time = now;

  var xtotal = 0;
  var ytotal = 0;

  for(var i = 0; i < cars.length; i++){
    var car = cars[i];

    driveCar(car);

    car.laptime = car.laptime + delta;
    car.ticks++;
    xtotal = xtotal + car.x;
    ytotal = ytotal + car.y;

    $(".lap-time").text(formatTime(elapsedTime));

    $(".laps-"+car.name).find(".lap-count").text(car.laps);
    $(".laps-"+car.name).find(".lap-time").text(formatTime(car.laptime));

  }

  var xavg = xtotal / cars.length;
  var yavg = ytotal / cars.length;

  var xdeg = 5 * (-1 + (2 * xavg / trackWidth));
  var ydeg = 45 + 5 * (1 - (2 * yavg / trackHeight));
  $(".track").css("transform","rotateX(" +ydeg+"deg) rotateY("+xdeg+"deg)");

  window.requestAnimationFrame(gameLoop);
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

function driveCar(car) {


  car.x = Math.round(car.showx / scaling);
  car.y = Math.round(car.showy / scaling);

  car.currentx = car.x;
  car.currenty = car.y;

  var currentPosition = checkPosition(car.x,car.y); //What it's currently sitting on

  if(currentPosition == "turbo") {
    car.speed = car.speed + 4;
  }

  if(car.speed > 10){
    car.speed = 10;
  }

  var xd = 0;
  var yd = 0;

  var speedchange = car.acceleration;


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

  var turning = false;

  if(car.mode == "jumping") {
    turning = false;
  }

  if(currentPosition == "water"){
    turnspeed = turnspeed / 3;
  }


  if(car.direction == "right" || car.direction == "left"){


    if(car.direction == "left") {
      car.turnvelocity = car.turnvelocity - car.turnacceleration;

      if(Math.abs(car.turnvelocity) > turnspeed){
        car.turnvelocity = -1 * turnspeed;
      }

    }
    if(car.direction == "right") {
      car.turnvelocity = car.turnvelocity + car.turnacceleration;

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
  } else {

    if(car.turnvelocity > 0) {
      car.turnvelocity = car.turnvelocity - car.turnacceleration;
    }
    if(car.turnvelocity < 0 ){
      car.turnvelocity = car.turnvelocity + car.turnacceleration;
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


  var move = true;

  $(".place").css("left",car.x * scaling).css("top",car.y * scaling);


  if(currentPosition == "grass" && car.mode != "jumping"){
    car.speed = 1;
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
    if(currentPosition == "ledge" && nextPosition == "road" ) {
      car.mode = "normal";
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
    // car.speed = car.startspeed;
    car.speed = 1;
  }



  // car.el.attr("speed",car.speed);
  car.el.attr("direction",car.direction);
  car.el.attr("mode",car.mode);

  if(currentPosition == "finish" && car.angle > 180 && car.angle < 360){
    if(car.currentx != car.nextx) {

      car.laps++;

      if(car.laptime < car.bestlap || car.bestlap == 0) {
        car.bestlap = car.laptime;
      }

      $(".laps-"+car.name).find(".best-time").text(formatTime(car.bestlap));


      $(".last-lap").text(formatTime(car.laptime));
      car.laptime = 0;
      trackAnimation();

    }
  }

  if(car.mode == "normal" && currentPosition == "jump" && car.speed > 2) {
    car.jumpElapsed = 0;
    car.jumpTotal = car.speed * scaling / 4; //4
    car.mode = "jumping";
  }

  var jumpHeight = 0;

  if(car.mode == "jumping") {

    var maxHeight = car.jumpTotal / scaling;

    if(car.jumpElapsed < car.jumpTotal /2) {
      jumpHeight = easeOutCubic(car.jumpElapsed + 1 , 0, maxHeight , car.jumpTotal/2);
    } else {
      jumpHeight = easeInCubic(car.jumpElapsed - car.jumpTotal/2, maxHeight, -1 * maxHeight, car.jumpTotal/2);
    }

    jumpHeight = jumpHeight * 15;
    car.jumpElapsed++;

    if(car.jumpElapsed >= car.jumpTotal){
      car.mode = "normal";
    }

  }



  var update = {
    "type" : "update",
    "x": car.showx,
    "y": car.showy,
    "rotation" : car.angle,
    "height" : jumpHeight
  }

  try {
    sockjs.send(JSON.stringify(update));
  } catch(err) {

  }

  if(jumpHeight > 0){
    if(car.currentx != car.nextx || car.currenty != car.nexty){
      var trail = $("<div class='trail'></div>");
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
  car.body.css("transform", "rotateZ("+car.angle+"deg) translateZ("+jumpHeight+"px");

  updateGhostCars();
}


function updateGhostCars(){

  for(var k in othercars){
    var c = othercars[k];
    // c.el.css("transform","scale(5)");


    // c.el.css("transform","translateX("+ c.x +"px)  rotateZ("+c.rotation+"deg) translateY("+c.y || 0+"px)");
    c.el.css("transform","translateX("+ c.x +"px) translateY("+c.y+"px) translateZ("+c.height+"px) rotateZ("+c.rotation+"deg)");
  }
}

function easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
}

function linearEase(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * currentIteration / totalIterations + startValue;
}

function easeInCubic(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * Math.pow(currentIteration / totalIterations, 3) + startValue;
}


function checkPosition(x,y){
  var p = context.getImageData(x, y, 1, 1).data;
  var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  return hexes[hex];
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}


function newCar(name){

  var car = {
    id : cars.length,
    name : name,
    x : 20,
    y : 14,
    showx : 110,
    showy : 230,
    laps : 0,
    maxspeed : 5,
    ticks : 0,
    direction : 0,
    speed : 0,
    bestlap : 0,
    laptime: 0,
    mode: "normal",
    startspeed: 0,
    height: 0,
    jumpDirection: "up",
    jumpHeight: 0,
    jumpLength: 0,
    jumpElapsed: 0,
    jumpTotal: 0,
    angle: 90,
    currentx : 0,
    currenty :0,
    nextx :0,
    acceleration : .06,
    turnacceleration: .5,
    nexty : 0,
    turnvelocity : 0,
    gas : "off"
  };

  car.setDirection = function(action, direction){
    // if(this.mode == "normal" || this.mode == "under"){
    if(action == "steering") {
      this.direction = direction;
    }
    if(action == "gas"){
      this.gas = direction;
    }

    // }
  }

  car.el = $("<div class='car " +name + "'/>");
  car.el.width(scaling);
  car.el.height(scaling);
  $(".track").append(car.el)
  var body = $("<div class='body'></div>");
  car.body = body;

  car.el.append(body);
  car.history = new Array();

  return car;
}
