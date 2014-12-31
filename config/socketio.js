/* Configuration file for the socket.io server */
var socketioJwt = require('socketio-jwt'),
  SocketRouter = require('socket.io-events');



module.exports = function(socket, db, config){

  // Only allow admin connection
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

  // Authenticate the socket
  socket.use(socketioJwt.authorize({
    secret: config.secrets.jwt,
    handshake: true
  }));

  // All defined routes, See above
  socket.of("/admin").use(checkSudo);

  // Test any socket if the owner is banned, add the socket to the database + inform the admin
  socket.on("connection", function(sock) {
    var id = sock.decoded_token.id;
    db.isUserBanned(id, function(err, banned){
      if (err) return sock.emit("error", err);
      if (banned) {
        return sock.disconnect();
      } else {
        db.addSocket(id, sock.id, function(err){
          if (err) return sock.emit("error");
          // Report this to any admin
          db.dataForAdmin(function(err, data){
            if (err) return sock.emit("error");
            socket.of("/admin").emit("list", data);
          });
        });
      }
    });

    // remove any disconnecting socket from the database + inform the admin about the change
    sock.on("disconnect", function(){
      db.removeSocket(sock.id, function(err){
        if (err) console.error(err); // TODO: handle errors
        // Update the user about the situation
        db.dataForAdmin(function(err, data){
          if (err) return sock.emit("error");
          socket.of("/admin").emit("list", data);
        });
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

