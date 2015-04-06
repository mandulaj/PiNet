var path = require("path"),
  express = require("express"),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  optimus = require('connect-image-optimus');

var merge_options = require("./lib/configUtil.js").merge_options;

var defaultOpts = {
  dirname: __dirname,
  favicon: true
};

module.exports = function(app, config, opts) {
  opts = merge_options(opts, defaultOpts);

  // View engine setup
  app.set('views', path.join(opts.dirname, 'views'));
  app.set('view engine', 'ejs');

  // Static files
  var staticPath = path.join(opts.dirname, "public");
  app.use("/static", optimus(staticPath));
  app.use("/static", express.static(staticPath, {
    maxAge: '1d'
  }));
  // Favicon
  if (opts.favicon) {
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

};