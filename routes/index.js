var jwt = require('jsonwebtoken');
var express = require('express');
var config = require('../config/config.json');
var Db = require('../lib/dbReader.js');


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
    });
  });

  // Register the routers
  app.use('/user', userRouter);
  app.use('/', indexRouter);
};



function isAuthenticated(req, res, next) {
  console.log("called")
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/"); // send the user to the landing page if he is not logged in...
  }
}


