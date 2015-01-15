var express = require('express');
var userRouter = express.Router();
var isAuthenticated = require("./lib/routerUtil.js").isAuthenticated;


module.exports = function() {
  userRouter.use(isAuthenticated);

  userRouter.get("/", function(req, res, next) {
    req.user.isAdmin(function(err, admin) {
      if (err) return next(err);
      res.render("room", {
        username: req.user.username,
        admin: admin
      });
    });
  });

  userRouter.get("/changepassword", function(req, res, next) {
    res.render("passChange", {
      username: req.user.username
    });
  });

  userRouter.post("/changepassword", function(req, res, next) {
    req.user.changePassword(req.body.oldPassword, req.body.newPassword, function(err, data) {
      if (err) return next(err);
      if (data) {
        res.send({
          success: true
        });
      } else {
        res.send({
          success: false
        });
      }
    });
  });

  userRouter.get("/admin", isAdmin, function(req, res, next) {
    res.render("admin", {
      username: req.user.username
    });
  });

  return userRouter;
};


function isAdmin(req, res, next) {
  req.user.isAdmin(function(err, admin) {
    if (err) return next(err);
    if (admin) {
      return next();
    } else {
      res.redirect("/user");
    }
  });
}