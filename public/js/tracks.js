var trackData = {}; //palceholder for current track

var trackList = {
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
  }
  ,
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
  "moon.png" : {
    filename : "moon.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 5,
    leaveSkids : true,
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
  "oval-8.png" : {
    filename : "oval-8.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 10,
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
