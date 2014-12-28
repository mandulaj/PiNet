/* Configuration file for the socket.io server */
var socketioJwt = require('socketio-jwt'),
  DB = require("../lib/dbReader.js"),
  SocketRouter = require('socket.io-events');



module.exports = function(socket, database, config){
  var db = new DB(database);

  // Admin only...
  var checkSudo = SocketRouter();
  checkSudo.on('killUser', function(socket, args, next) {
    db.isSocketSudo(socket.id, function(err, sudo){
      if (err) return next(new Error("DB Error"));
      if (!sudo) return;
      return next();
    });
  });

  // Registering routes
  var routes = SocketRouter();
  routes.use(checkSudo)
  routes.use(handleErrors)


  socket.use(socketioJwt.authorize({
    secret: config.secrets.jwt,
    handshake: true
  }));

  // All defined routes, See above
  socket.of("/commands").use(routes);

  socket.on("connection", function(socket) {
    db.isSocketBanned(socket.id, function(err, banned){
      if (err) return socket.emit("error", err);
      if (banned) {
        return socket.disconnect();
      } else {

        var id = socket.decoded_token.id;
        db.addSocket(id, socket.id, function(err){
          if (err) return socket.destroy();
        });
      }
    });
  });
}


function handleErrors(err, socket, args, next) {
    console.error(err.stack);
    socket.emit("error");
    // TODO: handle errors
    //next();
  }
