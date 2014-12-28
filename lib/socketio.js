var DB = require("../lib/dbReader.js");

module.exports = function(socket, database) {
  var admin = socket.of("/admin");
  var db = new DB(database);


  admin.on('connection', function (sock) {
    // only the superuser can do this
    sock.on('killUser', function(data) {
      console.log(sock.id)
      if (admin.connected[data.id]) {
        console.log("kill", data)
        admin.connected[data.id].disconnect();
      }
    });

    // sock.on("list", function(){
    //   db.listSockets(function(err, sockets){
    //     if (err) sock.emit("error");
    //     sock.emit("socketList", {
    //       sockets: sockets
    //     });
    //   });
    // });
  });
}
