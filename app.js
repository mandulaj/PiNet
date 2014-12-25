var https = require('https'),
  http = require('http'),
  express = require('express'),
  path = require('path'),
  fs = require('fs'),
  colors = require('colors'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  sqlite3 = require('sqlite3').verbose(),
  session = require('express-session'),
  io = require('socket.io'),
  config = require('./config/config.json'),
  socketioJwt = require('socketio-jwt'),
  PiNet = require("./lib/pinet.js"),

  app,
  db,
  server,
  socket;

// Create the app
app = express();
// Setup database
db = new sqlite3.Database(config.db);

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
// TODO: put this in a separate file
socket = io(server, {
  'close timeout': 10,
  'heartbeat timeout': 10,
  'heartbeat interval': 5
});

socket.use(socketioJwt.authorize({
   secret: config.secrets.jwt,
   handshake: true
}));

// Setup robot
var Robot = PiNet(socket, db, {
   port: 8800
});

// Setup db tables
// TODO: put this in a separate file
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER  PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, username TEXT  NOT NULL  UNIQUE, password TEXT  NOT NULL, access INT  DEFAULT ( 0 ), lastLogin TEXT, banned  BOOLEAN  DEFAULT( 0 ))");
db.run("CREATE TABLE IF NOT EXISTS logins (id INTEGER  PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, ip TEXT  NOT NULL  UNIQUE, accessed INT  DEFAULT ( 1 ), lastDate  TEXT, threat  INT  DEFAULT ( 1 ), banned  BOOLEAN  DEFAULT( 0 ))");
db.run("CREATE TABLE IF NOT EXISTS sockets (id TEXT  PRIMARY KEY  NOT NULL  UNIQUE, userId INTEGER)");
db.run("DELETE FROM sockets"); // Clear the sockets database

process.title = 'PiNet.js';

// Setup of the app
// TODO: this should go the a setup file

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use("/static", express.static(path.join(__dirname, 'public')));
// Favicon
//app.use(favicon(__dirname + '/public/favicon.ico'));

// Logger
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: config.secrets.cookie,
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport.js")(passport, db); // Passport setup

// Main Routes file
require('./routes/index')(app, passport, db);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  // TODO: make a not found page
  res.send("Not found");
  //res.render("notfound", req.path)
});

// Error handlers:

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(500);
  console.error(err.stack)
  res.render('error', {
    message: err.message,
    error: {}
  });
});


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
