module.exports = function(socket, db) {
  var admin = socket.of("/admin");
  var commands = socket.of("/commands");


  admin.on('connection', function(sock) {

    // remove a connection
    sock.on('kick', function(data) {
      if (commands.connected[data.id]) {
        commands.connected[data.id].emit('kicked');
        commands.connected[data.id].disconnect();
      }
    });

    // ban a user (kick all connections and prevent formation of new)
    sock.on("banUser", function(data) {
      db.banUser(data.id, function(err) {
        if (err) return sock.emit("error");
        db.userSockets(data.id, function(err, sockets) {
          if (err) return sock.emit("error");
          for (var i in sockets) {
            var id = sockets[i].id;
            if (commands.connected[id]) {
              commands.connected[id].emit('banned');
              commands.connected[id].disconnect();
            }
          }
        });
      });
    });

    // Unban a user (allow formation of new connections)
    sock.on("unbanUser", function(data) {
      db.unbanUser(data.id, function(err) {
        if (err) return sock.emit("error");
      });
    });

    // Admin request for a updated list of information
    sock.on("requrestList", function() {
      db.dataForAdmin(function(err, data) {
        if (err) return sock.emit("error");
        sock.emit("list", data);
      });
    });
  });
};