var crypto = require('crypto'),
  config = require("../config.json"),
  bcrypt = require("bcrypt");

function User(db, conn) {
  this.db = db;
}

User.prototype.findById = function(id, cb) {
  var self = this;
  this.db.serialize(function(){
    var stm = self.db.prepare("SELECT id, username FROM users WHERE id=(?)");
    stm.get(id, function(err, user){
      return cb(err, user);
    });
    stm.finalize();
  });
};

User.prototype.findByUsername = function(username, cb) {
  var self = this;
  this.db.serialize(function(){
    var stm = self.db.prepare("SELECT id, username, password FROM users WHERE username=(?)");
    stm.get(username, function(err, row){
      return cb(err, row);
    });
    stm.finalize();
  });
};


User.prototype.numUsers = function(username, cb) {
  var self = this;
  this.db.serialize(function(){
      var stm = self.db.prepare("SELECT COUNT(*) AS num FROM users WHERE username=(?)");
      stm.get(username, function(err, row){
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
  bcrypt.genSalt(10, function(err, salt){
    if (err) {
      return cb(err, null);
    }
    bcrypt.hash(data.password, salt, function(err, hash){
      if (err) {
        return cb(err, null);
      }
      data.password = hash;

      var idHash = crypto.createHash(config.hash.name);

      idHash.update(data.username);
      idHash.update(data.password);
      self.db.serialize(function(){
        var stm = self.db.prepare("INSERT INTO users (id, username, password) VALUES ((?),(?),(?))");
        stm.run(idHash.digest(config.hash.encoding), data.username, data.password, function(err){
          return cb(err, data);
        });
        stm.finalize();
      });
    });
  });
};

User.prototype.verify = function(username, password, cb) {
  this.findByUsername(username, function(err, user) {
    if (err || !user) {
      return cb(err, false);
    }
    bcrypt.compare(password, user.password, function(err, hash){
      if (err) {
        return cb(err, false);
      }
      return cb(null, user);
    });
  });
};




module.exports = User;
