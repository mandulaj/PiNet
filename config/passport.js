var LocalStrategy = require('passport-local').Strategy,
  UserModel = require('./models/user.js'),
  Db = require("../lib/dbReader.js");



module.exports = function(passport, db) {
  var database = new Db(db);

  passport.serializeUser(function(user, done) {
    return done(null, user.getId());
  });

  passport.deserializeUser(function(id, done) {
    // Create a new User Schema Object
    UserModel(id, db, function(err, user) {
      if (err) return done(err, null);
      return done(null, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done) {
      var clientUser = req.user;
      // is the user logged on
      if (!clientUser.id) {
        return done(null, false);
      }

      // is he an admin
      clientUser.isAdmin(function(err, admin) {
        if (err) return done(err, false);
        if (!admin) {
          // No, return false
          return done(null, false);
        }

        var newData = req.body;

        //Check if the data is ok
        if (!database.checkFormData(newData)) {
          return done(null, false);
        }

        // Does the user already exist
        database.doesExist(username, function(err, exist) {
          if (err) return done(err, false);
          if (exist) return done(null, false);

          // All is good, make the new user
          database.createNewUser(newData, function(err, user) {
            if (err) return done(err, false);
            return done(null, true);
          });
        });
      });
    }
  ));


  passport.use('local-login', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done) {
      // Check if we even have a username and password
      if (!username)
        return done(null, false); // No, return false to user
      if (!password)
        return done(null, false); // No, return false to user

      // Lets try to get the usr id from our database
      UserModel(username, db, function(err, user) {
        if (err) return done(err, false);
        // If the user does not exist, log him and return false to the user
        if (!user) {
          return database.reportFailedLogin(req.ip, function(err) {
            return done(err, false);
          });
        }

        // Try to verify the user with the password
        user.verify(password, function(err, success) {
          // If there was no error and we have a success, update the user login status and send him his signed token
          if (err) return done(err, false);
          if (success) {
            user.updateLogin(function(err) {
              // Send the user his id
              if (err) return done(err, false);

              return done(null, user);
            });
          } else {
            // The verification failed so we just report the users ip and return false to him
            database.reportFailedLogin(req.ip, function(err) {
              return done(err, false);
            });
          }
        });
      });
    }
  ));
};
