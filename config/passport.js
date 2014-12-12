var LocalStrategy = require('passport-local').Strategy,
  UserModel = require('./models/user.js');



module.exports = function(passport, db) {
  var User = new UserModel(db);
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(null, user);
    });
  });


  passport.use('local-signup', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done) {

      // is the user logged on
      if (!req.user.id) {
        return done(null, false);
      }
      // is he an admin
      User.isAdmin(req.user.id, function(admin) {
        if (!admin) {
          // No, return false
          return done(null, false);
        }

        var newData = req.body;

        //Check if the data is ok
        if (!User.checkFormData(newData)) {
          return done(null, false);
        }

        // Does the user already exist
        User.numUsers(username, function(err, num) {
          if (err || num) {
            done(err, false);
          } else {
            // All is good, make the new user
            User.createNewUser(newData, function(err, user) {
              done(err, user);
            });
          }
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
      User.getIdFromUsername(username, function(err, id) {
        // If the user does not exist, log him and return false to the user
        if (!id) {
          return User.reportFailedLogin(req.ip, function(err) {
            return done(err, false);
          });
        }

        // Try to verify the user with the password
        User.verify(id, password, function(err, success) {
          // If there was no error and we have a success, update the user login status and send him his signed token
          if (!err && success) {
            User.updateLogin(id, function(err) {
              // Send the user his id
              if (err) {
                return done(err, false);
              }
              done(null, {
                id: id
              });
            });
          } else {
            // The verification failed so we just report the users ip and return false to gim
            User.reportFailedLogin(req.ip, function(err) {
              done(err, false);
            });
          }
        });
      });
    }
  ));

};
