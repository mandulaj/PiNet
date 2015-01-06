/* routerUtil.js - common utils used in the routers */

// Middleware used to protect a route that requires authentication
module.exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/"); // send the user to the landing page if he is not logged in...
  }
};