/**
 * @fileoverview Main controller room JavaScript file handling all events and communication with the robot.
 * @author Jakub Mandula <jakub.aludnam@gmail.com>
*/


(function ($, window, io) {
  // Helper functions

  /**
   * Generates a bitmap of the keylist
   * @private
   * @param{Array.<boolean>} keylist Array of boolean values to be converted to a bitmap
   * @return{number} Bitmap of the keylist
  */
  var generateNumber = function(keylist) {
    var res = 0;
    var bit = 1;
    for (var i in keylist) {
      if (keylist[i]) {
        res |= bit;
      }
      bit *= 2;
    }
    return res;
  }

  // Prevents opposite keys being pressed at the same time
  /**
   * Checks the keys pressed and fixes impossible situations
   * @private
   * @param{Array.<boolean>} keys Array of keys to be sanitized
   * @return{Array.<boolean>} a sanitized version of the input
  */
  var sanitizeKeys = function (keys) {
    var result = keys;
    // Case both left and right arrows are pressed
    if (keys[1] && keys[3]) {
      result[1] = false;
      result[3] = false;
    }

    // Case both up and down arrows are pressed
    if (keys[0]&& keys[2]) {
      result[0] = false;
      result[2] = false;
    }
    return result;
  }

  /**
   * Compares two arrays
   * @private
   * @param{Array} array1 First array.
   * @param{Array} array2 Second array to be compared to the first.
   * @return{boolean} True if both arrays are equal, false otherwise.
  */
  var equalArray = function (array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
    for (var i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Convert degrees to radians
   * @param {number} deg Degree value
   * @return {number} Value in radians
  */
  var degToRad = function (deg) {
    return deg * Math.PI / 180;
  }

  /**
   * Scale a given angle by a factor while keeping it in the bounds
   * @param {number} angle Angle in radians to be scaled
   * @param {number} factor Factor by which the angle should be scaled
   * @return {number} resultant angle
  */
  var scaleAngle = function (angle, factor) {
    var resultAngle = angle * factor;
    if (resultAngle > Math.PI / 2) resultGamma = Math.PI / 2;
    if (resultAngle < -Math.PI / 2) resultGamma = -Math.PI / 2;
    return resultAngle;
  }

  /**
   * Object for handling events and passing them to the robot
   * @param {Robot} robot Object to which the events should be passed
   * @constructor
  */
  function KeyEventHandler(robot) {
    var self = this;
    this.robot = robot;

    this.is_touch_device = 'ontouchstart' in window; // are we using a touch device
    this.dragging = false; // used to check if we are dragging the speed slider
    this.keys = [38, 37, 40, 39, 87, 65, 83, 68, 88]; // all key codes we are using
    this.keyStatus = [false, false, false, false, false, false, false, false, false]; // the status of the keys
    this.otherComponents = { // status of other components
      light: 0,
      laser: false,
      ai: false,
      speed: 100,
      recordings_window: false
    };
    this.keyElements = [ // the DOM key elements we attach events to
      $('#upkey'),
      $('#leftkey'),
      $('#downkey'),
      $('#rightkey'),
      $('#cam_upkey'),
      $('#cam_leftkey'),
      $('#cam_downkey'),
      $('#cam_rightkey'),
      $('#cam_default')
    ];

    // Set up key down and key up events
    $(document).keydown(function(e) {
      var index = self.keys.indexOf(e.keyCode);
      if (index != -1) { // prevents scrolling when arrow keys are pressed
        e.preventDefault();
      }
      self.handleDown(index);
    });
    $(document).keyup(function(e) {
      var index = self.keys.indexOf(e.keyCode);
      self.handleUp(index);
    });

    /* registers events for a given element

      @param {Object} self - reference to this
      @param {Object} element - jQuery element we want the events to attach to
      @param {Number} i - the position that the element is in the array (used to tell which key is pressed)
    */
    function registerEvents(self, element, i) {

      // If we use touch device only assign the required listeners and vice versa
      if (self.is_touch_device) {
        element.on("touchstart", function() {
          self.handleDown(i);
        });
        element.on("touchend", function() {
          self.handleUp(i);
        });
      } else {
        element.mousedown(function() {
          self.handleDown(i);
        });
        element.mouseup(function() {
          // lift all keys only if we are not dragging currently
          if (!self.dragging) {
            self.allUp(); // lift all keys because we can be pressing only one when using the mouse
          }
        });
      }
    }

    // Attach the event listeners to each element
    for (var i = 0; i < self.keyElements.length; i++) {
      var element = self.keyElements[i];
      registerEvents(this, element, i);
    }

    // Other special buttons

    // Laser button listeners
    var laser = $("#laser");
    if (self.is_touch_device) {
      laser[0].addEventListener("ontouchstart", function() {
        if (!self.otherComponents.laser) {
          self.otherComponents.laser = true;
          laser.addClass("activated");
          self.update();
        }
      });
      laser[0].addEventListener("ontouchend", function() {
        if (self.otherComponents.laser) {
          self.otherComponents.laser = false;
          laser.removeClass("activated");
          self.update();
        }
      });
    } else {
      laser.mousedown(function() {
        if (!self.otherComponents.laser) {
          self.otherComponents.laser = true;
          laser.addClass("activated");
          self.update();
        }
      });
      laser.mouseup(function() {
        if (self.otherComponents.laser) {
          self.otherComponents.laser = false;
          laser.removeClass("activated");
          self.update();
        }
      });
    }

    // Speed slider
    $("#grabthing").draggable({
      axis: "y",
      containment: 'parent',
      grid: [0, 20],
      drag: function(event, ui) {
        var dist = (400 - ui.position.top) / 4;
        var child = $(this).children('p');
        child.html(dist + "%");
        if (dist >= 85) {
          child.addClass("highSpeed");
        } else {
          child.removeClass("highSpeed");
        }
        if (self.otherComponents.speed !== dist) {
          self.otherComponents.speed = dist;
          self.update();
        }
      },
      start: function(event, ui) {
        self.dragging = true;
      },
      stop: function(event, ui) {
        setTimeout(function() {
          self.dragging = false;
        }, 10);
      }
    });

    // Side bar toggle
    $(".showsideBar").click(function() {
      $(this).parent().toggleClass("open");
    });

    // Lights
    $(".lightSwitch").click(function() {
      var status = self.otherComponents.light;
      var text = "Off";
      var color = "#111";
      if (status === 0) {
        status = 1;
        color = "#FFF";
        text = "On";
      } else if (status === 1) {
        status = 2;
        color = "rgb(123, 238, 33)";
        text = "Auto";
      } else if (status === 2) {
        status = 0;
        color = "#111";
        text = "Off";
      }
      self.otherComponents.light = status;
      self.update();
      $(".lightSwitch").css("background-color", color);
      $(".lightSwitch").html(text);
    });

    // AI switch
    $(".ai").click(function() {
      var text = "Off";
      var color = "#111";
      if (!self.otherComponents.ai && !self.robot.getRecordingStatus() && !self.otherComponents.recordings_window) {
        self.otherComponents.ai = true;
        color = "rgb(138, 0, 0)";
        text = "On";
      } else {
        self.otherComponents.ai = false;
        color = "#111";
        text = "Off";
      }

      $(".ai").css("background-color", color);
      $(".ai").html(text);
      self.update();
    });

    // Record button
    $(".rec").click(function() {
      var text = "Off";
      if (!self.robot.getRecordingStatus() && !self.otherComponents.ai && !self.otherComponents.recordings_window) {
        self.robot.addNewRecording();
        text = "On";
        $(".rec").addClass("active_recording");
        // TODO: remove the following line of code:
        $("#recIndic").fadeIn(200); // TODO: use HTML5 transitions

      } else {
        self.robot.stopRecording();
        text = "Off";
        $(".rec").removeClass("active_recording");
        $("#recIndic").fadeOut(200); // TODO: use HTML5 transitions
      }
      $(".rec").html(text);
    });

    // View Recordings Button
    $(".rec_view").click(function() {
      if (!self.robot.getRecordingStatus() && !self.otherComponents.ai && !self.otherComponents.recordings_window) {
        self.otherComponents.recordings_window = 1;
        self.robot.drawRecordings();
        $(".rec_window").fadeIn(500); // TODO: use HTML5 transitions
      } else {
        self.otherComponents.recordings_window = 0;
        self.robot.stopAllMissions();
        $(".rec_window").fadeOut(500); // TODO: use HTML5 transitions
      }
    });

    // Close recordings window
    $("#rec_window_close").click(function() {
      self.otherComponents.recordings_window = 0;
      $(".rec_window").fadeOut(500); // TODO: use HTML5 transitions
      self.robot.stopAllMissions();
    });

    // Set up url for the stream
    var stream = $("#imageStream")[0];
    var url = document.URL.split(":");
    var schema = url[0];
    var host = url[1].replace(/\//g, "");

    var streamPath = "http://" + host + ":8080/?action=stream"; // build url
    stream.addEventListener('error', function(e) { // if we fail to load the image, use the off-line image
      $('#live').hide();
      stream.setAttribute("src", "/static/images/offline.jpg");
    });
    stream.setAttribute("src", streamPath);


    // Use device orientation to steer the robot
    this.orientation = {
      calibrated: {
        alpha: 0,
        beta: 0,
        gamma: 0
      },
      current: {
        alpha: 0,
        beta: 0,
        gamma: 0
      },
      useOrientation: false
    };
    if (window.DeviceOrientationEvent) {
      function addButton (title, content, className) {
        $(".sideBar > span").last().after("<div class='component-btn " + className + "'>" + content + "</div><span>" + title + "</span>");
      }
      // Add buttons for the orientation calibration and switch
      addButton("Calibrate", "Go", "calibration");
      addButton("Use orientation", "Off", "orientation-switch")

      $(".orientation-switch").click(function () {
        $(this).toggleClass("switch-on");
        if ($(this).hasClass("switch-on")) {
          $(this).html("On");
          self.orientation.useOrientation = true;
        } else {
          $(this).html("Off");
          self.orientation.useOrientation = false;
        }
      });

      $(".calibration").click(function () {
        var $this = $(this)
        $this.css("background", "white");

        self.calibrateOrientation(self.orientation.current.alpha, self.orientation.current.beta, self.orientation.current.gamma)

        setTimeout(function () {
          $this.css("background", "");
          console.log(self.orientation)
        }, 200);

      });

      var lastTimeStamp = 0;
      window.addEventListener("deviceorientation", function (e) {
        if(e.timeStamp - lastTimeStamp > 300) { // execute every 300 milliseconds
          self.updateOrientation(e.alpha, e.beta, e.gamma);
          lastTimeStamp = e.timeStamp
        }
      }, true);
    }

  }

  /**
   * Calculates the direction and speed form the orientation values
   * @param {number} beta The beta angle of the device
   * @param {number} gamma  The gamma angle of the device
   * @return {Object{direction:number, speed:number}} The direction and speed calculated from the orientation angel.
  */
  KeyEventHandler.prototype.calclulateDrectionValues = function(beta, gamma) {
    // Compensate for the calibrated tilt and convert to radians
    var resultBeta = degToRad(beta - this.orientation.calibrated.beta);
    var resultGamma = degToRad(gamma - this.orientation.calibrated.gamma);
    //console.log(resultBeta, resultGamma)
    var direction = 0;
    var speed = 100;

    resultGamma = scaleAngle(resultGamma, 2);

    // stop if we are close to the default position +- 5 deg
    if (Math.abs(resultBeta) < 0.08726) {
      speed = 0;
    } else {
      speed = Math.sin(Math.abs(resultBeta)) * 1.6; // reduce the tilt required for full speed
      if (speed > 1) speed = 1; // clip speed at 1
    }

    if (resultBeta > 0) { // we are going back when beta is positive
      if (resultGamma < 0) {

        direction = -Math.PI - resultGamma;
      } else {
        direction = Math.PI - resultGamma;
      }
    } else {
      direction = resultGamma;
    }


    console.log("speed", Math.floor(speed*100), "direction", Math.floor(direction * 180 / Math.PI))
    //console.log(resultGamma + Math.PI / 2)



  };


  /**
   * Update the current value of the device, send update to server if requested
   * @param {number} alpha The alpha angle of the device
   * @param {number} beta The beta angle of the device
   * @param {number} gamma The gamma angle of the device
  */
  KeyEventHandler.prototype.updateOrientation = function(alpha, beta, gamma) {
    this.orientation.current = {
      alpha: alpha,
      beta: beta,
      gamma: gamma
    };
    if (this.orientation.useOrientation) {
      var data = this.calclulateDrectionValues(beta, gamma);
      //this.robot.updateOrientation(data.direction, data.speed)
    }

  };
  /**
   * Calibrates the orientation of the app to new value
   * @param {number} alpha The alpha angle of the device
   * @param {number} beta The beta angle of the device
   * @param {number} gamma The gamma angle of the device
  */
  KeyEventHandler.prototype.calibrateOrientation = function(alpha, beta, gamma) {
    this.orientation.calibrated.alpha = alpha;
    this.orientation.calibrated.beta = beta;
    this.orientation.calibrated.gamma = gamma;
  };


  /**
   * Presses down the keys with the specified index and triggers and update
   * @param {number} index Index of the key in the keyStatus array
  */
  KeyEventHandler.prototype.handleDown = function(index) {
    // only trigger if the index is valid and the key is not already pressed
    if (index >= 0 && !this.keyStatus[index]) {
      this.keyStatus[index] = true;
      this.keyElements[index].addClass("pressedKey");
      this.update();
    }
  };

  /**
   * Lifts the keys with the specified index and triggers and update
   * @param {number} index Index of the key in the keyStatus array
  */
  KeyEventHandler.prototype.handleUp = function(index) {
    // only trigger if the index is valid and the key is already pressed
    if (index >= 0 && this.keyStatus[index]) {
      this.keyStatus[index] = false;
      this.keyElements[index].removeClass("pressedKey");
      this.update();
    }
  };

  /**
   * Lifts all keys and triggers and update on the robot object
  */
  KeyEventHandler.prototype.allUp = function() {
    for (var i = this.keyElements.length - 1; i >= 0; i--) {
      this.keyStatus[i] = false;
      var element = this.keyElements[i];
      element.removeClass("pressedKey");
    }
    this.update();
  };

  /* Lifts all keys and triggers and update on the robot object
   */
  KeyEventHandler.prototype.allUp = function() {
    for (var i = this.keyElements.length - 1; i >= 0; i--) {
      this.keyStatus[i] = false;
      var element = this.keyElements[i];
      element.removeClass("pressedKey");
    }
    this.update();
  };

  /**
   * Updates the values in the Robot object
  */
  KeyEventHandler.prototype.update = function() {
    var self = this;
    // set cam to default if the default key is being pressed
    var cameraKeys;
    if (self.keyStatus[8]) {
      cameraKeys = [-1, -1, -1, -1];
    } else {
      cameraKeys = self.keyStatus.slice(4, 8);
    }
    // Update the robot object
    self.robot.updateUserInput({
      keys: self.keyStatus.slice(0, 4),
      cam: cameraKeys,
      speed: self.otherComponents.speed,
      light: self.otherComponents.light,
      laser: self.otherComponents.laser,
      ai: self.otherComponents.ai
    });
  };

  /**
   * Object used to send and receive information from the robot
   * @constructor
  */
  function Robot() {
    var self = this;
    this.keyEventHandler = new KeyEventHandler(this);

    this.componentStatus = {
      keys: [0, 0, 0, 0],
      speed: 100,
      light: 0,
      laser: false,
      cam: [0, 0, 0, 0],
      ai: false
    };
    this.recStatus = false;
    this.recordings = [];
    this.previousCommand = {
      keys: [0, 0, 0, 0],
      speed: 100,
      light: 0,
      laser: false
    };

    this.socket = io("/commands", {
      'query': 'token=' + sessionStorage.getItem("token")
    });

    // Server ping + usage data update
    this.socket.on("roger", function(data) {
      self.socket.emit("affirmative", {
        time: data.time
      });
      self.updateStatus(data.load);
    });

    this.socket.on("kicked", function() {
      alert("You have been kicked!");
    });

    this.socket.on("banned", function() {
      alert("You have been banned!");
    });
  }

  /**
   * Update the status widget with the values form the server
   * @param{Object} status Status object includes the data about the robot computer
  */
  Robot.prototype.updateStatus = function(status) {
    var mem = status.mem || "No Data";
    var cpu = status.cpu || "No Data";
    var lav = cpu.avload[0] * 100 || "No Data";
    var freeRam = (mem.free / mem.total) * 100 || "No Data";
    var suffix = "";
    var memory;

    // Chose the unit
    if (mem.total > 1000000000) {
      suffix = "GB";
      memory = mem.total / 134217728;
    } else {
      suffix = "MB";
      memory = mem.total / 1048576;
    }

    var bootDate = new Date(cpu.boot);
    $(".piStats>#stat_boot").html(bootDate.toLocaleString());
    $(".piStats>#stat_load").html(lav.toFixed(2) + "%");
    $(".piStats>#stat_freeRam").html(freeRam.toFixed(2) + "%");
    $(".piStats>#stat_totalRam").html(memory.toFixed(2) + suffix);
  };

  /**
   * Updates the local user input status and trigger a global update
   * @param{object} data Data object containing the inputs provided by the user
  */
  Robot.prototype.updateUserInput = function(data) {
    this.componentStatus.keys = data.keys;
    this.componentStatus.cam = data.cam;
    this.componentStatus.speed = data.speed;
    this.componentStatus.light = data.light;
    this.componentStatus.laser = data.laser;
    this.componentStatus.ai = data.ai;

    this.update();
  };

  /**
   * Global update pushing local data to the robot server
  */
  Robot.prototype.update = function() {
    var self = this;
    // sanitize robot movement keys
    var keyMoves = sanitizeKeys(this.componentStatus.keys);

    // TODO: implement this on the serverside
    // keyMoves = generateNumber(keyMoves);

    // sanitize camera movement keys
    var camMoves = sanitizeKeys(this.componentStatus.cam);

    if (camMoves[0] === -1) {
      camMoves = "default";
    } else {
      // TODO: implement this on the serverside
      // camMoves = generateNumber(camMoves);
    }

    if (this.getRecordingStatus()) {
      var command = "STOP";
      if (!equalArray(this.previousCommand.keys, keyMoves)) {
        command = "";
        if (keyMoves[0]) {
          command += "F";
        } else if (keyMoves[2]) {
          command += "B";
        }

        if (keyMoves[1]) {
          command += "L";
        } else if (keyMoves[3]) {
          command += "R";
        }

        if (command === "") {
          command = "STOP";
        }

      } else if (this.previousCommand.speed != this.componentStatus.speed) {
        command = "S" + this.componentStatus.speed.toString();
      } else if (this.previousCommand.light != this.componentStatus.light) {
        if (this.componentStatus.light === 0) {
          command = "LIGHTOFF";
        } else {
          command = "LIGHTON";
        }
      }

      this.recordings[this.recordings.length - 1].add(new Move(command));

    }

    this.previousCommand.keys = keyMoves;
    this.previousCommand.speed = this.componentStatus.speed;
    this.previousCommand.light = this.componentStatus.light;

    this.socket.emit("commands", {
      cam: camMoves,
      keys: keyMoves,
      speed: self.componentStatus.speed,
      ai: self.componentStatus.ai,
      light: self.componentStatus.light,
      laser: self.componentStatus.laser,
    });

  };

  /**
   * Starts a new recording and pushes a new recording to the recordings array
  */
  Robot.prototype.addNewRecording = function() {
    if (!this.recStatus) {
      this.recStatus = true;
      var name = new Date().toLocaleTimeString("en-GB");
      if (this.recordings.length > 5) {
        this.recordings.shift();
      }
      this.recordings.push(new Recording(name, this.socket));
    }
  };

  /**
   * Stops any recording
  */
  Robot.prototype.stopRecording = function() {
    // FIXME: possible duplicate of stopMissionRecording
    this.recStatus = false;
  };

  /**
   * Gets the current recording status
   * @return{boolean} True if recording is in progress, false otherwise
  */
  Robot.prototype.getRecordingStatus = function() {
    return this.recStatus;
  };

  /**
   * Renders a list of all the saved recordings
  */
  Robot.prototype.drawRecordings = function() {
    if (this.recordings.length === 0) {
      $("#rec_window_content").html("No recordings Yet!");
    } else {
      $("#rec_window_content").html("");
    }
    for (var i = 0; i < this.recordings.length; i++) {
      $("#rec_window_content").append("<div><span id='rec_name'>" + this.recordings[i].name + "</span> <span id='rec_date'>" + this.recordings[i].date + "</span> <div id='rec_startstop' onClick='PiNet.recordings[" + i + "].start(this)'></div>");
    }
  };

  /**
   * Aborts all mission currently in progress
  */
  Robot.prototype.stopAllMissions = function() {
    for (var i = 0; i < this.recordings.length; i++) {
      this.recordings[i].hardStop();
    }
  };

  /**
   * Stops the current recording
  */
  Robot.prototype.stopMissionRecording = function() {
    this.recordings[this.recordings.length - 1].stopLastRecord();

  };

  Robot.prototype.updateOrientation = function(beta, gamma) {

  };


  /**
   * Object representing a mission recording
   * @constructor
   * @param{string} name Name of the mission(usually a date)
   * @param{Socket} socket Socket object used to send commands regarding the mission
  */
  function Recording(name, socket) {
    this.name = name;
    this.socket = socket;
    this.date = new Date().toLocaleTimeString("en-GB");
    this.moves = [];
    this.status = "stop";
    this.time = 0;
  }
  /**
   * Adds a new move to the recording
   * @param{Move} move A Move object representing a new move
  */
  Recording.prototype.add = function(move) {
    var date;
    if (this.move.length !== 0) {
      date = new Date();
      var timeNow = date.getTime();
      var timeDiff = timeNow - this.time;
      this.time = timeNow;
      this.move[this.move.length - 1].setTimeDelay(timeDiff);
    } else {
      date = new Date();
      this.time = date.getTime();
    }
    this.moves.push(move);

  };
  /**
   * Start the current recording
   * @param{element} element The button element used to trigger the event
  */
  Recording.prototype.start = function(element) {
    var self = this;
    this.startButton = element;
    if (this.status == "start") {
      this.socket.emit("mission", {
        status: "stop"
      });
      this.status = "stop";
      $(element).css("background-image", "url(/static/images/videoplay.png)");
    } else if (this.status == "stop") {
      this.status = "start";
      this.socket.emit("mission", {
        status: "start",
        moves: this.moves
      });
      console.log(window.JSON.stringify(this.moves));
      $(element).css("background-image", "url(/static/images/videostop.png)");
    }
  };
  /**
   * Aborts the Mission
  */
  Recording.prototype.hardStop = function() {
    this.status = "stop";
    this.socket.emit("mission", {
      status: "stop"
    });
  };

  Recording.prototype.stopLastRecord = function() {
    var date = new Date();
    var timeNow = date.getTime() / 1000;
    var timeDiff = timeNow - this.time;

    this.moves[this.moves.length].setTimeDelay(timeDiff);
  };

  /**
   * Object representing a move
   * @constructor
   * @param{string} command Command string identifying the move
  */
  function Move(command) {
    this.command = command;
    this.delay = 0;
  }

  /**
   * Sets the time delay for the move
   * @param{number} delay Time of pause in milliseconds
  */
  Move.prototype.setTimeDelay = function(delay) {
    this.delay = delay;
  };

  // Initialization
  $(document).ready(function() {
    $(".cover").fadeOut(500); // TODO: use HTML5 transitions
    window.PiNet = new Robot();
  });

})($, window, io);
