var //config = require("../../config/config.json"),
  bcrypt = require("bcrypt");

function User(db, conn) {
  this.db = db;
}

User.prototype.findById = function(id, cb) {
  var self = this;
  this.db.serialize(function(){
    var stm = self.db.prepare("SELECT rowid AD id, username FROM users WHERE rowid=(?)");
    stm.get(id, function(err, user){
      return cb(err, user);
    });
    stm.finalize();
  });
};

User.prototype.findByUsername = function(username, cb) {
  var self = this;
  this.db.serialize(function(){
    var stm = self.db.prepare("SELECT rowid AD id, username, password FROM users WHERE username=(?)");
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
      self.db.serialize(function(){
        var stm = self.db.prepare("INSERT INTO users (username, password) VALUES ((?),(?))");
        stm.run(data.username, data.password, function(err){
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

    if (bcrypt.compareSync(password, user.password)) {
      cb(null, user);
    } else {
      cb(null, false);
    }

  });
};




module.exports = User;
