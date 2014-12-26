var expect = require("expect.js");



// Add tests for some main libs
describe("DB Wrapper", function(){

});

describe("PiStat", function(){
  var Stat = require("../lib/pistat.js");
  var pistat = new Stat();
  describe("#constructor", function(){
    it("should return and object", function(){
      expect(pistat).to.be.an("object");
    });
    it("should have all the properties", function(){
      expect(pistat.os).to.be(require("os").type());
      expect(pistat.bootDate).to.be.a(Date);
    });
    it("should have all the functions", function(){
      expect(pistat._load).to.be.a("function");
      expect(pistat._getMemInfo).to.be.a("function");
      expect(pistat._getCpuInfo).to.be.a("function");
      expect(pistat.getSystemInfo).to.be.a("function");
    });
  });
  describe("_load", function(){

  });
  describe("_getMemInfo", function(){
    var res = pistat._getMemInfo();
    it("should return an object", function(){
      expect(res).to.be.an("object");
    });
    it("should return the info about memory", function(){
      expect(res.total).to.be.an("number");
      expect(res.free).to.be.an("number");
    });
  });
  describe("_getCpuInfo", function(){
    var res = pistat._getCpuInfo();
    it("should return an object", function(){
      expect(res).to.be.an("object");
    });
    it("should return the info about cpu", function(){
      expect(res.boot).to.be.a(Date);
      expect(res.avload).to.be.an(Array);
      //expect(res.load).to.be.an(Array); // FIXME: implement _load
      expect(res.cpus).to.be.an("object");
    });
  });
  describe("getSystemInfo", function(){
    var res = pistat.getSystemInfo();
    it("should return an object", function(){
      expect(res).to.be.an("object");
    });
    it("should expose info about the system", function(){
      expect(res.cpu).to.be.an("object");
      expect(res.mem).to.be.an("object");
    });
  });
});
