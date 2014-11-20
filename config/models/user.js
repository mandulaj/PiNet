var crypto = require('crypto'),
  config = require("../config.json"),
  bcrypt = require("bcrypt");

function User(db, conn) {
  this.db = db;
}

// Gets info about user with the given id --> cb(err, user)
User.prototype.findById = function(id, cb) {
  var self = this;
  this.db.serialize(function() {
    var stm = self.db.prepare("SELECT * FROM users WHERE id=(?)");
    stm.get(id, function(err, user) {
      return cb(err, user);
    });
    stm.finalize();
  });
};


User.prototype.getIdFromUsername = function(username, cb) {
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


User.prototype.numUsers = function(username, cb) {
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

/* TODO: add this function*/
User.prototype.createNewUser = function(data, cb) {
  var self = this;
  self.createPassword(data.password, function(err, hash) {
    data.password = hash;
    var idHash = crypto.createHash(config.hash.name);
    idHash.update(data.username);
    idHash.update(data.password);
    self.db.serialize(function() {
      var stm = self.db.prepare("INSERT INTO users (id, username, password, lastLogin) VALUES ((?), (?), (?), (?))");
      var now = new Date();
      stm.run(idHash.digest(config.hash.encoding), data.username, data.password, now.toString(), function(err) {
        return cb(err, data);
      });
      stm.finalize();
    });
  });
};

User.prototype.verify = function(id, password, cb) {
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

User.prototype.updateLogin = function(id, cb) {
  var self = this;
  self.db.serialize(function() {
    var stm = self.db.prepare("UPDATE users SET lastLogin = (?) WHERE id=(?)");
    var now = new Date();
    stm.run(now.toString(), id, function(err, data) {
      return cb(err);
    });
    stm.finalize();
  });
};

User.prototype.changePassword = function(id, oldPassword, newPassword, cb) {
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

User.prototype.createPassword = function(password, cb) {
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

User.prototype.reportFailedLogin = function(ip, cb) {
  var self = this;
  var id = crypto.createHash(config.hash.name).update(ip).digest(config.hash.encoding);
  var now = new Date().valueOf();
  self.db.serialize(function() {
    var stm = self.db.prepare("INSERT INTO logins (id, ip, lastDate) VALUES((?), (?), (?))");
    stm.run(id, ip, now, function(err, data) {
      if (err && err.errno === 19) {
        var stm = self.db.prepare("UPDATE logins SET accessed = accessed + 1, lastDate = (?) WHERE id = (?)");
        stm.run(now, id, function(err, data) {
          //return cb(err);
        });
      }
      //return cb(err);
    });
  });
};


module.exports = User;