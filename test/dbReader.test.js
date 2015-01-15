var expect = require("expect.js");
var populateDB = require("./lib/testUtil.js").populateDB;

var dbReader = require("../lib/dbReader.js");



var sqlite3 = require('sqlite3');
var database = new sqlite3.Database(":memory:");
var errorTestdatabase = new sqlite3.Database(":memory:");
require("../config/db.js")(database);
database.serialize();
errorTestdatabase.serialize();
populateDB(database);


describe("DB Wrapper", function(){

  var db = new dbReader(database);
  var errdb = new dbReader(errorTestdatabase);

  describe("#constructor", function(){
    it("should return an object", function(){
      expect(db).to.be.an("object");
    });
    it("should have all the methods", function(){
      expect(db.findById).to.be.a("function");
      expect(db.getIdFromUsername).to.be.a("function");
      expect(db.doesExist).to.be.a("function");
      expect(db.createNewUser).to.be.a("function");
      expect(db.verify).to.be.a("function");
      expect(db.verifyUser).to.be.a("function");
      expect(db.updateLogin).to.be.a("function");
      expect(db.changePassword).to.be.a("function");
      expect(db.reportFailedLogin).to.be.a("function");
      expect(db.getAccessStatus).to.be.a("function");
      expect(db.isAdmin).to.be.a("function");
      expect(db.isIpBlocked).to.be.a("function");
      expect(db.updateAdminPower).to.be.a("function");
      expect(db.checkFormData).to.be.a("function");
      expect(db.addSocket).to.be.a("function");
      expect(db.removeSocket).to.be.a("function");
      expect(db.isSocketBanned).to.be.a("function");
      expect(db.socketUserId).to.be.a("function");
      expect(db.isSocketSudo).to.be.a("function");
      expect(db.banUser).to.be.a("function");
      expect(db.unbanUser).to.be.a("function");
      expect(db.isUserBanned).to.be.a("function");
      expect(db.userSockets).to.be.a("function");
      expect(db.dataForAdmin).to.be.a("function");
    });
  });
  describe("#findById", function(){
    it("should find the right user", function(done) {
      db.findById(1, function(err, user){
        expect(err).to.be(null);
        expect(user.username).to.be("root");
        expect(user.access).to.be(5);
        done();
      });
    });
    it("should return null when user does not exist", function(done){
      db.findById(99999999, function(err, user){
        expect(err).to.be(null);
        expect(user).to.be(null);
        done();
      });
    });
    it("should return an error when one happens", function(done){
      errdb.findById(999999, function(err, user){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(user).to.be(null);
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#getIdFromUsername", function(){
    it("should return the id for usernames that exist", function(done){
      db.getIdFromUsername("user1", function(err, id){
        expect(err).to.be(null);
        expect(id).to.be(2);
        done();
      });
    });
    it("should return null for username that don't exist", function(done){
      db.getIdFromUsername("username_does_not_ever_exist", function(err, id){
        expect(err).to.be(null);
        expect(id).to.be(null);
        done();
      });
    });
    it("should return an error when one happens", function(done){
      errdb.getIdFromUsername("username_does_not_ever_exist", function(err, id){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(id).to.be(null);
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#doesExist", function(){
    it("should return true if username exists", function(done){
      db.doesExist("root", function(err, exists){
        expect(err).to.be(null);
        expect(exists).to.be(true);
        done();
      });
    });
    it("should return false if username does not exist", function(done){
      db.doesExist("username_does_not_ever_exist", function(err, exists){
        expect(err).to.be(null);
        expect(exists).to.be(false);
        done();
      });
    });
    it("should return error when one occurs", function(done){
      errdb.doesExist("root", function(err, exists){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(exists).to.be(null);
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#createNewUser", function(){
    it("should create a new user in the database", function(done){
      db.createNewUser({
        username: "newUser123",
        password: "password",
        access: 1
      }, function(err, created){
        if (err) done(err);
        expect(created).to.be(true);
        db.doesExist("newUser123", function(err, exists){
          if (err) done(err);
          expect(exists).to.be(true);
          done();
        });
      });
    });
    it("should error creating a new user if the username is taken", function(done){
      db.createNewUser({
        username: "newUser123",
        password: "password",
        access: 1
      }, function(err, created){
        expect(created).to.be(false);
        expect(err).to.be.an(Error);
        expect(err.code).to.be("SQLITE_CONSTRAINT");
        done();
      });
    });
    it("should pass an error when one happens", function(done){
      errdb.createNewUser({
        username: "newUser123",
        password: "password",
        access: 1
      }, function(err, created){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(created).to.be(false);
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#verify", function(){
    it("should return true if password matches the hash", function(done){
      db.verify('$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', '123456', function(err, match){
        expect(err).to.be(null);
        expect(match).to.be(true);
        done();
      });
    });
    it("should return false if password does not match the hash", function(done){
      db.verify('$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 'wrongPassword', function(err, match){
        expect(err).to.be(null);
        expect(match).to.be(false);
        done();
      });
    });
    it("should return an error when one happens", function(done){
      db.verify(123, '123456', function(err, match){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        expect(match).to.be(false);
        done();
      });
    });
  });
  describe("#verifyUser", function(){
    it("should return true if the password matches the user record", function(done){
      db.verifyUser(1, "123456", function(err, match){
        expect(err).to.be(null);
        expect(match).to.be(true);
        done();
      });
    });
    it("should return false if the password does not match the user record", function(done){
      db.verifyUser(2, "wrongPassword", function(err, match){
        expect(err).to.be(null);
        expect(match).to.be(false);
        done();
      });
    });
    it("should return an error if it happens", function(done){
      errdb.verifyUser(1, "123456", function(err, match){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        expect(match).to.be(false);
        done();
      });
    });
  });
  describe("#updateLogin", function(){
    it("should set the lastLogin to the current time", function(done) {
      db.findById(1, function(err, user){
        if (err) return done(err);
        var oldTime = parseInt(user.lastLogin);
        var actualTime = Date.now();
        db.updateLogin(1, function(err){
          expect(err).to.be(null);
          db.findById(1, function(err, user){
            if (err) return done(err);
            var newTime = parseInt(user.lastLogin);
            expect(oldTime).to.not.eql(newTime);
            expect(Math.abs(newTime - actualTime)).to.be.below(10);
            done();
          });
        });
      });
    });
    it("should return an error when one happens", function(done){
      errdb.updateLogin(1, function(err){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#changePassword", function(){
    it("should update the password to the new password", function(done){
      db.changePassword(1, "123456", "newPassword", function(err, success){
        expect(err).to.be(null);
        expect(success).to.be(true);
        db.verifyUser(1, "newPassword", function(err, match){
          expect(err).to.be(null);
          expect(match).to.be(true);
          done();
        });
      });
    });
    it("should refuse to update if old password is wrong", function(done){
      db.changePassword(1, "123456", "newPassword", function(err, success){
        expect(err).to.be(null);
        expect(success).to.be(false);
        db.verifyUser(1, "newPassword", function(err, match){
          expect(err).to.be(null);
          expect(match).to.be(true);
          done();
        });
      });
    });
    it("should return an error when one happens", function(done) {
      errdb.changePassword(1, "123456", "newPassword", function(err, success){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        expect(success).to.be(false);
        done();
      });
    });
  });
  describe("#reportFailedLogin", function(){
    it("should create a new row if ip does not exist yet" , function(done){
      db.reportFailedLogin("192.168.0.1", function(err) {
        expect(err).to.be(null);
        database.get("SELECT COUNT(ip) AS num, threat, accessed FROM logins WHERE ip = '192.168.0.1'", function(err, data){
          if (err) done(err);
          expect(data.num).to.be(1);
          expect(data.threat).to.be(1);
          expect(data.accessed).to.be(1);
          done();
        });
      });
    });
    it("should not create a new row if ip does exist" , function(done){
      db.reportFailedLogin("192.168.0.1", function(err) {
        expect(err).to.be(null);
        database.get("SELECT COUNT(ip) AS num, threat FROM logins WHERE ip = '192.168.0.1'", function(err, data){
          if (err) done(err);
          expect(data.num).to.be(1);
          expect(data.threat).to.be(2)
          done();
        });
      });
    });
    it("should increment number of accesses", function(done){
      database.get("SELECT accessed, threat FROM logins WHERE ip = '192.168.0.1'", function(err, data){
        if(err) done(err);
        expect(data.accessed).to.be(2);
        expect(data.threat).to.be(2);
        done();
      });
    });
    it("should not increment threat if delay exceeds 3 seconds", function(done){
      db.reportFailedLogin("555.555.555.444", function(err){
        if (err) return done(err);
        database.get("SELECT accessed, threat, banned FROM logins WHERE ip = '555.555.555.444'", function(err, data){
          if (err) return done(err);
          expect(data.accessed).to.be(60);
          expect(data.threat).to.be(50);
          expect(data.banned).to.be(0);
          done();
        });
      });
    });
    it("should ban user if threat exceeds 50", function(done){
      db.reportFailedLogin("555.555.555.444", function(err){
        if (err) return done(err);
        database.get("SELECT accessed, threat, banned FROM logins WHERE ip = '555.555.555.444'", function(err, data){
          if (err) return done(err);
          expect(data.accessed).to.be(61);
          expect(data.threat).to.be(51);
          expect(data.banned).to.be(1);
          done();
        });
      });
    });
    it("should return any errors", function(done){
      errdb.reportFailedLogin("127.0.0.1", function(err) {
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#getAccessStatus", function(){
    it("should return the access status of the give id_user", function(done){
      db.getAccessStatus(1, function(err, status){
        expect(err).to.be(null);
        expect(status).to.be(5);

        db.getAccessStatus(3, function(err, status){
          expect(err).to.be(null);
          expect(status).to.be(2);
          done();
        });
      });
    });
    it("should return the -1 on unknown id", function(done){
      db.getAccessStatus(999999, function(err, status){
        expect(err).to.be(null);
        expect(status).to.be(-1);

        db.getAccessStatus(12312312, function(err, status){
          expect(err).to.be(null);
          expect(status).to.be(-1);
          done();
        });
      });
    });
    it("should return any error", function(done){
      errdb.getAccessStatus(1, function(err, status){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        expect(status).to.be(null);
        done();
      });
    });
  });
  describe("#isAdmin", function(){
    it("should return true if a user is admin", function(done){
      db.isAdmin(1, function(err, admin){
        if (err) return done(err);
        expect(admin).to.be(true);
        done();
      });
    });
    it("should return false if a user is not an admin", function(done){
      db.isAdmin(2, function(err, admin){
        if (err) return done(err);
        expect(admin).to.be(false);
        done();
      });
    });
    it("should return any errors", function(done){
      errdb.isAdmin(1, function(err, admin){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(admin).to.be(false);
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#isIpBlocked", function(){
    it("should return false if ip is not blocked", function(done){
      db.isIpBlocked("192.168.0.1", function(err, blocked){
        if (err) return done(err);
        expect(blocked).to.be(false);
        done();
      });
    });
    it("should return false if ip is not on the list", function(done){
      db.isIpBlocked("0.0.0.0", function(err, blocked){
        if (err) return done(err);
        expect(blocked).to.be(false);
        done();
      });
    });
    it("should return true if ip is blocked", function(done){
      db.isIpBlocked("555.555.555.555", function(err, blocked){
        if (err) return done(err);
        expect(blocked).to.be(true);
        done();
      });
    });
    it("should return any errors and blocked should be null in any case", function(done){
      errdb.isIpBlocked("192.168.0.1", function(err, blocked){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        expect(blocked).to.be(null);
        done();
      });
    });
  });
  describe("#updateAdminPower", function(){
    it('should update user power to the new power provided', function(done){
      db.updateAdminPower(2, 5, function(err){
        if(err) done(err);
        db.isAdmin(2, function(err, admin){
          if(err) done(err);
          expect(admin).to.be(true);
          done();
        });
      });
    });
    it('should not update user power if value is below 0', function(done){
      db.updateAdminPower(3, -3, function(err){
        expect(err.message).to.match(/Value out of range/);
        db.getAccessStatus(3, function(err, status){
          if(err) done(err);
          expect(status).to.be(2);
          done();
        });
      });
    });
    it('should not update user power if value is above 5', function(done){
      db.updateAdminPower(3, 7, function(err){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err.message).to.match(/Value out of range/);
        db.getAccessStatus(3, function(err, status){
          if(err) done(err);
          expect(status).to.be(2);
          done();
        });
      });
    });
    it('should return any db errors', function(done){
      errdb.updateAdminPower(4, 2, function(err){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err.message).to.not.match(/Value out of range/);
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#checkFormData", function(){
    it('should pass valid forms', function(done){
      expect(db.checkFormData({
        username: "user",
        password: "password",
        access: 3
      })).to.be(true);
      expect(db.checkFormData({
        username: "user",
        password: "password",
        access: 3,
        age: 23
      })).to.be(true);
      done();
    });
    it("should not allow data not white-listed", function(done){
      expect(db.checkFormData({
        username: "user",
        password: "password",
        access: 3,
        another: "Hello"
      })).to.be(false);
      expect(db.checkFormData({
        username: "user",
        password: "password",
        access: 3,
        age: 23,
        hackingData: 42
      })).to.be(false);
      done();
    });
    it("should return false if missing a required field", function(done){
      expect(db.checkFormData({
        username: "user",
        password: "password",
      })).to.be(false);
      expect(db.checkFormData({
        username: "user",
        access: 3,
        age: 23
      })).to.be(false);
      expect(db.checkFormData({
        access: 3,
        age: 23
      })).to.be(false);
      expect(db.checkFormData({
        age: 23
      })).to.be(false);
      done();
    });
    it("should not allow empty username", function(done){
      expect(db.checkFormData({
        username: "",
        password: "password",
        access: 3,
        age: 23
      })).to.be(false);
      done();
    });
    it("should not allow empty password", function(done){
      expect(db.checkFormData({
        username: "user",
        password: "",
        access: 3,
        age: 23
      })).to.be(false);
      done();
    });
    it("should allow optional data", function(done){
      expect(db.checkFormData({
        username: "user",
        password: "validPassword",
        access: 3,
        age: 16
      })).to.be(true);
      done();
    });
  });
  describe("#addSocket", function(){
    it('should add a new socket to the database', function(done){
      db.addSocket(1, "Key1", function(err){
        if (err) return done(err);
        database.all("SELECT * FROM sockets WHERE id = 'Key1' AND userId = 1", function(err, rows){
          if (err) return done(err);
          expect(rows).to.have.length(1);
          expect(rows[0].id).to.be("Key1");
          expect(rows[0].userId).to.be(1);

          db.addSocket(1, "Key1.1", function(err){
            if (err) return done(err);
            database.all("SELECT * FROM sockets WHERE id = 'Key1.1' OR id = 'Key1' AND userId = 1", function(err, rows){
              if (err) return done(err);
              expect(rows).to.have.length(2);
              expect(rows[1].userId).to.be(1);
              done();
            });
          });
        });
      });
    });
    it('should add a new socket for banned users', function(done){
      db.addSocket(5, "Key5", function(err){
        if (err) return done(err);
        database.all("SELECT * FROM sockets WHERE id = 'Key5' AND userId = 5", function(err, rows){
          if (err) return done(err);
          expect(rows).to.have.length(1);
          expect(rows[0].id).to.be("Key5");
          expect(rows[0].userId).to.be(5);
          done();
        });
      });
    });
    it('should return any errors', function(done){
      errdb.addSocket(1, "Key1", function(err){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#removeSocket", function(){
    it('should remove given socket from the database', function(done){
      db.removeSocket("Key1", function(err){
        if (err) return done(err);
        database.all("SELECT * FROM sockets WHERE id = 'Key1' AND userId = 1", function(err, rows){
          if (err) return done(err);
          expect(rows).to.have.length(0);
          done();
        });
      });
    });
    it('should report any db errors', function(done){
      errdb.removeSocket("Key1", function(err){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#isSocketBanned", function(){
    it("should return true for banned socket users", function(done){
      db.isSocketBanned("Key5", function(err, banned){
        if (err) return done(err);
        expect(banned).to.be(true);
        done();
      });
    });
    it("should return false for not banned socket users", function(done){
      db.isSocketBanned("Key1.1", function(err, banned){
        if (err) return done(err);
        expect(banned).to.be(false);
        done();
      });
    });
    it("should return false for not existing sockets", function(done){
      db.isSocketBanned("SomeKey", function(err, banned){
        if (err) return done(err);
        expect(banned).to.be(false);
        done();
      });
    });
    it("should return null if socket does not exist", function(done){
      db.isSocketSudo("NoKey", function(err, sudo){
        if(err) return done(err);
        expect(sudo).to.be(null);
        done();
      });
    });
    it("should return any db errors", function(done){
      errdb.isSocketBanned("SomeKey", function(err, banned){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        expect(banned).to.be(null);
        done();
      });
    });
  });
  describe("#socketUserId", function(){
    it("should return the user id of the socket owner", function(done){
      db.socketUserId("Key5", function(err, user){
        if (err) return done(err);
        expect(user).to.be(5);
        done();
      });
    });
    it("should return the null if socket id does not exist", function(done){
      db.socketUserId("SomeSocketKey", function(err, user){
        if (err) return done(err);
        expect(user).to.be(null);
        done();
      });
    });
    it("should return any db errors", function(done){
      errdb.socketUserId("Key5", function(err, user){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
  describe("#isSocketSudo", function(){
    it("should return true if socket belongs to a superuser", function(done){
      db.isSocketSudo("Key1.1", function(err, sudo){
        if(err) return done(err);
        expect(sudo).to.be(true);
        done();
      });
    });
    it("should return false if socket belongs to a superuser", function(done){
       db.isSocketSudo("Key5", function(err, sudo){
        if(err) return done(err);
        expect(sudo).to.be(false);
        done();
      });
    });
    it("should return any db errors", function(done){
       errdb.isSocketSudo("Key1.1", function(err, sudo){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(err).to.be.an(Error);
        expect(sudo).to.be(null);
        done();
      });
    });
  });
  describe("#banUser", function(){
    it("should ban a user", function(done){
      db.banUser(6, function(err){
        if(err) return done(err);
        database.get("SELECT banned FROM users WHERE id = 6", function(err, data){
          if(err) return done(err);
          expect(data.banned).to.be(1);
          done();
        });
      });
    });
    it("should ban a user that is already banned", function(done){
      db.banUser(6, function(err){
        if(err) return done(err);
        database.get("SELECT banned FROM users WHERE id = 6", function(err, data){
          if(err) return done(err);
          expect(data.banned).to.be(1);
          done();
        });
      });
    });
    it("should return any db errors", function(done){
       errdb.banUser(6, function(err){
        if (!err) return done(new Error("Has no error but expected one."));
        done();
      });
    });
  });
  describe("#unbanUser", function(){
    it("should unban a user", function(done){
      db.unbanUser(7, function(err){
        if(err) return done(err);
        database.get("SELECT banned FROM users WHERE id = 7", function(err, data){
          if(err) return done(err);
          expect(data.banned).to.be(0);
          done();
        });
      });
    });
    it("should unban a user that is already unbanned", function(done){
      db.unbanUser(7, function(err){
        if(err) return done(err);
        database.get("SELECT banned FROM users WHERE id = 7", function(err, data){
          if(err) return done(err);
          expect(data.banned).to.be(0);
          done();
        });
      });
    });
    it("should return any db errors", function(done){
       errdb.unbanUser(7, function(err){
        if (!err) return done(new Error("Has no error but expected one."));
        done();
      });
    });
  });
  describe("#isUserBanned", function(){
    it("should return true if a user is banned", function(done){
      db.isUserBanned(6,function(err, banned){
        if(err) return done(err);
        expect(banned).to.be(true);
        done();
      });
    });
    it("should return false if a user is not banned", function(done){
      db.isUserBanned(7,function(err, banned){
        if(err) return done(err);
        expect(banned).to.be(false);
        done();
      });
    });
    it("should return any db errors", function(done){
      errdb.isUserBanned(7,function(err, banned){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(banned).to.be(null);
        done();
      });
    });
  });
  describe("#userSockets", function(){
    it("should return a list of sockets owned by user", function(done){
      db.userSockets(6, function(err, sockets){
        if (err) done(err);
        expect(sockets).to.have.length(4);
        done();
      });
    });
    it("should return an empty list if user owns nothing", function(done){
      db.userSockets(9, function(err, sockets){
        if (err) done(err);
        expect(sockets).to.have.length(0);
        done();
      });
    });
    it("should return any db errors", function(done){
      errdb.userSockets(6, function(err, sockets){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(sockets).to.be(null);
        done();
      });
    });
  });
  describe("#dataForAdmin", function(){
    it("should return an object", function(done){
      db.dataForAdmin(function(err, data){
        if (err) done(err);
        expect(data).to.be.an("object");
        done();
      });
    });
    it("should contain all the fields", function(done){
      db.dataForAdmin(function(err, data){
        if (err) done(err);
        expect(data).to.only.have.keys(['users', 'sockets']);
        expect(data.users).to.be.an(Array);
        expect(data.sockets).to.be.an(Array);
        done();
      });
    });
    it("should return users which contain all users in the db", function(done){
      db.dataForAdmin(function(err, data){
        if (err) done(err);
        expect(data.users).to.have.length(10);
        for(var i in data.users) {
          expect(data.users[i]).to.only.have.keys(['id', 'username', 'access', 'banned']);
        }
        done();
      });
    });
    it("should return all sockets in the database", function(done){
      db.dataForAdmin(function(err, data){
        if (err) done(err);
        expect(data.sockets).to.have.length(9);
        for(var i in data.sockets) {
          expect(data.sockets[i]).to.only.have.keys(['id', 'userId', 'login','username', 'access']);
        }
        done();
      });
    });
    it("should return any db errors", function(done){
      errdb.dataForAdmin(function(err, data){
        if (!err) return done(new Error("Has no error but expected one."));
        expect(data).to.be(null);
        done();
      });
    });
  });
});

