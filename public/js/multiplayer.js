var messages = [];
var myID;

var othercars = {};

sockjs.onopen = function(e) {
  // console.log(e.data);
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
      othercars[message.id].rotation = details.rotation;
      othercars[message.id].height = details.height;
    }
  }

  if(details.type == "welcome") {
    for(var i = 0; i < details.othercars.length; i++){
      addOtherCar(details.othercars[i]);
    }
  }

  //Car leaves
  if(details.type == "quit") {
    removeCar(message.id);
  }

  //If a car joined
  if(details.type == "joined") {
    addOtherCar(message.id);
  }
}

//Removes a car by ID
function removeCar(id){
  carEl = othercars[id].el;
  carEl.addClass("quit");
  setTimeout(function(carEl){
    // el.remove();
  },1000);

  delete othercars[id];
}

//Adds ghost cars cars
function addOtherCar(id){
  var car = newGhostCar(id);
  var newCar = {};
  newCar.el = car.el;
  newCar.x = 0;
  newCar.y = 0;
  newCar.rotation = 0;
  newCar.height = 0;
  othercars[id] = newCar;
}

function newGhostCar(carID){
  var car = {};
  car.el = $("<div class='car two'/>");
  car.el.width(scaling);
  car.el.height(scaling);
  $(".track").append(car.el)
  car.el.append("<div class='body'></div>");
  return car;
}

// sockjs.onclose = function()  {
//   console.log("closing");
// };
