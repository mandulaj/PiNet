var net = require('net');

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
        camMove: data.camKeys
      };
      self.update();
    });

    socket.on("mission", function(data) {
      if (data.status === "start") {
        var moves = JSON.parse(data.moves);
        var stringForPy = "[";
        for (var i = 0; i < moves.length; i++) {
          stringForPy += "(\"" + moves[i].command + "\"," + moves[i].delay.toString() + "),";
        }
        stringForPy += "]";
        //console.log(stringForPy);
        self.pythonSock.write(stringForPy);
      } else {
        thisObj.pythonSock.write("STOPMISSION");
      }
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
  var stringToSend = JSON.stringify(this.componentStatus);
  try {
    this.pythonSock.write(stringToSend);
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

module.exports = PiNet;