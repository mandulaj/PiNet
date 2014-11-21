// JavaScript Document
/*
var Dragging = false;
var is_touch_device = 'ontouchstart' in document.documentElement;
var sideBar = 0;
var recordings = 0;*/

function UIWindow() {
  this.dragging = false;
  this.is_touch_device = 'ontouchstart' in document.documentElement;
  this.sideBar = false;
  this.recording = false;
}

function Robot() {
  var self = this;
  this.keylist = [false, false, false, false];
  this.power = 100;
  this.lightStatus = false;
  this.laser_status = false;
  this.camMoves = [false, false, false, false];
  this.aiStatus = false;
  this.recStatus = false;
  this.recordings = [];
  this.previousCommand = {
    keys: 0,
    speed: 100,
    light: 0
  };

  this.socket = io("/commands", {
    'query': 'token=' + sessionStorage.getItem("socketIOtoken")
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

Robot.prototype.updatekey = function() {
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

  var dataToSend = this.keylist;

  // Case both left and right arrows are pressed
  if (this.keylist[1] === true && this.keylist[3] === true) {
    dataToSend[1] = false;
    dataToSend[3] = false;
  }

  // Case both up and down arrows are pressed
  if (this.keylist[0] === true && this.keylist[2] === true) {
    dataToSend[0] = false;
    dataToSend[2] = false;
  }

  var keyStatusNumber = generateNumber(dataToSend);

  dataToSend = this.camMoves;

  // Case both left and right arrows are pressed
  if (this.camMoves[1] === true && this.camMoves[3] === true) {
    dataToSend[1] = false;
    dataToSend[3] = false;
  }
  // Case both up and down arrows are pressed
  if (this.camMoves[0] === true && this.camMoves[2] === true) {
    dataToSend[0] = false;
    dataToSend[2] = false;
  }
  var camMoves;
  if (this.camMoves[0] == -1) {
    camMoves = "default";
  } else {
    camMoves = generateNumber(dataToSend);
  }

  if (this.recStatus == 1) {
    var command = "STOP";
    if (this.previousCommand.keys != string_to_send) {
      switch (string_to_send) {
        case "0000":
          command = "STOP";
          break;
        case "1000":
          command = "F";
          break;
        case "0100":
          command = "L";
          break;
        case "0010":
          command = "B";
          break;
        case "0001":
          command = "R";
          break;
        case "1100":
          command = "FL";
          break;
        case "1001":
          command = "FR";
          break;
        case "0110":
          command = "BL";
          break;
        case "0011":
          command = "BR";
          break;
        default:
          command = "STOP";

      }
    } else if (this.previousCommand.speed != this.power) {
      command = "S" + this.power.toString();
    } else if (this.previousCommand.light != this.lightStatus) {
      if (this.lightStatus === 0) {
        command = "LIGHTOFF";
      } else {
        command = "LIGHTON";
      }
    }

    this.recordings[this.recordings.length - 1].add(new Move(command));

  }

  this.previousCommand.keys = string_to_send;
  this.previousCommand.speed = this.power;
  this.previousCommand.light = this.lightStatus;

  this.socket.emit("commands", {
    Hash: this.KeyHash,
    Key: string_to_send,
    Speed: this.power,
    ai: this.aiStatus,
    light: this.lightStatus,
    laser: this.laser_status,
    cam: camMoves
  });

  console.log({
    Hash: this.KeyHash,
    Key: string_to_send,
    Speed: this.power,
    ai: this.aiStatus,
    light: this.lightStatus,
    laser: this.laser_status,
    cam: camMoves
  });
};

Robot.prototype.addNewRecording = function() {
  var name = new Date().toLocaleTimeString("en-GB");
  if (this.recordings.length > 5) {
    this.recordings.shift();
  }
  this.recordings.push(new Recording(name, this.socket));
};

Robot.prototype.drawRecordings = function() {
  if (this.recordings.length === 0) {
    $("#rec_window_content").html("No recordings Yet!");
  } else {
    $("#rec_window_content").html("");
  }
  for (var i = 0; i < this.recordings.length; i++) {
    console.log(i);
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

$(function() {
  $("#grabthing").draggable({
    axis: "y",
    containment: 'parent',
    grid: [0, 20],
    drag: function(event, ui) {
      updateVal();
    },
    start: function(event, ui) {
      Dragging = true;
    },
    stop: function(event, ui) {
      setTimeout(function() {
        Dragging = false;
      }, 10);
    }
  });
});



function updateVal() {
  var top = slidthing.style.top;
  top = top.replace("px", "");
  top = 400 - top.valueOf();
  var percent = 100 * (top / 400);
  percent = Math.floor(percent + 0.5);
  if (percent >= 90) {
    slidthing.childNodes[0].style.color = "#F00";
  } else {
    slidthing.childNodes[0].style.color = "#000";
  }
  slidthing.childNodes[0].innerHTML = percent + "%";
  if (PiNet.power != percent) {
    PiNet.power = percent;
    window.PiNet.updatekey();
  }
}


$("#grabthing").mousedown(function() {
  $(window).mousemove(function() {
    updateVal();
  });
});

$(document).ready(function(e) {
  updateVal();

  $(".showsidebar").click(function() {
    if (sideBar === 0) {
      $(".sideBar").animate({
        left: "+=110"
      }, 1000, function() {
        $(".showsidebar>span").html("&lt;");
      });
      sideBar = 1;
    } else {
      $(".sideBar").animate({
        left: "-=110"

      }, 1000, function() {
        $(".showsidebar>span").html("&gt;");
      });
      sideBar = 0;
    }
  });

  $(".lightSwitch").click(function() {
    if (window.PiNet.lightStatus === 0) {
      window.PiNet.lightStatus = 1;
      window.PiNet.updatekey();
      $(".lightSwitch").css("background-color", "#FFF");
      $(".lightSwitch").html("On");
    } else if (window.PiNet.lightStatus == 1) {
      window.PiNet.lightStatus = 2;
      window.PiNet.updatekey();
      $(".lightSwitch").css("background-color", "rgb(123, 238, 33)");
      $(".lightSwitch").html("Auto");
    } else if (window.PiNet.lightStatus == 2) {
      window.PiNet.lightStatus = 0;
      window.PiNet.updatekey();
      $(".lightSwitch").css("background-color", "#111");
      $(".lightSwitch").html("Off");
    }
  });

  $(".ai").click(function() {
    if (window.PiNet.aiStatus === 0 && window.PiNet.recStatus === 0 && recordings === 0) {
      window.PiNet.aiStatus = 1;
      window.PiNet.updatekey();
      $(".ai").css("background-color", "rgb(138, 0, 0)");
      $(".ai").html("On");
    } else {
      window.PiNet.aiStatus = 0;
      window.PiNet.updatekey();
      $(".ai").css("background-color", "#111");
      $(".ai").html("Off");
    }
  });

  $(".rec").click(function() {
    if (window.PiNet.recStatus === 0 && window.PiNet.aiStatus === 0 && recordings === 0) {
      window.PiNet.addNewRecording();
      window.PiNet.recStatus = 1;
      $(".rec").css("background-color", "rgb(255, 40, 40)").css("-webkit-animation", "rec 3s infinite");
      $(".rec").html("On");
      $("#recIndic").fadeIn(200);

    } else {
      window.PiNet.recStatus = 0;
      $(".rec").css("background-color", "#111").css("-webkit-animation", "none 3s infinite");
      $(".rec").html("Off");
      $("#recIndic").fadeOut(200);
    }
  });

  $(".rec_view").click(function() {
    if (window.PiNet.recStatus === 0 && window.PiNet.aiStatus === 0 && recordings === 0) {
      recordings = 1;
      window.PiNet.drawRecordings();
      $(".rec_window").fadeIn(500);
    } else {
      recordings = 0;
      PiNet.stopAllMissions();
      $(".rec_window").fadeOut(500);
    }
  });

  $("#rec_window_close").click(function() {
    recordings = 0;
    $(".rec_window").fadeOut(500);
    PiNet.stopAllMissions();
  });


  $("#laser").mousedown(function() {
    $("#laser").css("background-color", "rgb(206, 13, 13)");
    window.PiNet.laser_status = 1;
    window.PiNet.updatekey();

  });

  $("#laser").mouseup(function() {
    $("#laser").css("background-color", "");
    window.PiNet.laser_status = 0;
    window.PiNet.updatekey();
  });


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
      moves: window.JSON.stringify(this.moves)
    });
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