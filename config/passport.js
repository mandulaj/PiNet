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
      // TODO: check length of username and password
      /*if (!checkSignupForm(req.body)) {
        return done(null, null);
      }*/
      User.numUsers(username, function(err, num) {
        if (err || num) {
          done(err, false);
        } else {
          User.createNewUser(req.body, function(err, user) {
            done(err, user);
          });
        }
      });
    }
  ));


  passport.use('local-login', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done) {
      if (!username)
        done(null, false);
      if (!password)
        done(null, false);

      User.getIdFromUsername(username, function(err, id) {

        User.verify(id, password, function(err, success) {

          if (!err && success) {
            User.updateLogin(id, function() {
              done(err, {
                id: id
              });
            });
          } else {
            User.reportFailedLogin(req.ip, function() {
              if (err) {
                done(err, false);
              }
            });
          }
        });
      });
    }
  ));

};