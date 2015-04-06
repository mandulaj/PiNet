
(function (io, $, window){
  function Admin(){
    var self = this;
    this.socket = io("/admin", {
      'query': 'token=' + sessionStorage.getItem("token")
    });
    console.log(this.socket.id)
    this.socket.emit("requrestList");

    this.sockets = [];

    this.socket.on("list", function(data){
      var tableb = $(".socket-table>tbody");
      var userTable = $(".user-table>tbody");
      var sockets = data.sockets;
      var users = data.users;
      self.sockets = sockets;
      self.users = users;
      tableb.html("");
      userTable.html("");
      console.log(data)

      for (var i = 0; i < sockets.length; i++) {
        var text = ""
        var addClass = "";
        var root = false;
        if (sockets[i].access == 5) {
          addClass = " class='info'";
          root = true;
        }
        var loginDate = new Date(parseInt(sockets[i].login));
        text += "<tr" + addClass + ">";
        text += "<td>";
        text += (i + 1);
        text += "</td>";
        text += "<td><em>";
        text += sockets[i].id;
        text += "</em></td>";
        text += "<td><strong>";
        text += sockets[i].username;
        text += "</strong></td>";
        text += "<td>";
        text += loginDate.toLocaleTimeString()+ " " + loginDate.toLocaleDateString();
        text += "</td>";
        text += "<td>";
        text += "<button class='btn btn-warning' " + (root?(" disabled='disabled' "):("")) + " onclick=window.admin.kick(" + i + ")>Kick</button>";
        text += "</td>";
        text += "</tr>";
        tableb.append(text)
      }

      for (var i = 0; i < users.length; i++) {
        var text = ""
        var addClass = "";
        var banned = users[i].banned == 1;
        var root = users[i].access == 5;
        if (banned) {
          addClass = " class='danger'";
        }

        text += "<tr" + addClass + ">";
        text += "<td><em>";
        text += users[i].id;
        text += "</em></td>";
        text += "<td>";
        text += users[i].username;
        text += "</td>";
        text += "<td><strong>";
        text += users[i].access;
        text += "</strong></td>";
        text += "<td>";
        text += (!banned)?("<button class='btn btn-danger' " +  ((root)?('disabled="disabled"'):("")) + " onclick=window.admin.ban(" + i + ")>Ban</button>"):("<button class='btn btn-info' onclick=window.admin.unban(" + i + ")>Undo</button>")
        text += "</td>";
        text += "</tr>";
        userTable.append(text)
      }
    });
    // this.socket.on('connect', function(socket){
    //
    // });
  }
  Admin.prototype.kick = function(i) {
    this.socket.emit('kick', {
      id: this.sockets[i].id
    });
    this.socket.emit("requrestList");
  };

  Admin.prototype.ban = function(i) {
    this.socket.emit('banUser', {
      id: this.users[i].id
    });
    this.socket.emit("requrestList");
  };

  Admin.prototype.unban = function(i) {
    this.socket.emit('unbanUser', {
      id: this.users[i].id
    });
    this.socket.emit("requrestList");
  };

  $(document).ready(function(){
    window.admin = new Admin();
  });
})(io, $, window)
