
var playerStates = {};

sockjs.onopen = function(e) {
  // console.log(e.data);
};

// Receives a message
sockjs.onmessage = function(e) {
  var message = e.data;

  var message = JSON.parse(message);
  var details = message.message;

  if(details.type == "update") {
    if(othercars[message.id]){
      othercars[message.id].x = details.x;
      othercars[message.id].y = details.y;
      othercars[message.id].driver = details.driver;
      othercars[message.id].rotation = details.rotation;
      othercars[message.id].height = details.height;
    }
  }

  if(message.type == "playerStates") {
    playerStates = message.message;
  }

  //When someone else joins via a browser
  //Load all the existing cars into the othercars array
  if(details.type == "welcome") {
    myid = message.id;
    var car = newCar(message.id);
    car.changeDriver("bob");
    cars.push(car);

    for(var i = 0; i < cars.length; i++){
      if(cars[i].id == myid){
        keyboardcar = cars[i];
      }
    }

    for(var i = 0; i < details.othercars.length; i++){
      addOtherCar(details.othercars[i]);
    }

    race.welcome(details);

    // Load the track we got from the server
    // Should be it's own thing though
    prepareTrack(details.track);

  }

  if(details.type == "changetrack") {
    race.prepareTrack(details.track);
  }

  //Car leaves
  if(details.type == "quit") {
    removeCar(message.id);
  }

  //If a car joined (self or other browser)
  if(details.type == "joined") {
    if(myid != message.id){
      addOtherCar(message.id);
    }
  }

  //If a car joined (self or other browser)
  if(details.type == "chat") {
    var driver = message.message.driver;
    var text = message.message.text;
    addChat(driver,text);
  }

  //If a car joined (self or other browser)
  if(details.type == "lapcount") {
    var currentlap = message.message.lapcount;
    race.updateLap(currentlap);
  }

  // All of the modes

  if(details.type == "startrace") {
    race.startRace(message.message.totallaps);
  }

  if(details.type == "startwarmup") {
    race.startWarmup(message.message);
  }

  if(details.type == "raceover") {
    var winner = message.message.winner;
    race.finishRace(winner);
  }

  if(details.type == "startcountdown") {
    race.startCountdown();
  }

  if(details.type == "padjoined") {
    var id = message.id;
    var car = newCar(id);
    cars.push(car);
  }

  if(details.type == "controller") {
    var id = message.id;

    var action = message.message;
    var thiscar;
    for(var c in cars){
      if(cars[c].id == id) {
        thiscar = cars[c];
      }
    }

    if(action.direction == "wheel"){
      thiscar.wheelturn = action.state;
    }

    if(action.direction == "left") {
      if(action.state == "on") {
        thiscar.setDirection("steering","left");
      }
      if(action.state == "off") {
        thiscar.setDirection("steering","none");
      }
    }

    if(action.direction == "right") {
      if(action.state == "on") {
        thiscar.setDirection("steering","right");
      }
      if(action.state == "off") {
        thiscar.setDirection("steering","none");
      }
    }

    if(action.direction == "gas") {
      if(action.state == "on") {
        thiscar.setDirection("gas","on");
      }
      if(action.state == "off") {
        thiscar.setDirection("gas","off");
      }
    }
  } //controller


}

//Removes a car by ID
function removeCar(id){

  for(var c in cars){
    if(cars[c].id == id){
      var carEl = cars[c].el;
      carEl.remove();
      delete cars[id];
    }
  }

  if(othercars[id]){
    carEl = othercars[id].el;
    carEl.addClass("quit");
      carEl.remove();
    setTimeout(function(carEl){

    },1000);
    delete othercars[id];
  }

}

//Adds ghost cars cars
function addOtherCar(id){
  var car = newGhostCar(id);
  var newCar = {};
  newCar.el = car.el;
  newCar.x = 0;
  newCar.y = 0;
  newCar.shadow = car.el.find(".shadow");
  newCar.rotation = 0;
  newCar.height = 0;
  othercars[id] = newCar;
}


// builds a ghostcar
function newGhostCar(carID){
  console.log("adding ghost car");
  var car = {};
  car.el = $("<div class='car two'></div>");
  car.el.append("<div class='name'>BOB</div>");
  car.el.width(scaling);
  car.el.height(scaling);

  car.shadow = $("<div class='shadow'></div>");

  car.el.append("<div class='body'></div>");
  car.el.find(".body").append(car.shadow);

  $(".track").append(car.el)

  return car;
}

// sockjs.onclose = function()  {
//   console.log("closing");
// };


function addChat(driver,text){
  var message = $("<div class='message'><span class='driver'></span> <span class='message-text'></span></div>");
  message.find(".driver").text(driver);
  message.find(".message-text").text(text);
  $(".chat").prepend(message);

  setTimeout(function(el) { return function() { el.remove(); }; }(message), 20000); //removes the message after 20 seconds
}