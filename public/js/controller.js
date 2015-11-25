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
  setTimeout(function(){

    gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

    checkControllers();
  },1500);
});

var more = true;
function checkControllers(){

  gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

   for (var i = 0; i < gamepads.length; i++) {
     var gp = gamepads[i];

     if (gp) {
       if(i == 1){
         if(gp.buttons[0].pressed){
           keyboardcar.setDirection("gas","on");
         } else {
           keyboardcar.setDirection("gas","off");
         }
         if(gp.buttons[14].pressed){
           keyboardcar.setDirection("steering","left-on");
         } else {
           keyboardcar.setDirection("steering","left-off");
         }
         if(gp.buttons[15].pressed){
           keyboardcar.setDirection("steering","right-on");
         } else {
           keyboardcar.setDirection("steering","right-off");
         }

       }
     }
   }

   if(gotControllers){
     window.requestAnimationFrame(checkControllers);
   }

}