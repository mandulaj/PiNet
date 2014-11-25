var net = require('net');

module.exports = function(s, d){
  function PiNet(socket, driver) {
    var self = this;

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

    // On a new connection
    this.socket.on('connection', function(socket) {

      // Setup ping (roger)
      socket.pinet = {};
      socket.pinet.roger = true;
      var rogerInterval = setInterval(function() {
        if (!socket.pinet.roger) {
          // If the flag is still not reset, stop the robot
          self.raiseAlert();
        }
        // set the flag for next turn
        socket.pinet.roger = false;
        socket.pinet.oldDate = Date.now();
        // Ping the client
        socket.emit('roger', {
          time: socket.pinet.oldDate
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
        self.pythonSock.write(msg);
      });

      socket.on("disconnect", function() {
        clearInterval(rogerInterval);
        self.raiseAlert();
      });
    });

    // initializes socket used to communicate with the python program
    this.pythonSock = net.connect({
      port: this.driver.port
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
    try {
      this.pythonSock.write(message);
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

  return new PiNet(s, d);
}
