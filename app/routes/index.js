var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();

/* GET home page. */
module.exports = function(app, passport) {
  router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect("/user");
    } else {
      res.render('index', { title: 'Express' });
    }
  });

  router.post('/login', function(req, res, next) {

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

  router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  router.get("/user", isAuthenticated, function(req, res) {
    res.render("index",{

    });
  });

  app.use('/', router);

  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/"); // send the user to the landing page if he is not logged in...
    }
  }
};
