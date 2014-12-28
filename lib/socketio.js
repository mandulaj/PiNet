module.exports = function(socket, db) {
  var commands = socket.of("/commands");

  commands.on('connection', function (socket) {
    // only the superuser can do this
    socket.on('killUser', function(data) {
      if (self.socket.connected[data.id]) {
        self.socket.connected[data.id].disconnect();
      }
    });
  });
}
