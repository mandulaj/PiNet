// JavaScript Document
/*
var Dragging = false;
var is_touch_device = 'ontouchstart' in document.documentElement;
var sideBar = 0;
var recordings = 0;
*/

function KeyEventHandler(robot) {
  var self = this;
  this.robot = robot;
  this.is_touch_device = 'ontouchstart' in window;
  this.dragging = false;
  this.keys = [38, 37, 40, 39, 87, 65, 88, 68, 83];
  this.keyStatus = [false, false, false, false, false, false, false, false, false];
  this.otherComponents = {
    light: 0,
    laser: false,
    ai: false,
    speed: 100,
    recordings_window: false
  };
  this.keyElements = [
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


  $(document).keydown(function(e) {
    var index = self.keys.indexOf(e.keyCode);
    self.handleDown(index);
  });
  $(document).keyup(function(e) {
    var index = self.keys.indexOf(e.keyCode);
    self.handleUp(index);
  });

  for (var i = 0; i < self.keyElements.length; i++) {
    var element = self.keyElements[i];
    // If we use touch device only assign the required listeners and vice versa
    if (self.is_touch_device) {
      element[0].addEventListener("touchstart", function(i) {
        self.handleDown(i);
      }.bind(null, i));
      element[0].addEventListener("touchend", function(i) {
        self.handleUp(i);
      }.bind(null, i));
    } else {
      element.mousedown(function(i) {
        self.handleDown(i);
      }.bind(null, i));
      element.mouseup(function() {
        // lift all keys only if we are not dragging currently
        if (!self.dragging) {
          self.allUp(); // lift all keys because we can be pressing only one when using the mouse
        }
      });
    }
  }

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


  $(".showsideBar").click(function() {
    $(this).parent().toggleClass("open");
  });

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

  $(".rec").click(function() {
    var text = "Off";
    if (!self.robot.getRecordingStatus() && !self.otherComponents.ai && !self.otherComponents.recordings_window) {
      self.robot.addNewRecording();
      text = "On";
      $(".rec").addClass("active_recording");
      // TODO: remove the following line of code:
      $("#recIndic").fadeIn(200);

    } else {
      self.robot.stopRecording();
      text = "Off";
      $(".rec").removeClass("active_recording");
      $("#recIndic").fadeOut(200);
    }
    $(".rec").html(text);
  });

  $(".rec_view").click(function() {
    if (!self.robot.getRecordingStatus() && !self.otherComponents.ai && !self.otherComponents.recordings_window) {
      self.otherComponents.recordings_window = 1;
      self.robot.drawRecordings();
      $(".rec_window").fadeIn(500);
    } else {
      self.otherComponents.recordings_window = 0;
      self.robot.stopAllMissions();
      $(".rec_window").fadeOut(500);
    }
  });

  $("#rec_window_close").click(function() {
    self.otherComponents.recordings_window = 0;
    $(".rec_window").fadeOut(500);
    self.robot.stopAllMissions();
  });

  var stream = $("#imageStream")[0];
  var url = document.URL.split(":");
  var schema = url[0];
  var host = url[1].replace(/\//g, "");

  var streamPath = schema + "://" + host + ":8080/?action=stream";
  //streamPath = "http://10.0.0.3:8080/?action=stream";
  console.log(streamPath);
  stream.addEventListener('error', function(e) {
    $('#live').hide();
    stream.setAttribute("src", "/static/images/offline.jpg");
  });
  stream.setAttribute("src", streamPath);
}

// Presses down the keys with the specified index and triggers and update
KeyEventHandler.prototype.handleDown = function(index) {
  // only trigger if the index is valid and the key is not already pressed
  if (index >= 0 && !this.keyStatus[index]) {
    this.keyStatus[index] = true;
    this.keyElements[index].addClass("pressedKey");
    this.update();
  }
};

// Lifts the keys with the specified index and triggers and update
KeyEventHandler.prototype.handleUp = function(index) {
  // only trigger if the index is valid and the key is already pressed
  if (index >= 0 && this.keyStatus[index]) {
    this.keyStatus[index] = false;
    this.keyElements[index].removeClass("pressedKey");
    this.update();
  }
};


// Lifts all keys and triggers and update on the robot object
KeyEventHandler.prototype.allUp = function() {
  for (var i = this.keyElements.length - 1; i >= 0; i--) {
    this.keyStatus[i] = false;
    var element = this.keyElements[i];
    element.removeClass("pressedKey");
  }
  this.update();
};


// Updates the values in the Robot object
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

}


Robot.prototype.updateStatus = function(status) {
  var mem = status.mem;
  var cpu = status.cpu;
  var lav = cpu.avload[0] * 100;
  var freeRam = (mem.free / mem.total) * 100;
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

Robot.prototype.updateUserInput = function(data) {
  this.componentStatus.keys = data.keys;
  this.componentStatus.cam = data.cam;
  this.componentStatus.speed = data.speed;
  this.componentStatus.light = data.light;
  this.componentStatus.laser = data.laser;
  this.componentStatus.ai = data.ai;

  this.update();
};

Robot.prototype.update = function() {
  var self = this;
  // Creates a shorter version of the keylist
  function generateNumber(keylist) {
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
  function sanatizeKeys(keys) {
    var result = keys;
    // Case both left and right arrows are pressed
    if (keys[1] === true && keys[3] === true) {
      result[1] = false;
      result[3] = false;
    }

    // Case both up and down arrows are pressed
    if (keys[0] === true && keys[2] === true) {
      result[0] = false;
      result[2] = false;
    }
    return result;
  }

  function equalArray(array1, array2) {
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

  // sanatize robot movement keys
  var keyMoves = sanatizeKeys(this.componentStatus.keys);

  // TODO: implement this on the serverside
  // keyMoves = generateNumber(keyMoves);

  // sanatize camera movement keys
  var camMoves = sanatizeKeys(this.componentStatus.cam);

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

Robot.prototype.stopRecording = function() {
  this.recStatus = false;
};

Robot.prototype.getRecordingStatus = function() {
  return this.recStatus;
};

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

Robot.prototype.stopAllMissions = function() {
  for (var i = 0; i < this.recordings.length; i++) {
    this.recordings[i].hardStop();
  }
};

Robot.prototype.stopMissionRecording = function() {
  this.recordings[this.recordings.length - 1].stopLastRecord();

};

$(document).ready(function() {
  $(".cover").fadeOut(500);
  window.PiNet = new Robot();
});



/* Recording object ***/
function Recording(name, socket) {
  this.name = name;
  this.socket = socket;
  this.date = new Date().toLocaleTimeString("en-GB");
  this.moves = [];
  this.status = "stop";
  this.time = 0;
}

Recording.prototype.add = function(moves) {
  var date;
  if (this.moves.length !== 0) {
    date = new Date();
    var timeNow = date.getTime();
    var timeDiff = timeNow - this.time;
    this.time = timeNow;
    this.moves[this.moves.length - 1].setTimeDelay(timeDiff);
  } else {
    date = new Date();
    this.time = date.getTime();
  }
  this.moves.push(moves);

};

Recording.prototype.start = function(obj) {
  var self = this;
  this.startButton = obj;
  if (this.status == "start") {
    this.socket.emit("mission", {
      status: "stop"
    });
    this.status = "stop";
    $(obj).css("background-image", "url(images/videoplay.png)");
  } else if (this.status == "stop") {
    this.status = "start";
    this.socket.emit("mission", {
      status: "start",
      moves: this.moves
    });
    console.log(window.JSON.stringify(this.moves));
    $(obj).css("background-image", "url(images/videostop.png)");
  }
};

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

  this.moves[this.moves.length].setStop(timeDiff);
};

function Move(command) {
  this.command = command;
  this.delay = 0;
}

Move.prototype.setTimeDelay = function(delay) {
  this.delay = delay;
};

Move.prototype.setStop = function(delay) {
  this.delay = delay;
};