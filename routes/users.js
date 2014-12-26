var express = require('express');
var userRouter = express.Router();
var isAuthenticated = require("./lib/routerUtil.js").isAuthenticated;

userRouter.use(isAuthenticated)

userRouter.get("/", function(req, res, next) {
  req.user.isAdmin(function(admin) {
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


module.exports = userRouter;


function isAdmin(req, res, next) {
  req.user.isAdmin(function(admin) {
    if (admin) {
      return next();
    } else {
      res.redirect("/user");
    }
  });
}
