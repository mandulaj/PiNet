var jwt = require('jsonwebtoken');
var express = require('express');
var indexRouter = express.Router();
var userRouter = express.Router();
var config = require('../config/config.json');
var Db = require('../lib/dbReader.js');

/* GET home page. */
module.exports = function(app, passport, db) {

  var database = new Db(db);

  // Index
  indexRouter.get('/', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect("/user");
    } else {
      res.render('index', {});
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
        if (err)
          return next(err);

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
      if (err) {
        return res.send({
          signup: false
        });
      }
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

  indexRouter.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });


  // User
  userRouter.use(isAuthenticated);
  userRouter.get("/", function(req, res) {
    req.user.isAdmin(function(err, admin){
      if (err) return res.status(500).end("error");
      res.render("room", {
        username: req.user.username,
        admin: admin
      });
    });
  });

  userRouter.get("/changepassword", function(req, res) {
    res.render("passChange", {});
  });

  userRouter.get("/admin", isAdmin, function(req, res) {
  });

  // Check if the IP is not banned
  app.use(function(req, res, next) {
    database.isIpBlocked(req.ip, function(err, blocked) {
      if (err) return res.status(500).end("Error");
      if (blocked) return res.status(403).end("403: You were banned! Try hacking into something dumber than PiNet :D");
      next();
    });
  });

  app.use('/user', userRouter);
  app.use('/', indexRouter);

  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/"); // send the user to the landing page if he is not logged in...
    }
  }

  function isAdmin(req, res, next) {
    req.user.isAdmin(function(admin){
      if (admin) {
        return next();
      } else {
        res.redirect("/user");
      }
    });
  }
};
