var crypto = require('crypto'),
  config = require("../config/config.json"),
  bcrypt = require("bcrypt");

// DB wrapper object used to execute operations related to the database
function Db(db) {
  // allow omitting `new`
  if (!(this instanceof Db)) {
    return new Db(db);
  }
  if (db instanceof Db) {
    throw new Error("Database object provided is already a dbReader instance");
  }
  this.db = db; // db reference to the sqlite3 db object
}

// Gets user object with the given id --> cb(err, user)
Db.prototype.findById = function(id, cb) {
  var self = this;
  this.db.serialize(function() {
    self.db.get("SELECT * FROM users WHERE id=(?)", id, function(err, user) {
      if (err) return cb(err, null);
      if (user) return cb(null, user);
      return cb(null, null);
    });
  });
};


// Get the id of a user, using his username
Db.prototype.getIdFromUsername = function(username, cb) {
  var self = this;
  this.db.serialize(function() {
    self.db.get("SELECT id FROM users WHERE username=(?)", username, function(err, row) {
      if (err) return cb(err, null);
      if (!row) {
        return cb(null, null);
      }
      return cb(null, row.id);
    });
  });
};

// returns if numUsers for a username is not zero
Db.prototype.doesExist = function(username, cb) {
  var self = this;
  this.db.serialize(function() {
    self.db.get("SELECT COUNT(*) AS num FROM users WHERE username=(?)", username, function(err, row) {
      if (err) {
        return cb(err, null);
      } else {
        if (row.num >= 1) {
          return cb(null, true);
        } else {
          return cb(null, false);
        }
      }
    });
  });
};


// Creates a new user in the database using the data provided
Db.prototype.createNewUser = function(data, cb) {
  var self = this;
  createPassword(data.password, function(err, hash) {
    data.password = hash;
    self.db.serialize(function() {
      var now = new Date().valueOf();
      // id is auto-incremented
      self.db.run("INSERT INTO users (username, password, access, lastLogin) VALUES ((?), (?), (?), (?))", data.username, data.password, data.access, now, function(err) {
        if (err) return cb(err, false);
        return cb(null, true);
      });
    });
  });
};

// verify a password against the db record
// return error and success in callback
Db.prototype.verify = function(dbPassword, password, cb) {
  bcrypt.compare(password, dbPassword, function(err, match) {
    if (err) return cb(err, false);
    if (match) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  });
};

Db.prototype.verifyUser = function(id, password, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.get("SELECT password FROM users WHERE id = (?)", id, function(err, data) {
      if (err) return cb(err, false);
      self.verify(data.password, password, cb);
    });
  });
};

// Update the last login date in the database for the provided id (called on a successful login)
Db.prototype.updateLogin = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    var now = new Date().valueOf();
    self.db.run("UPDATE users SET lastLogin = (?) WHERE id=(?)", now.toString(), id, function(err) {
      if (err) return cb(err);
      return cb(null);
    });
  });
};

// Change the password of a user (must have id, old password, and new password)
// return error and success in callback
Db.prototype.changePassword = function(id, oldPassword, newPassword, cb) {
  var self = this;
  self.verifyUser(id, oldPassword, function(err, success) {
    if (err) return cb(err, false);
    if (!success) return cb(null, false);

    createPassword(newPassword, function(err, hash) {
      if (err) return cb(err, false);
      self.db.serialize(function() {
        self.db.run("UPDATE users SET password = (?) WHERE id=(?)", hash, id, function(err) {
          if (err) return cb(err, false);
          return cb(null, true);
        });
      });
    });
  });
};

// Report a user failed to login (log this activity and start keeping and eye on this user)
Db.prototype.reportFailedLogin = function(ip, cb) {
  var self = this;
  var now = new Date().valueOf();
  self.db.serialize(function() {
    self.db.get("SELECT id, lastDate, threat FROM logins WHERE ip = (?)", ip, function(err, data) {
      if (err) return cb(err);
      if (!data) {
        self.db.run("INSERT INTO logins (ip, lastDate) VALUES((?), (?))", ip, now, function(err) {
          if (err) return cb(err);
          return cb(null);
        });
      } else {
        var threat = data.threat;
        var banned = 0;
        if (((now - data.lastDate) / 1000) < 3) {
          threat += 1;
        }
        if (threat > 50) banned = 1;
        self.db.run("UPDATE logins SET accessed = accessed + 1, lastDate = (?), threat = (?), banned = (?) WHERE id = (?)", now, threat, banned, data.id, function(err) {
          if (err) return cb(err);
          return cb(null);
        });
      }
    });
  });
};

// Get the power of a user
Db.prototype.getAccessStatus = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.get("SELECT access FROM users WHERE id = (?)", id, function(err, data) {
      if (err) return cb(err, null);
      if (data) {
        return cb(null, data.access);
      } else {
        return cb(null, -1);
      }
    });
  });
};

// Is the user and admin
Db.prototype.isAdmin = function(id, cb) {
  this.getAccessStatus(id, function(err, status) {
    if (err) return cb(err, false);
    return cb(null, status === 5);
  });
};

Db.prototype.isIpBlocked = function(ip, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.get("SELECT banned FROM logins WHERE ip = (?)", ip, function(err, data) {
      if (err) return cb(err, null);
      if (data) {
        return cb(null, data.banned === 1);
      }
      return cb(null, false);
    });
  });
};

// set the power of a user to the new power
Db.prototype.updateAdminPower = function(id, power, cb) {
  var self = this;
  if (power < 0 || power > 5) {
    return cb(new Error('Value out of range'));
  }
  self.db.serialize(function() {
    self.db.run("UPDATE users SET access = (?) WHERE id = (?)", power, id, function(err) {
      if (err) return cb(err);
      return cb(null);
    });
  });
};


// Check data for white list and required items
Db.prototype.checkFormData = function(data) {
  var whiteList = ['username', 'password', 'access', 'age']; // Allowed items
  var required = ['username', 'password', 'access']; // Required items

  // Check white list
  for (var i in data) {
    if (whiteList.indexOf(i) === -1) {
      return false;
    }
  }
  // Check required fields
  for (i in required) {
    if (typeof data[required[i]] === 'undefined') {
      return false;
    }
  }

  // Check the username and password are not ""
  if (data.username === "" || data.password === "") {
    return false;
  }

  // All test passed, return true
  return true;
};

Db.prototype.addSocket = function(id, socketId, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.run('INSERT INTO sockets (id, userId, login) VALUES ((?), (?), (?))', socketId, id, Date.now(), function(err) {
      if (err) return cb(err);
      return cb(null);
    });
  });
};

Db.prototype.removeSocket = function(socketId, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.run('DELETE FROM sockets WHERE id = (?)', socketId, function(err) {
      if (err) return cb(err);
      return cb(null);
    });
  });
};

// XXX: this may be removed
Db.prototype.isSocketBanned = function(socketId, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.get("SELECT banned FROM users JOIN sockets ON users.id = sockets.userId WHERE sockets.id = (?)", socketId, function(err, data) {
      if (err) return cb(err, null);
      if (data) return cb(null, data.banned === 1);
      return cb(null, false);
    });
  });
};


Db.prototype.socketUserId = function(socketId, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.get("SELECT userId FROM sockets WHERE id = (?)", socketId, function(err, data) {
      if (err) return cb(err, null);
      if (data) return cb(null, data.userId);
      return cb(null, null);
    });
  });
};

Db.prototype.isSocketSudo = function(socketId, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.get("SELECT access FROM users JOIN sockets ON users.id = sockets.userId WHERE sockets.id = (?)", socketId, function(err, data) {
      if (err) return cb(err, null);
      if (data) return cb(null, data.access === 5);
      return cb(null, null);
    });
  });
};

Db.prototype.banUser = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.run("UPDATE users SET banned = 1 WHERE id = (?)", id, function(err) {
      if (err) return cb(err);
      return cb(null);
    });
  });
};

Db.prototype.unbanUser = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.run("UPDATE users SET banned = 0 WHERE id = (?)", id, function(err) {
      if (err) return cb(err);
      return cb(null);
    });
  });
};

Db.prototype.isUserBanned = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.get("SELECT banned FROM users WHERE id = (?)", id, function(err, data) {
      if (err) return cb(err, null);
      return cb(null, data.banned === 1);
    });
  });
};

Db.prototype.userSockets = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.all("SELECT sockets.id FROM sockets WHERE userId = (?)", id, function(err, sockets) {
      if (err) return cb(err, null);
      return cb(null, sockets);
    });
  });
};

Db.prototype.dataForAdmin = function(cb) {
  var self = this;
  self.db.serialize(function() {
    self.db.all("SELECT id, username, access, banned FROM users", function(err, users) {
      if (err) return cb(err, null);
      self.db.all("SELECT sockets.id, sockets.userId, sockets.login, users.username, users.access FROM sockets JOIN users ON users.id = sockets.userId ORDER BY users.username, sockets.id", function(err, sockets) {
        if (err) return cb(err, null);
        return cb(null, {
          sockets: sockets,
          users: users
        });
      });
    });
  });
};

// Create a password hash using bcrypt
// Password hash is returned in a callback(err, password_hash)
function createPassword(password, cb) {
  bcrypt.genSalt(10, function(err, salt) {
    /* istanbul ignore next */
    if (err) return cb(err, null);

    bcrypt.hash(password, salt, function(err, hash) {
      /* istanbul ignore next */
      if (err) return cb(err, null);
      return cb(err, hash);
    });
  });
}


module.exports = Db;