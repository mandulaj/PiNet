var net = require('net'),
  PiStat = require("./pistat.js"),
  DB = require("./dbReader.js"),
  SocketRouter = require('socket.io-events');


module.exports = function(socket, db, driver) {
  function PiNet(socket, db, driver) {
    var self = this;
    this.stat = new PiStat();
    this.db = new DB(db);

    this.driver = driver;

    // Keep track of the component status
    this.componentStatus = {
      light: 0,
      laser: 0,
      ai: 0,
      keys: [0, 0, 0, 0],
      speed: 100,
      camMove: [0, 0, 0, 0]
    };



    this.socket = socket.of("/commands");

    // Check if socket is not banned
    var checkUser = SocketRouter();
    checkUser.on("*", function(socket, args, next){
      self.db.isSocketBanned(socket.id, function(err, banned){
        if (err) return next(new Error("DB Error"));
        if (banned) return next(new Error("403"));
        return next();
      });
    });

    //
    var checkSudo = SocketRouter();
    checkSudo.on('killUser', function(socket, args, next) {
      self.db.isSocketSudo(socket.id, function(err, sudo){
        if (err) return next(new Error("DB Error"));
        if (!sudo) return next(new Error("403"));
        return next();
      });
    });

    this.socket.use(checkUser);
    this.socket.use(checkSudo);

    socket.on("connection", function(socket, fn) {
      var id = socket.decoded_token.id;

      self.db.addSocket(id, socket.id, function(err){
        if (err) {
          socket.destroy();
        }
      });
    });

    // On a new connection
    this.socket.on('connection', function(socket) {
      // Setup ping (roger)

      socket.pinet = {};
      socket.pinet.roger = true;
      var rogerInterval = setInterval(function() {
        if (!socket.pinet.roger) {
          // If the flag is still not reset, stop the robot
          console.log("interval fail");
          self.raiseAlert();
        }
        // set the flag for next turn
        socket.pinet.roger = false;
        socket.pinet.oldDate = Date.now();
        // Ping the client
        socket.emit('roger', {
          time: socket.pinet.oldDate,
          load: self.stat.getSystemInfo()
        });
      }, 1000); // ther robot will go max 1s without signal before stopping

      socket.on("affirmative", function(data) {
        // Check how old the last message is
        var time = Date.now() - parseInt(data.time);
        // If the roundtrip took more then 1s, something is wrong with the connection and we should rather stop
        if (time < 1000) {
          socket.pinet.roger = true;
        } else {
          socket.pinet.roger = false;
          self.raiseAlert();
        }
      });

      socket.on("commands", function(data) {
        self.componentStatus = {
          light: data.light,
          laser: data.laser,
          ai: data.ai,
          keys: data.keys,
          speed: data.speed,
          camMove: data.cam
        };
        self.update();
      });

      socket.on("mission", function(data) {
        var message = {
          message: "mission"
        };

        if (data.moves) {
          message.moves = data.moves;
        }

        if (data.status) {
          message.status = data.status;
        }
        var msg = JSON.stringify(message);
        self.writeToRobot(msg);
      });

      socket.on("disconnect", function() {
        self.db.removeSocket(socket.id, function(err){
          console.log("removed");
          if (err) console.log(err) // TODO: handle errors
        })
        console.log("disconnect");
        clearInterval(rogerInterval);
        self.raiseAlert();
      });

      // only the superuser can do this
      socket.on('killUser', function(data) {
        if (self.socket.connected[data.id]) {
          self.socket.connected[data.id].disconnect();
        }
      });
    });

    // initializes socket used to communicate with the python program
    this.pythonSock = net.connect({
      path: self.driver.port
    }, function() {
      self.pythonSock.on("error", function(err) {
        console.log(err.message);
      });
    });
  }

  // called when an update is required (I decided to put this into a separate function in case I want to do other things as well)
  PiNet.prototype.update = function() {
    this.writeDataToSock();
  };

  // function used to actually write to the socket and send the information to the python program
  PiNet.prototype.writeDataToSock = function() {
    var message = {
      message: "commands",
      commands: this.componentStatus
    };
    message = JSON.stringify(message);
    this.writeToRobot(message);
  };

  PiNet.prototype.writeToRobot = function(data){
    try {
      this.pythonSock.write(data);
      this.pythonSock.write("&");
      return 0;
    } catch (err) {
      console.log(err);
    }
  };

  PiNet.prototype.raiseAlert = function() {
    this.componentStatus.keys = [0, 0, 0, 0];
    this.update();
  };

  PiNet.prototype.defaultState = function() {
    this.componentStatus = {
      light: 0,
      laser: 0,
      ai: 0,
      keys: [0, 0, 0, 0],
      speed: 100,
      camMove: [0, 0, 0, 0]
    };
    this.update();
  };

  return new PiNet(socket, db, driver);
};
