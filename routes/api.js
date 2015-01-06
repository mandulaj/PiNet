var express = require('express');
var apiRouter = express.Router();
var isAuthenticated = require("./lib/routerUtil.js").isAuthenticated;


module.exports = function(db) {
  //apiRouter.use(isAuthenticated);

  apiRouter.get("/", function(req, res) {
    res.send("api");
  });

  apiRouter.get('/username/:username', function(req, res, next) {
    db.doesExist(req.params.username, function(err, exists) {
      if (err) return next(err);
      res.send({
        username: req.params.username,
        exists: exists
      });
    });
  });


  return apiRouter;
};