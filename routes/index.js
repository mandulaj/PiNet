var jwt = require('jsonwebtoken');
var express = require('express');
var indexRouter = express.Router();
var userRouter = express.Router();

/* GET home page. */
module.exports = function(app, passport) {

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
      if (err)
        return next(err);
      if (!user) {
        return res.send({
          login: false
        });
      }
      req.login(user, function(err) {
        if (err)
          return next(err);

        var token = jwt.sign({
          name: user.id
        }, "apple-pi-fusion", {
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
    res.render("room", {});
  });
  userRouter.get("/changepassword", function(req, res) {
    res.render("passChange", {});
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
};