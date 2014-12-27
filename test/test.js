var expect = require("expect.js");
var dbReader = require("../lib/dbReader.js")

var sqlite3 = require('sqlite3')
var database = new sqlite3.Database(":memory:");
var errorTestdatabase = new sqlite3.Database(":memory:");
require("../config/db.js")(database);
database.serialize();
errorTestdatabase.serialize();
populateDB(database);


describe("PiStat", function(){
  var Stat = require("../lib/pistat.js");
  var pistat = new Stat();
  describe("#constructor", function(){
    it("should return and object", function(){
      expect(pistat).to.be.an("object");
    });
    it("should have all the properties", function(){
      expect(pistat.os).to.be(require("os").type());
      expect(pistat.bootDate).to.be.a(Date);
    });
    it("should have all the functions", function(){
      expect(pistat._load).to.be.a("function");
      expect(pistat._getMemInfo).to.be.a("function");
      expect(pistat._getCpuInfo).to.be.a("function");
      expect(pistat.getSystemInfo).to.be.a("function");
    });
  });
  describe("_load", function(){

  });
  describe("_getMemInfo", function(){
    var res = pistat._getMemInfo();
    it("should return an object", function(){
      expect(res).to.be.an("object");
    });
    it("should return the info about memory", function(){
      expect(res.total).to.be.an("number");
      expect(res.free).to.be.an("number");
    });
  });
  describe("_getCpuInfo", function(){
    var res = pistat._getCpuInfo();
    it("should return an object", function(){
      expect(res).to.be.an("object");
    });
    it("should return the info about cpu", function(){
      expect(res.boot).to.be.a(Date);
      expect(res.avload).to.be.an(Array);
      //expect(res.load).to.be.an(Array); // FIXME: implement _load
      expect(res.cpus).to.be.an("object");
    });
  });
  describe("getSystemInfo", function(){
    var res = pistat.getSystemInfo();
    it("should return an object", function(){
      expect(res).to.be.an("object");
    });
    it("should expose info about the system", function(){
      expect(res.cpu).to.be.an("object");
      expect(res.mem).to.be.an("object");
    });
  });
});

describe("ConfigUtil", function(){
  var util = require("../config/lib/configUtil.js");
  describe("#main", function(){
    it("should provide all function", function(){
      expect(util.merge_options).to.be.a("function");
    })
  });
  describe("#merge_options", function(){
    it("should return default function on undefined", function(){
      var testOpts = {
        opt1: "abc",
        opt2: 123
      }
      expect(util.merge_options(undefined, testOpts)).to.eql(testOpts);
    });
    it("should return default function on null", function(){
      var testOpts = {
        opt1: "abc",
        opt2: 123
      }
      expect(util.merge_options(null, testOpts)).to.eql(testOpts);
    });
    it("should return default function on {}", function(){
      var testOpts = {
        opt1: "abc",
        opt2: 123
      }
      expect(util.merge_options({}, testOpts)).to.eql(testOpts);
    });
    it("should override default options", function(){
      var defaultOpts = {
        opt1: "Hello World",
        opt2: 1234,
        opt3: true,
        opt4: null,
        opt5: 5.678,
        opt6: {
          subop: "test"
        }
      }

      var expectedOpts = [
        {
          opt1: "End of world",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: 5.678,
          opt6: {
            subop: "test"
          }
        },
        {
          opt1: "Hello World",
          opt2: "Test",
          opt3: true,
          opt4: null,
          opt5: 123,
          opt6: {
            subop: "test"
          }
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: 5.678,
          opt6: {},
          opt7: null
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: true,
          opt5: 5.678,
          opt6: {
            subop: "test"
          },
          other: "Testing"
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: null,
          opt6: {
            subop: "test"
          },
          opt7: "aloha"
        },
        {
          opt1: "Modified",
          opt2: 4321,
          opt3: false,
          opt4: "Hello",
          opt5: -3.1415,
          opt6: {
            subop: "",
            other: "123",
            testing: 123
          },
          opt7: "hi"
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: 5.678,
          opt6: {
            subop: "test"
          },
          other: 123,
          more: "Hello",
          someMore: 34343,
          "crazYName345$@#@#": Infinity
        }
      ]

      expect(util.merge_options({}, defaultOpts)).to.eql(defaultOpts);
      expect(util.merge_options({
        opt1: "End of world"
      }, defaultOpts)).to.eql(expectedOpts[0]);
      expect(util.merge_options({
        opt2: "Test",
        opt5: 123
      }, defaultOpts)).to.eql(expectedOpts[1]);
      expect(util.merge_options({
        opt6: {},
        opt7: null
      }, defaultOpts)).to.eql(expectedOpts[2]);
      expect(util.merge_options({
        other: "Testing",
        opt4: true
      }, defaultOpts)).to.eql(expectedOpts[3]);
      expect(util.merge_options({
        opt7: "aloha",
        opt5: null
      }, defaultOpts)).to.eql(expectedOpts[4]);
      expect(util.merge_options(expectedOpts[5], defaultOpts)).to.eql(expectedOpts[5]);
      expect(util.merge_options({
        other: 123,
        more: "Hello",
        someMore: 34343,
        "crazYName345$@#@#": Infinity
      }, defaultOpts)).to.eql(expectedOpts[6]);
    });
  });
});


// Add tests for some main libs
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
      // Todo: find a way to implement this
      done();
      setTimeout(function(){

      }, 3000)
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
        database.all("SELECT * FROM sockets", function(err, rows){
          if (err) return done(err);
          expect(rows).to.have.length(1);
          expect(rows[0].id).to.be("Key1");
          expect(rows[0].userId).to.be(1);

          db.addSocket(1, "Key1.1", function(err){
            if (err) return done(err);
            database.all("SELECT * FROM sockets", function(err, rows){
              if (err) return done(err);
              expect(rows).to.have.length(2);
              expect(rows[1].id).to.be("Key1.1");
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
        database.all("SELECT * FROM sockets", function(err, rows){
          if (err) return done(err);
          expect(rows).to.have.length(3);
          expect(rows[2].id).to.be("Key5");
          expect(rows[2].userId).to.be(5);
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
        database.all("SELECT * FROM sockets", function(err, rows){
          if (err) return done(err);
          expect(rows).to.have.length(2);
          expect(rows[0].id).to.be("Key1.1");
          expect(rows[0].userId).to.be(1);
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
    it("should return true for banned users", function(done){
      db.isSocketBanned("Key5", function(err, banned){
        if (err) return done(err);
        expect(banned).to.be(true);
        done();
      });
    });
    it("should return false for not banned users", function(done){
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
});


function populateDB(db) {
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  1, "root", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 5, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  2, "user1", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 0, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  3, "user2", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 2, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  4, "user3", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 1, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin, banned) VALUES ((?), (?), (?), (?), (?), (?))",  5, "user4", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 1, Date.now(), 1);

  db.run("INSERT INTO logins (id, ip, accessed, banned) VALUES ((?), (?), (?), (?))",  1, "555.555.555.555", 45, 1);
}
