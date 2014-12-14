var crypto = require('crypto'),
  config = require("../config/config.json"),
  bcrypt = require("bcrypt");

function Db(db) {
  this.db = db;
}

// Gets info about user with the given id --> cb(err, user)
Db.prototype.findById = function(id, cb) {
  var self = this;
  this.db.serialize(function() {
    var stm = self.db.prepare("SELECT * FROM users WHERE id=(?)");
    stm.get(id, function(err, user) {
      return cb(err, user);
    });
    stm.finalize();
  });
};


// Get the id of a user, using his username
Db.prototype.getIdFromUsername = function(username, cb) {
  var self = this;
  this.db.serialize(function() {
    var stm = self.db.prepare("SELECT id FROM users WHERE username=(?)");
    stm.get(username, function(err, row) {
      if (err || !row) {
        return cb(err, null);
      }
      return cb(null, row.id);
    });
    stm.finalize();
  });
};

// Returns the number of users with a given username
Db.prototype.numUsers = function(username, cb) {
  var self = this;
  this.db.serialize(function() {
    var stm = self.db.prepare("SELECT COUNT(*) AS num FROM users WHERE username=(?)");
    stm.get(username, function(err, row) {
      if (err) {
        return cb(err, null);
      } else {
        return cb(null, row.num);
      }
    });
    stm.finalize();
  });
};

// Creates a new user using the data provided
Db.prototype.createNewUser = function(data, cb) {
  var self = this;
  self.createPassword(data.password, function(err, hash) {
    data.password = hash;
    var idHash = crypto.createHash(config.hash.name);
    idHash.update(data.username);
    idHash.update(data.password);
    self.db.serialize(function() {
      var stm = self.db.prepare("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))");
      var now = new Date().valueOf();
      stm.run(idHash.digest(config.hash.encoding), data.username, data.password, data.access, now, function(err) {
        return cb(err, data);
      });
      stm.finalize();
    });
  });
};

// verify a user using his id and password
// return error and success in callback
Db.prototype.verify = function(id, password, cb) {
  this.findById(id, function(err, user) {
    if (err || !user) {
      return cb(err, false);
    }
    bcrypt.compare(password, user.password, function(err, hash) {
      if (err || !hash) {
        return cb(err, false);
      }
      return cb(null, true);
    });
  });
};

// Update the last login date in the database (called on a successful login)
Db.prototype.updateLogin = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    var stm = self.db.prepare("UPDATE users SET lastLogin = (?) WHERE id=(?)");
    var now = new Date().valueOf();
    stm.run(now.toString(), id, function(err, data) {
      return cb(err);
    });
    stm.finalize();
  });
};

// Change the password of a user (must have id, old password, and new password)
// return error and success in callback
Db.prototype.changePassword = function(id, oldPassword, newPassword, cb) {
  var self = this;
  self.verify(id, oldPassword, function(err, success) {
    if (err || !success) {
      return cb(err, false);
    }
    self.createPassword(newPassword, function(err, hash) {
      if (err) {
        return cb(err, false);
      }
      self.db.serialize(function() {
        var stm = self.db.prepare("UPDATE users SET password = (?) WHERE id=(?)");
        stm.run(hash, id, function(err, data) {
          if (err) {
            return cb(err, false);
          }
          return cb(null, true);
        });
      });
    });
  });
};

// Create a password hash using bcrypt
// Password hash is returned in a callback(err, password_hash)
Db.prototype.createPassword = function(password, cb) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return cb(err, null);
    }
    bcrypt.hash(password, salt, function(err, hash) {
      if (err) {
        return cb(err, null);
      }
      cb(err, hash);
    });
  });
};

// Report a user failed to login (log this activity and start keeping and eye on this user)
Db.prototype.reportFailedLogin = function(ip, cb) {
  var self = this;
  var id = crypto.createHash(config.hash.name).update(ip).digest(config.hash.encoding);
  var now = new Date().valueOf();
  self.db.serialize(function() {
    var stm = self.db.prepare("SELECT id, lastDate, threat FROM logins WHERE id = (?)");
    stm.get(id, function(err, data) {
      if (err) return cb(err);
      if (!data) {
        stm = self.db.prepare("INSERT INTO logins (id, ip, lastDate) VALUES((?), (?), (?))");
        stm.run(id, ip, now, function(err, data) {
          return cb(err);
        });
      } else {
        var threat = data.threat;
        var banned = 0;
        if (((now - data.lastDate) / 1000) < 3) {
          threat += 1;
        }
        if(threat > 50) banned = 1;
        stm = self.db.prepare("UPDATE logins SET accessed = accessed + 1, lastDate = (?), threat = (?), banned = (?) WHERE id = (?)");
        stm.run(now, threat, banned, id, function(err, data) {
          return cb(err);
        });
      }
    });
  });
};

// Get the power of a user
Db.prototype.getAccessStatus = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    var stm = self.db.prepare("SELECT access FROM users WHERE id = (?)");
    stm.get(id, function(err, data) {
      if (!err) {
        return cb(data.access);
      } else {
        return cb(-1);
      }
    });
  });
};

// Is the user and admin
Db.prototype.isAdmin = function(id, cb) {
  this.getAccessStatus(id, function(status) {
    return cb(status === 5);
  });
};

Db.prototype.isIpBlocked = function(ip, cb) {
  var self = this;
  self.db.serialize(function(){
    var stm = self.db.prepare("SELECT banned FROM logins WHERE ip = (?)");
    stm.get(ip, function(err, data){
      if (err) return cb(err, null);
      return cb(null, data.banned === 1);
    });
  });
};

// set the power of a user to the new power
Db.prototype.updateAdminPower = function(id, power, cb) {
  var self = this;
  self.db.serialize(function() {
    var stm = self.db.prepare("UPDATE users SET access = (?) WHERE id = (?)");
    stm.run(power, id, function(err) {
      cb(err);
    });
  });
};


// Check data for white list and required items
Db.prototype.checkFormData = function(data) {
  var whiteList = ['username', 'password', 'access']; // Allowed items
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


module.exports = Db;
