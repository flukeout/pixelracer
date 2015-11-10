var sockjs_url = '/echo';
var sockjs = new SockJS(sockjs_url);
var myid = 0;
var width;
var controller = {
  direction: "",
  state: ""
};

var steeringStart;
var percentTurn;
var lastTouch;

$(document).ready(function(){

  //
  width = $(".pad").width();

  $(".gas").on("touchstart",function(e){
      var direction = $(this).attr("direction");
      setController("gas","on");
      e.preventDefault();
  });

  // $(".gas").on("touchend",function(e){
  //     var direction = $(this).attr("direction");
  //     setController("gas","off");
  //     e.preventDefault();
  // });

  $(".wheel-wrapper").on("touchstart",function(e){
    steeringStart = e.originalEvent.touches[0].pageX;
    lastTouch = e.originalEvent.touches[0].pageX;
    e.preventDefault();
  });

  $(".wheel-wrapper").on("touchend",function(e){
    $(".wheel").addClass("no-touch");
    setController("wheel",0);
    $(".wheel").css("transform","rotate(0deg)");
  });

  $(".wheel-wrapper").on("touchmove",function(e){

    $(".wheel").removeClass("no-touch");
    var currentTouch = e.originalEvent.touches[0].pageX;

    var thisTouchDelta = currentTouch - lastTouch;

    var touchDelta = currentTouch - steeringStart;

    var maxDelta = 65; //Number of pixels to to max out the turn

    percentTurn = touchDelta / maxDelta;


    console.log(percentTurn);

    if(percentTurn > 1) {
      percentTurn = 1;
    } else if (percentTurn < -1) {
      percentTurn = -1;
    }

    lastTouch = e.originalEvent.touches[0].pageX;

    if(Math.abs(percentTurn) == 1 ) {
      steeringStart = steeringStart + thisTouchDelta;
    }

    var direction;

    if(touchDelta > 0) {
      direction = "right";
    } else {
      direction = "left";
    }

    percentTurn = Math.round(100 * percentTurn) / 100;


    if(Math.abs(percentTurn) > .9) {
      setController("wheel",percentTurn);
    } else {
      setController("wheel",percentTurn / 2 );
    }


    var maxWheelTurn = 45;
    var wheelTurn = maxWheelTurn * percentTurn;

    $(".wheel").css("transform","rotate("+ wheelTurn +"deg)");


    e.preventDefault();
  });



  // $(".direction").on("touchend",function(e){
 //    var direction = $(this).attr("direction");
 //    setController(direction,"off");
 //    e.preventDefault();
 //  });


  var update = {
    "type" : "padjoined"
  }

  setTimeout(function(){
    try {
      sockjs.send(JSON.stringify(update));
    } catch(err) {

    }
  },1000);



});

function setController(direction,state){

  controller.direction = direction;
  controller.state = state;

  var update = {
    "type" : "controller",
    "direction" : controller.direction,
    "state" : controller.state
  }

  try {
    sockjs.send(JSON.stringify(update));
  } catch(err) {

  }

}
