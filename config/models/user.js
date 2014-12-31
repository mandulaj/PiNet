var config = require("../config.json");

// User abstraction object used to interact with the user in the database
function User(user, db) {

  // Set up the main artefacts about the user
  this.id = user.id;
  this.password = user.password;
  this.username = user.username;

  // Reference to a DB wrapper used to communicate with the database
  this._db = db;
}

// Get the id of the user
User.prototype.getId = function() {
  return this.id;
};

// Verify the password against the db record
// cb(err, match)
User.prototype.verify = function(password, cb) {
  return this._db.verify(this.password, password, cb);
};

// Update the last login date in the database (called on a successful login) for this user
User.prototype.updateLogin = function(cb) {
  return this._db.updateLogin(this.id, cb);
};

// Change the password this user (provide old password for authentication and new password to change the db record)
// return error and success in callback
User.prototype.changePassword = function(oldPassword, newPassword, cb) {
  return this._db.changePassword(this.id, oldPassword, newPassword, cb);
};

// Get the access power of a user
User.prototype.getAccessStatus = function(cb) {
  return this._db.getAccessStatus(this.id, cb);
};

// Is the user an admin
User.prototype.isAdmin = function(cb) {
  return this._db.isAdmin(this.id, cb);
};

// set the power of a user to the new power (This should only be called from a sudo user)
User.prototype.updateAdminPower = function(power, cb) {
  return this._db.updateAdminPower(this.id, power, cb);
};

// export function to create a user object on demand User([id|username], database, callback)
module.exports = function(id, db, cb) {
  // Try creating the user form the id provided
  createUserById(id, db, function(err, user) {
    if (err) return cb(err, null);
    if (user) return cb(null, user); // If we find a user right away, return him in the callback
    // We have not found the user yet, search the usernames
    db.getIdFromUsername(id, function(err, foundId) {
      if (err) return cb(err, null);
      if (foundId) {
        // Use the found ID to get the user object
        createUserById(foundId, db, cb);
      } else {
        // The username does not exist
        return cb(null, null);
      }
    });
  });
};

// create the user object using the given id
function createUserById(id, db, cb) {
  // Find the user by it's id in the database
  db.findById(id, function(err, user) {
    if (err) return cb(err, null);
    if (!user) {
      return cb(null, null); // We have no user, return null without an error
    } else {
      return cb(null, new User(user, db)); // We have a user, return an user wrapper object in the callback, no error
    }
  });
}
