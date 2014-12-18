var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/sudo', function(req, res) {
  // TODO: redo user object
  if (user.isAdmin()) {

  }
  // TODO: sudo terminalmonly for admin users
});

module.exports = router;