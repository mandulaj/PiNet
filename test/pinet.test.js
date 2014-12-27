var expect = require("expect.js");
var populateDB = require("./lib/testUtil.js").populateDB;

var dbReader = require("../lib/dbReader.js");
var io = require("socket.io");
var sqlite3 = require('sqlite3');
var database = new sqlite3.Database(":memory:");

// Config database
require("../config/db.js")(database);
database.serialize();

populateDB(database);

describe("PiNet", function () {

});
