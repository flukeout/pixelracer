var hexes = {
  "#000000" : "road",
  "#5a5a5a" : "road",
  "#8fcf4b" : "grass",
  "#f1aa22" : "turbo",
  "#b97d37" : "windmill",
  "#2194ca" : "water",
  "#6ba52d" : "tree",
  "#ffffff" : "finish",
  "#a9a9a9" : "ledge",
  "#373737" : "overpass",
  "#7dba3d" : "lamp",
  "#d4c921" : "jump"
}

var othercars = {};
var startpositions = [];


function showMessage(message){
  $(".game-message").css("opacity",1);

  setTimeout(function(){
    $(".game-message .message").text(message).css("opacity",1);
  },500);

  setTimeout(function(){
    $(".game-message .message").css("opacity",0);
  },1500);

  setTimeout(function(){
    $(".game-message").css("opacity",0);
  },2000);

}


var enginevol;
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

  setTimeout(function(){
    $(".track-wrapper").removeClass("trackpop");
  },200);
}

var tracks = ["moon.png","twitter.png","ampersand.png","oval-8.png","oval.png","turbo-8.png"];
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

    race.startPositions = [];
    startpositions = [];

    for(var i = 0; i < parseInt(trackWidth); i++){
      for(var j = 0; j < parseInt(trackHeight); j++){
        var result = checkPosition(i,j);

        if(result == "finish"){
          race.startPositions.push({"x": i, "y" : j});
          startpositions.push({"x": i, "y" : j});
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


  });

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


function newCar(id){

  var car = {
    id : id,
    x : 20,
    y : 14,
    name : name,
    showx : 410,
    showy : 230,
    laps : 0,
    wheelturn : false,
    maxspeed : 5,
    direction : "none",
    speed : 0,
    bestlap : 0,
    laptime: 0,
    mode: "normal",
    startspeed: 0,
    height: 0,
    driver : "Bob",
    jumpDirection: "up",
    jumpHeight: 0,
    jumpLength: 0,
    jumpElapsed: 0,
    jumpTotal: 0,
    angle: 270,
    currentx : 0,
    currenty :0,
    nextx :0,
    acceleration : .06,
    turnacceleration: .5, //.5
    nexty : 0,
    turnvelocity : 0,
    gas : "off",
    left : "off",
    right : "off"
  };

  //Limit the driver name to 3 uppercase letters
  car.changeDriver = function(name){
    car.driver = name.substr(0,3).toUpperCase();
    car.el.find(".name").text(car.driver);
    $(".driver-name").val(car.driver);
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

  car.el = $("<div class='car'><div class='name'>" + car.name + "</div></div>");
  car.el.width(scaling);
  car.el.height(scaling);

  $(".track").append(car.el)

  var shadow = $("<div class='shadow'></div>");
  car.shadow = shadow;

  var body = $("<div class='body'></div>");
  car.body = body;

  var randomColor = Math.floor(Math.random() * carcolors.length);
  car.body.css("background",carcolors[randomColor]);

  car.el.append(shadow);
  car.el.append(body);

  car.history = new Array();

  return car;
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
  // $("body").css("background",hex);
  return hexes[hex];
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}


function newCar(id){

  var car = {
    id : id,
    x : 20,
    y : 14,
    name : name,
    showx : 410,
    showy : 230,
    laps : 0,
    wheelturn : false,
    maxspeed : 5,
    direction : "none",
    speed : 0,
    bestlap : 0,
    laptime: 0,
    mode: "normal",
    startspeed: 0,
    height: 0,
    driver : "Bob",
    jumpDirection: "up",
    jumpHeight: 0,
    jumpLength: 0,
    jumpElapsed: 0,
    jumpTotal: 0,
    angle: 270,
    currentx : 0,
    currenty :0,
    nextx :0,
    acceleration : .06,
    turnacceleration: .5, //.5
    nexty : 0,
    turnvelocity : 0,
    gas : "off",
    left : "off",
    right : "off"
  };

  //Limit the driver name to 3 uppercase letters
  car.changeDriver = function(name){
    car.driver = name.substr(0,3).toUpperCase();
    car.el.find(".name").text(car.driver);
    $(".driver-name").val(car.driver);
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

  car.el = $("<div class='car'><div class='name'>" + car.name + "</div></div>");
  car.el.width(scaling);
  car.el.height(scaling);

  $(".track").append(car.el)

  var shadow = $("<div class='shadow'></div>");
  car.shadow = shadow;

  var body = $("<div class='body'></div>");
  car.body = body;

  var randomColor = Math.floor(Math.random() * carcolors.length);
  car.body.css("background",carcolors[randomColor]);

  car.el.append(shadow);
  car.el.append(body);

  car.history = new Array();

  return car;
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
    car.angle = 270;
    var random = Math.floor(Math.random() * startpositions.length);
    car.x = startpositions[random].x + 2;
    car.y = startpositions[random].y;
    car.showx = car.x * scaling;
    car.showy = car.y * scaling;
    car.el.find(".name").remove();
  }
}
