var os = require('os');

function PI() {
  var date = new Date() - os.uptime() * 1000;
  this.os = os.type();
  this.bootDate = new Date(date);
}

PI.prototype._load = function() {
  // TODO: have to implement this function
};

PI.prototype._getMemInfo = function() {
  var mem = {
    total: os.totalmem(),
    free: os.freemem(),
  };
  return mem;
};

PI.prototype._getCpuInfo = function() {
  var cpu = {
    boot: this.bootDate,
    avload: os.loadavg(),
    load: this._load(),
    cpus: os.cpus()
  };
  return cpu;
};

PI.prototype.getSystemInfo = function() {
  return {
    cpu: this._getCpuInfo(),
    mem: this._getMemInfo()
  };
};

module.exports = PI;
