/* Configuration file for the socket.io server */
var socketioJwt = require('socketio-jwt'),
  DB = require("../lib/dbReader.js"),
  SocketRouter = require('socket.io-events');



module.exports = function(socket, database, config){
  var db = new DB(database);

  // Admin only...
  var checkSudo = SocketRouter();
  checkSudo.on('*', function(socket, args, next) {
    db.isSocketSudo(socket.id, function(err, sudo){
      if (err) return next(new Error("DB Error"));
      if (!sudo) return;
      return next();
    });
  });


  // Routing
  // *****************************************************

  socket.use(socketioJwt.authorize({
    secret: config.secrets.jwt,
    handshake: true
  }));

  // All defined routes, See above
  socket.of("/admin").use(checkSudo);

  // Test if socket is banned
  socket.on("connection", function(sock) {
    db.isSocketBanned(sock.id, function(err, banned){
      if (err) return sock.emit("error", err);
      if (banned) {
        console.log("banned", sock.id)
        return sock.disconnect();
      } else {
        var id = sock.decoded_token.id;
        db.addSocket(id, sock.id, function(err){
          console.log(err)
          if (err) return sock.destroy();

          // Report this to any admin
          db.listSockets(function(err, sockets){
            if (err) sock.emit("error");
            socket.of("/admin").emit("socketList", {
              sockets: sockets
            });
          });
        });
      }
    });

    sock.on("disconnect", function(){
      db.removeSocket(sock.id, function(err){
        console.log("removed", sock.id);
        if (err) console.error(err) // TODO: handle errors
      });
    });
  });
}


function handleErrors(err, socket, args, next) {
    console.error(err.stack);
    socket.emit("error");
    // TODO: handle errors
    //next();
  }
