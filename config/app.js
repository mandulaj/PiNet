var path = require("path"),
  express = require("express"),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session');


var defaultOpts = {
  dirname: __dirname,
  favicon: true
}

module.exports = function(app, config, opts){
  opts = merge_options(opts, defaultOpts);

  // View engine setup
  app.set('views', path.join(opts.dirname, 'views'));
  app.set('view engine', 'ejs');

  // Static files
  app.use("/static", express.static(path.join(opts.dirname, 'public')));
  // Favicon
  if(opts.favicon) {
    app.use(favicon(opts.dirname + '/public/favicon.ico'));
  }

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

}


// XXX: put this in a common file, duplicate in ./db.js
function merge_options(options, defaults){

  var options_final = {};
  for (var attrname in defaults) {
    options_final[attrname] = defaults[attrname];
  }

  if(!options) {
    return options_final;
  }

  for (var attrname in options) {
    options_final[attrname] = options[attrname];
  }
  return options_final;
}