var expect = require("expect.js"),
  net = require('net'),
  http = require('http'),
  fs = require('fs'),
  sqlite3 = require('sqlite3'),
  DB = require("../lib/dbReader.js"),
  SocketIoServer = require("socket.io"),
  SocketIoClient = require('socket.io-client'),
  jwt = require('jsonwebtoken'),
  populateDB = require("./lib/testUtil.js").populateDB;

// Configuration file
var config = require("../config/config.json");

// Constants
var NETWORKING_TIMEOUT = 4; // Milliseconds timeout expected between networking events
var TEST_SOCKET = '/tmp/pinetTest.sock'; // Unix socket on which the robot test server listens
var SOCKETIO_PORT = 7489; // Port on which the Socket,io server listens
var TOKEN = jwt.sign({ // Token used to authenticate sockets
  id: 1
}, config.secrets.jwt, {
  expiresInMinutes: 24 * 60
});
// Clear the test socket if it exists
if (fs.existsSync(TEST_SOCKET)) {
  fs.unlinkSync(TEST_SOCKET);
}


// Global variables declaration
var robotServer = null; // python test server
var pythonSocket = null; // robot test connection

var Robot = null; // instance of PiNet (being tested)

var socketServer = null; // socket.io testing server
var socketClient = null; // socket.io testing client



// Configure database
var database = new sqlite3.Database(":memory:");
database.serialize();
require("../config/db.js")(database);
populateDB(database);


// Set up the socket.io Server
var app = http.createServer(function(req,res){
  res.end("Test")
});
socketServer = SocketIoServer(app);
// Configure the socket server
require("../config/socketio.js")(socketServer, database, config);


before(function(done){
  // set up test 'python' (Robot) server
  robotServer = net.createServer(function(c){
    // Robot has connected, get the connection object
    pythonSocket = c;
    c.on("data", function(data){ // Get the data so that the buffer gets flushed
      //console.log(data.toString());
      return;
    });

    // set up the socketio testing client
    app.listen(SOCKETIO_PORT, "localhost" , function(){
      // Make the address for the client socket
      var servrAddr = app.address();
      var socketAddr = 'http://' + servrAddr.address + ':' + servrAddr.port + '/commands';// + SOCKETIO_PORT;

      // Make the socket with the generated token
      socketClient = SocketIoClient(socketAddr, {
        'query': 'token=' + TOKEN
      });
      socketClient.on('connect', function(){
        // client has connected, we can get started
        done();
      });
    });
  });

  // Bind the robot server to the test socket
  robotServer.listen(TEST_SOCKET, function(){
  });

  // Create database reader object
  var db = new DB(database);
  // Create the robot
  Robot = require('../lib/pinet.js')(socketServer, db, {
    port: TEST_SOCKET
  });
})


describe("PiNet", function () {
  describe("#constructor", function(){

    it('should create an object', function(){
      //console.log("pysoc", pythonSocket);
      expect(Robot).to.be.an('object');
    });
    it('should have all the methods', function(){
      expect(Robot.update).to.be.a('function');
      expect(Robot.writeCommandsToSock).to.be.a('function');
      expect(Robot.writeMissionToSock).to.be.a('function');
      expect(Robot.writeToRobot).to.be.a('function');
      expect(Robot.raiseAlert).to.be.a('function');
      expect(Robot.defaultState).to.be.a('function');
    });
  });
  describe('#update', function(){
    it('should send an update to the server', function(done){
      // make the data random to make sure we are getting the actual data
      var testSpeed = Math.floor(Math.random()*100);
      Robot.componentStatus.speed = testSpeed;

      var start = Date.now();
      Robot.update();
      pythonSocket.once('data', function(data){
        var end = Date.now();

        if ((end - start) < NETWORKING_TIMEOUT) {
          var strData = data.toString();
          strData = strData.replace("&", "");
          var json = JSON.parse(strData)
          expect(json.commands).to.be.an(Object);
          var comm = json.commands;
          expect(comm).to.only.have.keys(['light', 'laser', 'ai', 'keys', 'speed', 'camMove']);
          expect(comm.speed).to.be(testSpeed);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"))
        }
      });
    });
    it('should send append an & to the message for chunk parsing', function(done){
      // make the data random to make sure we are getting the actual data
      var testSpeed = Math.floor(Math.random()*100);
      Robot.componentStatus.speed = testSpeed;

      var start = Date.now();
      Robot.update();
      pythonSocket.once('data', function(data){
        var end = Date.now();

        if ((end - start) < NETWORKING_TIMEOUT) {
          var strData = data.toString();
          expect(strData[strData.length - 1]).to.be("&");
          strData = strData.replace("&", "");
          var json = JSON.parse(strData)
          expect(json.commands.speed).to.be(testSpeed);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"))
        }
      });
    });
    it('should set message to the value of \'commands\'', function(done){
      // make the data random to make sure we are getting the actual data
      var testSpeed = Math.floor(Math.random()*100);
      Robot.componentStatus.speed = testSpeed;

      var start = Date.now();
      Robot.update();
      pythonSocket.once('data', function(data){
        var end = Date.now();

        if ((end - start) < NETWORKING_TIMEOUT) {
          var strData = data.toString();
          strData = strData.replace("&", "");
          var json = JSON.parse(strData)
          expect(json.message).to.be("commands");
          expect(json.commands).to.be.an(Object);
          var comm = json.commands;
          expect(comm.speed).to.be(testSpeed);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"))
        }
      });
    });
  });
  describe("#writeCommandsToSock", function(){
    it('should send an update to the server', function(done){
      // make the data random to make sure we are getting the actual data
      var testSpeed = Math.floor(Math.random()*100);
      Robot.componentStatus.speed = testSpeed;

      var start = Date.now();
      Robot.writeCommandsToSock();
      pythonSocket.once('data', function(data){
        var end = Date.now();

        if ((end - start) < NETWORKING_TIMEOUT) {
          var strData = data.toString();
          strData = strData.replace("&", "");
          var json = JSON.parse(strData)
          expect(json.commands).to.be.an(Object);
          var comm = json.commands;
          expect(comm).to.only.have.keys(['light', 'laser', 'ai', 'keys', 'speed', 'camMove']);
          expect(comm.speed).to.be(testSpeed);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"))
        }
      });
    });
    it('should send append an & to the message for chunk parsing', function(done){
      // make the data random to make sure we are getting the actual data
      var testSpeed = Math.floor(Math.random()*100);
      Robot.componentStatus.speed = testSpeed;

      var start = Date.now();
      Robot.writeCommandsToSock();
      pythonSocket.once('data', function(data){
        var end = Date.now();

        if ((end - start) < NETWORKING_TIMEOUT) {
          var strData = data.toString();
          expect(strData[strData.length - 1]).to.be("&");
          strData = strData.replace("&", "");
          var json = JSON.parse(strData)
          expect(json.commands.speed).to.be(testSpeed);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"))
        }
      });
    });
    it('should set message to the value of \'commands\'', function(done){
      // make the data random to make sure we are getting the actual data
      var testSpeed = Math.floor(Math.random()*100);
      Robot.componentStatus.speed = testSpeed;

      var start = Date.now();
      Robot.writeCommandsToSock();
      pythonSocket.once('data', function(data){
        var end = Date.now();

        if ((end - start) < NETWORKING_TIMEOUT) {
          var strData = data.toString();
          strData = strData.replace("&", "");
          var json = JSON.parse(strData)
          expect(json.message).to.be("commands");
          expect(json.commands).to.be.an(Object);
          var comm = json.commands;
          expect(comm.speed).to.be(testSpeed);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"))
        }
      });
    });
  });
  describe("#writeMissionToSock", function(){
    it("should send a mission to the server", function(done){
      var mission = {
        moves:  [{"command":"F","delay":184},{"command":"STOP","delay":394},{"command":"F","delay":173},{"command":"STOP","delay":353},{"command":"B","delay":248},{"command":"STOP","delay":0}],
        status: "start"
      };
      var start = Date.now();
      Robot.writeMissionToSock(mission);
      pythonSocket.once('data', function(data){
        var end = Date.now();
        if ((end - start) < NETWORKING_TIMEOUT * 2) {
          var strData = data.toString();
          strData = strData.replace("&", "");
          var json = JSON.parse(strData);
          expect(json.moves).to.eql(mission.moves);
          expect(json.status).to.be("start");
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"));
        }
      });
    });
    it("should append a & to help parsing", function(done){
      var mission = {
        moves:  [{"command":"F","delay":456},{"command":"STOP","delay":123},{"command":"F","delay":234},{"command":"STOP","delay":123},{"command":"B","delay":567},{"command":"STOP","delay":0}],
        status: "start"
      };
      var start = Date.now();
      Robot.writeMissionToSock(mission);
      pythonSocket.once('data', function(data){
        var end = Date.now();
        if ((end - start) < NETWORKING_TIMEOUT * 2) {
          var strData = data.toString();
          expect(strData[strData.length - 1]).to.be("&");
          strData = strData.replace("&", "");
          var json = JSON.parse(strData);
          expect(json.moves).to.eql(mission.moves);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"));
        }
      });
    });
    it("should not include status or moves when not in the mission", function(done){
      var mission = {
      };
      var start = Date.now();
      Robot.writeMissionToSock(mission);
      pythonSocket.once('data', function(data){
        var end = Date.now();
        if ((end - start) < NETWORKING_TIMEOUT * 2) {
          var strData = data.toString();
          strData = strData.replace("&", "");
          var json = JSON.parse(strData);
          expect(json).to.not.have.keys(['moves', 'status']);
          done();
        } else {
          done(new Error('Timeout ' + (end - start) + "ms"));
        }
      });
    });
  });
});

after(function(){
  socketClient.disconnect();
  socketServer.close();
  robotServer.close();
  pythonSocket.destroy();
  delete Robot
})
