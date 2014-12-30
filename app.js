var https = require('https'),
  http = require('http'),
  express = require('express'),
  fs = require('fs'),
  colors = require('colors'),
  passport = require('passport'),
  sqlite3 = require('sqlite3').verbose(),
  io = require('socket.io'),
  config = require('./config/config.json'),
  PiNet = require("./lib/pinet.js"),

  // App variables
  app,
  db,
  server,
  socket;

// Create the app
app = express();
// Setup database
db = new sqlite3.Database(config.db);

// Setup db
require("./config/db.js")(db);

// Setup the server
if (config.ssl) {
  var options = {
    key: fs.readFileSync(config.keys.key),
    cert: fs.readFileSync(config.keys.cert)
  };
  server = https.createServer(options, app).listen(config.port);
} else {
  server = http.createServer(app).listen(config.port);
}
console.log('Express'.bold + ' server listening on ' + 'http'.green + ((config.ssl) ? ("s".green) : ("")) + "://localhost:".green + config.port.toString().green);

// Setup socket
socket = io(server, {
  'close timeout': 10,
  'heartbeat timeout': 10,
  'heartbeat interval': 5
});
require("./config/socketio.js")(socket, db, config);
require("./lib/socketio.js")(socket, db);

// Setup robot
var Robot = PiNet(socket, db, {
   port: "robot.sock"
});

process.title = 'PiNet.js';

// Setup of the app

require("./config/app.js")(app, config, {
  dirname: __dirname,
  favicon: false // XXX: this in only temporary...
});


// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport.js")(passport, db); // Passport setup

// Main Routes file
require('./routes/index')(app, passport, db);


module.exports = app;


// App clean-up

// TODO: clean this up:
function exitHandler(options, err) {
  if (options.cleanup) {
    // TODO: add any clean up here
    db.close(function() {
      console.log("Exit Success!");
      process.exit(0);
    });
  }
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {
  cleanup: true
}));
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));
