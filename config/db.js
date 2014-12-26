/* Configuration file for the database */
var merge_options = require("./lib/configUtil.js").merge_options;


var defaultOptions = {
  clearSockets: true
}

module.exports = function(db, opts){
  opts = merge_options(opts, defaultOptions);

  // Setup db tables
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER  PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, username TEXT  NOT NULL  UNIQUE, password TEXT  NOT NULL, access INT  DEFAULT ( 0 ), lastLogin TEXT, banned  BOOLEAN  DEFAULT( 0 ))");
  db.run("CREATE TABLE IF NOT EXISTS logins (id INTEGER  PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, ip TEXT  NOT NULL  UNIQUE, accessed INT  DEFAULT ( 1 ), lastDate  TEXT, threat  INT  DEFAULT ( 1 ), banned  BOOLEAN  DEFAULT( 0 ))");
  db.run("CREATE TABLE IF NOT EXISTS sockets (id TEXT  PRIMARY KEY  NOT NULL  UNIQUE, userId INTEGER)");

  if (opts.clearSockets) {
    db.run("DELETE FROM sockets"); // Clear the sockets database
  }
}
