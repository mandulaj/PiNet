var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  sqlite3 = require('sqlite3').verbose(),
  session = require('express-session'),
  config = require('./config/config.json');

var app = express();
var db = new sqlite3.Database(config.db);

db.run("CREATE TABLE IF NOT EXISTS users (id PRIMARY KEY  NOT NULL  UNIQUE, username TEXT  NOT NULL  UNIQUE, password TEXT  NOT NULL, access INT  DEFAULT ( 0 ), lastLogin TEXT)");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use("/static", express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: config.secret,
}));
app.use(passport.initialize());
app.use(passport.session());

require("./config/passport.js")(passport, db);
require('./routes/index')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

function exitHandler(options, err) {
  if (options.cleanup) {
    //TODO: cleanup
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