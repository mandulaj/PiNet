var net = require('net'),
  PiStat = require("./pistat.js"),
  SocketRouter = require('socket.io-events');


module.exports = function(socket, db, opts) {
  function PiNet(socket, db, opts) {
    var self = this;
    this.stat = new PiStat();
    this.db = db;
    this.opts = opts;

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

    // On a new connection
    this.socket.on('connection', function(socket) {
      // Setup ping (roger)
      var status = {};
      status.roger = true;
      status.inactive = false;
      var rogerInterval = setInterval(function() {
        if (!status.roger) {
          // If the flag is still not reset, stop the robot
          //console.log("interval fail");
          if (!status.inactive) {
            self.raiseAlert();
            status.inactive = true; // Set to true so that raiseAlert is only called once
          }
        } else {
          status.inactive = false;
        }
        // set the flag for next turn
        status.roger = false;
        status.oldDate = Date.now();
        // Ping the client
        socket.emit('roger', {
          time: status.oldDate,
          load: self.stat.getSystemInfo()
        });
      }, 1000); // ther robot will go max 1s without signal before stopping

      socket.on("affirmative", function(data) {
        // Check how old the last message is
        var time = Date.now() - parseInt(data.time);
        // If the roundtrip took more then 1s, something is wrong with the connection and we should rather stop
        if (time < 1000) {
          status.roger = true;
        } else {
          status.roger = false;
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
        self.writeMissionToSock(data);
      });

      socket.on("disconnect", function() {
        //console.log("disconnect");
        clearInterval(rogerInterval);
        self.raiseAlert();
      });
    });

    // initializes socket used to communicate with the python program
    this.pythonSock = net.connect({
      path: self.opts.port
    }, function() {});
    this.pythonSock.on("error", function(err) {
      // TODO: write better way of dealing with errors
      console.error(err.message);
    });
  }

  // called when an update is required (I decided to put this into a separate function in case I want to do other things as well)
  PiNet.prototype.update = function() {
    this.writeCommandsToSock();
  };

  // function used to actually write to the socket and send the information to the python program
  PiNet.prototype.writeCommandsToSock = function() {
    var message = {
      message: "commands",
      commands: this.componentStatus
    };
    message = JSON.stringify(message);
    this.writeToRobot(message);
  };

  PiNet.prototype.writeMissionToSock = function(mission) {
    var message = {
      message: "mission"
    };
    if (mission.moves) {
      message.moves = mission.moves;
    }

    if (mission.status) {
      message.status = mission.status;
    }
    var msg = JSON.stringify(message);
    this.writeToRobot(msg);
  };

  PiNet.prototype.writeToRobot = function(data) {
    this.pythonSock.write(data + "&");
  };

  PiNet.prototype.raiseAlert = function() {
    this.defaultState();
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

  return new PiNet(socket, db, opts);
};