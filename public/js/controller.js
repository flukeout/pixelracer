var gotControllers = true;

window.addEventListener("gamepadconnected", function(e) {
  gotControllers = true;
});

window.addEventListener("gamepaddisconnected", function(e) {
  console.log("Gamepad disconnected from index %d: %s",
  e.gamepad.index, e.gamepad.id);
});


console.log(gamepads);

var gamepads;
$(document).ready(function(){

  //
  // setTimeout(function(){
  //   var car = newCar("one",{"trailColor":trackData.trailcolor});
  //   cars.push(car);
  //   car.changeDriver("LP");
  //
  //   var car = newCar("two",{"trailColor":trackData.trailcolor});
  //   cars.push(car);
  //   car.changeDriver("JR");
  //
  //   var car = newCar("three",{"trailColor":trackData.trailcolor});
  //   car.changeDriver("AL")
  //   cars.push(car);
  // },1000);
  //



  setTimeout(function(){

    gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    console.log(gamepads[0].axes[0]);
    checkControllers();
  },1500);
});

var more = true;
function checkControllers(){

  gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

   for (var i = 0; i < gamepads.length; i++) {
     var gp = gamepads[i];

     if (gp) {
       console.log(gp.axes[0])
         if(gp.buttons[0].pressed){
           cars[i].setDirection("gas","on");
         } else {
           cars[i].setDirection("gas","off");
         }
         if(gp.buttons[14].pressed || gp.axes[0] < -.2){
           cars[i].setDirection("steering","left-on");
         } else {
           cars[i].setDirection("steering","left-off");
         }
         if(gp.buttons[15].pressed || gp.axes[0] > .2){
           cars[i].setDirection("steering","right-on");
         } else {
           cars[i].setDirection("steering","right-off");
         }


     }
   }

   if(gotControllers){
     window.requestAnimationFrame(checkControllers);
   }

}