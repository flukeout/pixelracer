var trackData = {}; //palceholder for current track -  gets populated, yo.

var trackTimes = {
  "oval-8.png" : {
    gold : 3000,
    silver : 3500,
    bronze : 4000
  },
  "chasm.png" : {
    gold : 5750,
    silver : 6250,
    bronze : 7000
  },
}

var trackList = {
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
