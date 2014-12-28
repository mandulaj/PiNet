
(function(){
  function Admin(){
    this.socket = io("/admin", {
      'query': 'token=' + sessionStorage.getItem("token")
    });
    console.log(this.socket.id)
    this.socket.emit("killUser", {id: "hello"});
    this.socket.emit("list");

    this.socket.on("socketList", function(data){
      var tableb = $(".socket-table>tbody");
      var sockets = data.sockets;
      tableb.html("");
      console.log(data)

      for (var i = 0; i < sockets.length; i++) {
        var text = ""
        var addClass = "";
        if (sockets[i].access == 5) {
          addClass = " class='info'";
        }
        var loginDate = new Date(parseInt(sockets[i].login));
        text += "<tr" + addClass + ">";
        text += "<td>";
        text += (i + 1);
        text += "</td>";
        text += "<td><em>";
        text += sockets[i].id;
        text += "</em></td>";
        text += "<td>";
        text += sockets[i].userId;
        text += "</td>";
        text += "<td><strong>";
        text += sockets[i].username;
        text += "</strong></td>";
        text += "<td>";
        text += loginDate.toLocaleTimeString()+ " "+ loginDate.toLocaleDateString();
        text += "</td>";
        text += "<td>";
        text += sockets[i].access;
        text += "</td>";
        text += "</tr>";
        tableb.append(text)
      }
    });
    // this.socket.on('connect', function(socket){
    //
    // });
  }


  $(document).ready(function(){
    var admin = new Admin();
  });
})()
