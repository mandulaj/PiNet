var jwt = require('jsonwebtoken');
var express = require('express');
var config = require('../config/config.json');
var Db = require('../lib/dbReader.js');
var isAuthenticated = require("./lib/routerUtil.js").isAuthenticated;


var indexRouter = express.Router();
var userRouter = require("./users.js");

/* GET home page. */
module.exports = function(app, passport, db) {

  var database = new Db(db);

  // Index
  indexRouter.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect("/user");
    } else {
      res.render('login', {});
    }
  });

  indexRouter.post('/login', function(req, res, next) {

    passport.authenticate('local-login', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.send({
          login: false
        });
      }
      req.login(user, function(err) {
        if (err) return next(err);

        var token = jwt.sign({
          id: user.getId()
        }, config.secrets.jwt, {
          expiresInMinutes: 24 * 60
        });

        return res.send({
          login: true,
          token: token
        });
      });
    })(req, res, next);

  });

  indexRouter.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) return next(err);
      if (user) {
        return res.send({
          signup: true
        });
      } else {
        return res.send({
          signup: false
        });
      }
    })(req, res, next);
  });

  indexRouter.get("/logout", function(req, res, next) {
    req.logout();
    res.redirect("/");
  });


  // Middleware:

  // Check if the IP is not banned
  app.use(function(req, res, next) {
    database.isIpBlocked(req.ip, function(err, blocked) {
      if (err) return next(err);
      if (blocked) return res.status(403).send("403: You were banned! Try hacking into something dumber than PiNet :D");
      next();
    });
  });

  // Register the routers
  app.use('/user', userRouter);
  app.use('/', indexRouter);

  // Error handlers:
  // 404
  app.use(notFound);

  app.use(errorLogger);
  // 500
  app.use(errorHandler);
};


// Catch 404 and forward to error handler
function notFound(err, req, res, next) {
  if (err) return next(err);

  res.status(404);
  // TODO: make a not found page
  res.send("Not found");
  //res.render("notfound", req.path)
}

// Log errors
function errorLogger(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

// 500 errors
function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', {
    message: err.message,
    error: {}
  });
}
