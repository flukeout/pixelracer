// Requirements
var express = require('express');
var socket = require('./lib/socket'); // socket library
var nunjucks = require('nunjucks'); //nunjucks
var url = require('url');
var habitat = require('habitat'); // for handing environment variables
habitat.load();

// Create the app
var app = express();

nunjucks.configure('views', {
  autoescape: true,
  express: app,
  watch: true
});

//How to get something out of habitat, sample
var env = new habitat("port");

//This makes it so that static assets will be served from
//the 'public' folder when requested via the URL
app.use(express.static('public'));

// Views
app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/pad', function(req, res) {
  res.render('pad.html');
});


app.get('/single', function(req, res) {
  res.render('single.html');
});


// Example of getting a parameter from a URL and passing it to a view

// app.get('/user/:user_id', function(req, res) {
//   var user = req.params.user_id;
//   res.render('user.html', { "user" : user });
// });


//------------------//
//  Search queries  //
//------------------//

var port = env.PORT || 5000;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
});

console.log('Starting server on port ' + port);

socket.server(server);


// server.listen(9999, '0.0.0.0');
