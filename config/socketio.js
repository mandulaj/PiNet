/* Configuration file for the socket.io server */
var socketioJwt = require('socketio-jwt');

module.exports = function(socket, config){
  socket.use(socketioJwt.authorize({
    secret: config.secrets.jwt,
    handshake: true
  }));
}
