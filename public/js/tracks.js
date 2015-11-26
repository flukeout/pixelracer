var playerAchievements = {}; // So that we can remember.. what you have gotten.....

var trackData = {}; //Place holder for current track -  gets populated, yo.

var trackTimes = {
  "html5.png" : {
    gold : 7250,
    silver : 7750,
    bronze : 8250
  },
  "moon.png" : {
    gold : 4750,
    silver : 5500,
    bronze : 6000
  },
  "splash.png" : {
    gold : 7500,
    silver : 8000,
    bronze : 9000
  },
  "oval.png" : {
    gold : 3000,
    silver : 3500,
    bronze : 4000
  },
  "oval-8.png" : {
    gold : 3000,
    silver : 3500,
    bronze : 4000
  },
  "ampersand.png" : {
    gold : 6250,
    silver : 6750,
    bronze : 7250
  },
  "chasm.png" : {
    gold : 5500,
    silver : 6000,
    bronze : 6500
  },
  "yellow.png" : {
    gold : 8000,
    silver : 8500,
    bronze : 9000
  },
  "noirjump.png" : {
    gold : 8000,
    silver : 9000,
    bronze : 10000
  },
  "superjump.png" : {
    gold : 8000,
    silver : 9000,
    bronze : 10000
  },
  "twitter.png" : {
    gold : 5250,
    silver : 6000,
    bronze : 6500
  },
  "turbo-8.png" : {
    gold : 3750,
    silver : 4500,
    bronze : 5000
  }


}

var trackList = {
  "html5.png" : {
    filename : "html5.png",
    carcolors : ["#d04415"],
    trailcolor : "#d04415",
    leaveSkids : false,
    laps : 3,
    hexes : {
      "#ffffff" : "road", //yellow
      "#616161" : "road",
      "#444444" : "road",
      "#c7c7c7" : "road",
      "#535353" : "road",
      "#3a3a3a" : "road", //road shadow
      "#e1e1e1" : "road",
      "#ad3209" : "ledge",
      "#414141" : "turbo",
      "#bababa" : "finish",
      "#343434" : "jump",
      "#c25115" : "jump"
    }
  },

  "splash.png" : {
    filename : "splash.png",
    carcolors : ["#ffffff"],
    trailcolor : "#ffffff",
    leaveSkids : false,
    laps : 3,
    hexes : {
      "#e4d900" : "road", //yellow
      "#ec008c" : "road", //magenta
      "#00aeef" : "road", //blue
      "#009dd8" : "finish",
      "#151515" : "jump"
    }
  },
  "yellow.png" : {
    filename : "yellow.png",
    carcolors : ["#424130"],
    trailcolor : "#424130",
    leaveSkids : false,
    laps : 5,
    hexes : {
      "#eee76a" : "road",
      "#ffffff" : "finish",
      "#e7dc2a" : "road",
      "#8d8512" : "jump"
    }
  },
  "noirjump.png" : {
    filename : "noirjump.png",
    carcolors : ["#db0fed"],
    trailcolor : "#db0fed",
    leaveSkids : false,
    laps : 5,
    hexes : {
      "#ffffff" : "road",
      "#e0be35" : "turbo",
      "#e4e4e4" : "finish",
      "#a9a9a9" : "ledge",
      "#373737" : "overpass",
      "#c9c9c9" : "jump"
    }
  },
  "superjump.png" : {
    filename : "superjump.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    leaveSkids : true,
    laps : 5,
    hexes : {
      "#5a5a5a" : "road",
      "#8fcf4b" : "grass",
      "#f1aa22" : "turbo",
      "#2194ca" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#d4c921" : "jump"
    }
  },
  "chasm.png" : {
    filename : "chasm.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    leaveSkids : true,
    laps : 5,
    hexes : {
      "#5a5a5a" : "road",
      "#8fcf4b" : "grass",
      "#bcb21b" : "turbo",
      "#2194ca" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#d4c921" : "jump"
    }
  },
  "moon.png" : {
    filename : "moon.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    leaveSkids : false,
    lapt : 0,
    hexes : {
      "#d6c550" : "road",
      "#ffffff" : "finish",
      "#b0a13c" : "jump"
    }
  },
  "twitter.png" : {
    filename : "twitter.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    leaveSkids : true,
    laps : 5,
    hexes : {
      "#5a5a5a" : "road",
      "#ffffff" : "finish"
    }
  },
  "ampersand.png" : {
    filename : "ampersand.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 6,
    leaveSkids : true,
    hexes : {
      "#4c4a4a" : "road",
      "#5a5a5a" : "road",
      "#8fcf4b" : "grass",
      "#f1aa22" : "turbo",
      "#b97d37" : "windmill",
      "#2194ca" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#a9a9a9" : "ledge",
      "#747474" : "overpass",
      "#7dba3d" : "lamp",
      "#d4c921" : "jump"
    }
  },
  "oval-8.png" : {
    filename : "oval-8.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 10,
    leaveSkids : true,
    hexes : {
      "#5a5a5a" : "road",
      "#4c4a4a" : "road",
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
  },
  "oval.png" : {
    filename : "oval.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 12,
    leaveSkids : true,
    hexes : {
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
  },
  "turbo-8.png" : {
    filename : "turbo-8.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 6,
    leaveSkids : true,
    hexes : {
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
  }
}
