(function (io, $, window) {
  function KeyEventHandler(admin) {
    var self = this;
    this.admin = admin;

    $("#inputName").on("keyup", function() {
      var element = $(this);
      var username = element.val();
      self.checkUserExists(username, function(data) {
        element.parent()
          .removeClass("has-success")
          .removeClass("has-error")
          .children(".error").addClass("noError");

        if (!data) {
          element.parent().children("span").addClass("hidden");
          return;
        }

        element.parent().children("span").removeClass("hidden glyphicon-ok glyphicon-remove");

        if (data.exists) {
          element.parent().children("span").addClass("glyphicon-remove");
          element.parent().children(".error").removeClass("noError").html("<strong>Sorry: </strong></span>Username <em>" + data.username + "</em> already exists!");
          element.parent().addClass("has-error");
        } else {
          element.parent().children("span").addClass("glyphicon-ok");
          element.parent().addClass("has-success");
        }
      });
    });
    $("#inputPass").on("keyup", function() {
      var element = $(this);
      var password = element.val();
      var passwordPass = self.checkPassword(password);
      element.parent()
        .removeClass("has-success")
        .removeClass("has-error")
        .children(".error").addClass("noError");

      /*if (!passwordPass) {
        element.parent().children("span").addClass("hidden");
        return
      }*/

      element.parent().children("span").removeClass("hidden glyphicon-ok glyphicon-remove");
      if (!passwordPass) {
        element.parent().children("span").addClass("glyphicon-remove");
        element.parent().addClass("has-error");
      } else {
        element.parent().children("span").addClass("glyphicon-ok");
        element.parent().addClass("has-success");
      }
    });
    $("#inputPassAgain").on("keyup", function() {
      var element = $(this);
      var password = $("#inputPass").val();
      var passwordAgain = element.val();
      element.parent()
        .removeClass("has-success")
        .removeClass("has-error")
        .children(".error").addClass("noError");

      element.parent().children("span").removeClass("hidden glyphicon-ok glyphicon-remove");

      if (password !== passwordAgain) {
        element.parent().children("span").addClass("glyphicon-remove");
        element.parent().addClass("has-error");
      } else {
        element.parent().children("span").addClass("glyphicon-ok");
        element.parent().addClass("has-success");
      }

    });
    $("#submitbutton").click(function(e) {
      e.preventDefault();
      $(".passSuccess").addClass("hidden");
      $(".loginError").addClass("hidden");
      var username = $("#inputName").val();
      var password = $("#inputPass").val();
      var access = $("input[type='radio'][name='inputAccess']:checked").val();
      // TODO: check input

      $.ajax({
        url: "/signup",
        type: "POST",
        cache: false,
        dataType: "json",
        data: {
          username: username,
          password: password,
          access: access,
        }
      }).done(function(data) {
        if (data.signup) {
          $(".passSuccess").removeClass("hidden");
        } else {
          $(".loginError").removeClass("hidden");
        }
      });

    });
  }

  KeyEventHandler.prototype.checkUserExists = function(username, cb) {
    if (!username) return cb(null);
    if (username.length < 3) return cb(null);
    $.ajax({
      url: "/api/username/" + username,
      type: "GET",
      cache: false,
    }).done(function(data) {
      return cb(data);
    });
  };

  KeyEventHandler.prototype.checkPassword = function(password) {
    if (password.length < 6) {
      return false;
    }
    return true;
  };


  /**
   * Admin app object handling all io and events
   * @constructor
  */
  function Admin(){
    var self = this;
    this.eventHandler = new KeyEventHandler(this);

    this.socket = io("/admin", {
      'query': 'token=' + sessionStorage.getItem("token")
    });

    this.requrestList();

    this.sockets = [];

    this.socket.on("list", function(data) {
      var tableb = $(".socket-table>tbody");
      var userTable = $(".user-table>tbody");
      var sockets = data.sockets;
      var users = data.users;
      self.sockets = sockets;
      self.users = users;
      tableb.html("");
      userTable.html("");

      var text, addClass, root, banned;

      for (var i = 0; i < sockets.length; i++) {
        text = "";
        addClass = "";
        root = false;
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
        text += loginDate.toLocaleTimeString() + " " + loginDate.toLocaleDateString();
        text += "</td>";
        text += "<td>";
        text += "<button class='btn btn-warning' " + (root ? (" disabled='disabled' ") : ("")) + " onclick=window.admin.kick(" + i + ")>Kick</button>";
        text += "</td>";
        text += "</tr>";
        tableb.append(text);
      }

      for (var j = 0; j < users.length; j++) {
        text = "";
        addClass = "";
        banned = users[j].banned == 1;
        root = users[j].access == 5;
        if (banned) {
          addClass = " class='danger'";
        }

        text += "<tr" + addClass + ">";
        text += "<td><em>";
        text += users[j].id;
        text += "</em></td>";
        text += "<td>";
        text += users[j].username;
        text += "</td>";
        text += "<td><strong>";
        text += users[j].access;
        text += "</strong></td>";
        text += "<td>";
        text += (!banned) ? ("<button class='btn btn-danger' " + ((root) ? ('disabled="disabled"') : ("")) + " onclick=window.admin.ban(" + j + ")>Ban</button>") : ("<button class='btn btn-info' onclick=window.admin.unban(" + j + ")>Undo</button>");
        text += "</td>";
        text += "</tr>";
        userTable.append(text);
      }
    });
    // this.socket.on('connect', function(socket){
    //
    // });
  }

  /**
   * Kicks the user with a given index
   * @param{number} i Index of the user in the sockets array
  */
  Admin.prototype.kick = function(i) {
    this.socket.emit('kick', {
      id: this.sockets[i].id
    });
    this.socket.emit("requrestList");
  };

  /**
   * Bans the user with a given index
   * @param{number} i Index of the user in the sockets array
  */
  Admin.prototype.ban = function(i) {
    this.socket.emit('banUser', {
      id: this.users[i].id
    });
    this.socket.emit("requrestList");
  };

  /**
   * Unban a user with a give index
   * @param{number} i Index of the user in the sockets array
  */
  Admin.prototype.unban = function(i) {
    this.socket.emit('unbanUser', {
      id: this.users[i].id
    });
    this.socket.emit("requrestList");
  };


  Admin.prototype.requrestList = function() {
    this.socket.emit("requrestList");
  };

  // Initialization of the admin interface
  $(document).ready(function(){
    window.admin = new Admin();
    $("#refresh").click(function() {
      $("#refresh span").addClass("rotate");
      window.admin.requrestList();
      setTimeout(function() {
        $("#refresh span").removeClass("rotate");
      }, 1000);
    });
  });

})(io, $, window);
