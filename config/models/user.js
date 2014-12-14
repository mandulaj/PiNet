var config = require("../config.json"),
  Db = require("../../lib/dbReader.js");

function User(user, db) {
  this.id = user.id;
  this.password = user.password;
  this.username = user.username;

  this._db = db;
}

// Get the id of the user
User.prototype.getId = function() {
  return this.id;
};

// verify a user using his id and password
// return error and success in callback
User.prototype.verify = function(password, cb) {
  return this._db.verify(this.password, password, cb);
};

// Update the last login date in the database (called on a successful login)
User.prototype.updateLogin = function(cb) {
  return this._db.updateLogin(this.id, cb);
};

// Change the password of a user (must have id, old password, and new password)
// return error and success in callback
User.prototype.changePassword = function(oldPassword, newPassword, cb) {
  return this._db.changePassword(this.id, oldPassword, newPassword, cb);
};

// Get the power of a user
User.prototype.getAccessStatus = function(cb) {
  return this._db.getAccessStatus(this.id, cb);
};

// Is the user and admin
User.prototype.isAdmin = function(cb) {
  return this._db.isAdmin(this.id, cb);
};

// set the power of a user to the new power
User.prototype.updateAdminPower = function(power, cb) {
  return this._db.updateAdminPower(this.id, power, cb);
};


module.exports = function(username, database, cb) {
  // Create the database abstraction object =
  var db = new Db(database);

  // TODO: check the ID first for efficiency!!!!
  db.getIdFromUsername(username, function(err, foundId) {
    if (err) return cb(err, null);
    if (foundId) {
      // Use the found ID
      createUserById(foundId, db, cb);
    } else {
      // Try the username as an id
      createUserById(username, db, cb);
    }
  });
};

// create the user object
function createUserById(id, db, cb) {
  db.findById(id, function(err, user) {
    if (err) return cb(err, null);
    if (!user) {
      return cb(new Error("404"), null);
    } else {
      return cb(null, new User(user, db));
    }
  });
}