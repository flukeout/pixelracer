//Need to make a bunch of this shit depend on trackData.. like in
// single.js
function driveCarr(car) {

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

  //Controls the Skidding volume oscillator, which is always on
  if(turnpercent == 1 && speedpercent > .5) {
    vol.gain.value = .012 * turnpercent || 0;
  } else {
    vol.gain.value = 0;
  }

  // Trail shit
  var adjacent = Math.cos(toRadians(car.angle + 180)) * car.speed;
  var opposite = Math.sin(toRadians(car.angle - 180)) * car.speed;
  var xxd = opposite;
  var yyd = -1 * adjacent;

  // Particles, need a starting spot
  // And a destination spot
  // A timeout
  var leavetrails = false;

  //always leave a trail
  if((car.currentx != car.nextx || car.currenty != car.nexty) && leavetrails){
    var trail = $("<div class='spark'></div>");
    trail.height(scaling / 1).width(scaling / 1);
    trail.css("left",car.showx).css("top",car.showy);
    $(".track").append(trail);

    setTimeout(function(el,x,y) { return function() {
      el.css("transform","translateY("+ y * 20 +"px) translateX("+x * 20 +"px) scale(0)");
     }; }(trail,xxd,yyd), 1);

    setTimeout(function(el) { return function() { el.remove(); }; }(trail), 500);
  }

  //collisions

  if(car.currentx != car.nextx || car.currenty != car.nexty){
    for(var c in cars){
      var othercar = cars[c];
      if(othercar.id != car.id){
        if(othercar.nextx == car.nextx && othercar.nexty == car.nexty){
          // collideCars(car,othercar);
        }
      }
    }
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

      // race.finishLap(car);

      car.laps++;
      finishLap(car);

      if(car.laptime < car.bestlap || car.bestlap == 0) {
        car.bestlap = car.laptime;
      }

      car.laptime = 0;

    }
  }

  if(car.mode == "normal" && currentPosition == "jump" && car.speed > 1) {
    car.jumpElapsed = 0;
    car.jumpTotal = car.speed * scaling / 2.5 ;//jump distance relative to speed
    car.mode = "jumping";
  }

  var jumpHeight = 0;

  if(car.mode == "jumping") {

    var maxHeight = car.jumpTotal / scaling;
    //moon
    // var maxHeight = car.jumpTotal / scaling * 10;

    if(car.jumpElapsed < car.jumpTotal /2) {
      jumpHeight = easeOutCubic(car.jumpElapsed + 1 , 0, maxHeight , car.jumpTotal/2);
    } else {
      jumpHeight = easeInCubic(car.jumpElapsed - car.jumpTotal/2, maxHeight, -1 * maxHeight, car.jumpTotal/2);
    }

    jumpHeight = jumpHeight * 15;
    car.jumpElapsed++; //moon
    // car.jumpElapsed = car.jumpElapsed + .2;//moon

    if(car.jumpElapsed >= car.jumpTotal){
      car.mode = "normal";
    }

  }

  // use toFixed for the longer values to reduce decimal points

  var update = {
    "type" : "update",
    "x": car.showx,
    "y": car.showy,
    "gas" : car.gas,
    "driver" : car.driver,
    "rotation" : car.angle,
    "height" : jumpHeight,
    "velocity" : car.speed,
    "turnvelocity" : car.turnvelocity
  }

  try {
    sockjs.send(JSON.stringify(update));
  } catch(err) {
    console.log("Couldn't send update to the server!");
  }


  if(othercars){
    updateGhostCars();
  }

  if(jumpHeight > 0){
    if(car.currentx != car.nextx || car.currenty != car.nexty){
      var trail = $("<div class='trail'><div class='shadow'></div></div>");
      trail.height(scaling).width(scaling);
      trail.css("left",car.x * scaling).css("top",car.y * scaling);
      trail.css("transform","translateZ("+ jumpHeight +"px)");
      trail.find(".shadow").css("transform","translateZ("+ -1 * jumpHeight +"px)");
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

    ghostData.push({
      "time" : race.laptime,
      "x" : car.showx,
      "y" : car.showy
    })

    for(var i = ghostFrameIndex; i < ghostPlayData.length; i++){
      var frame = ghostPlayData[i];
      if(frame.time >= race.laptime){
        var thisFrame = frame;
        ghostFrameIndex = i;
        break;
      }
    }

    if(thisFrame){
      $(".ghost").css("left", thisFrame.x).css("top", thisFrame.y);
    }



}