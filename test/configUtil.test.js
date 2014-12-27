var expect = require("expect.js");


describe("ConfigUtil", function(){
  var util = require("../config/lib/configUtil.js");
  describe("#main", function(){
    it("should provide all function", function(){
      expect(util.merge_options).to.be.a("function");
    })
  });
  describe("#merge_options", function(){
    it("should return default function on undefined", function(){
      var testOpts = {
        opt1: "abc",
        opt2: 123
      }
      expect(util.merge_options(undefined, testOpts)).to.eql(testOpts);
    });
    it("should return default function on null", function(){
      var testOpts = {
        opt1: "abc",
        opt2: 123
      }
      expect(util.merge_options(null, testOpts)).to.eql(testOpts);
    });
    it("should return default function on {}", function(){
      var testOpts = {
        opt1: "abc",
        opt2: 123
      }
      expect(util.merge_options({}, testOpts)).to.eql(testOpts);
    });
    it("should override default options", function(){
      var defaultOpts = {
        opt1: "Hello World",
        opt2: 1234,
        opt3: true,
        opt4: null,
        opt5: 5.678,
        opt6: {
          subop: "test"
        }
      }

      var expectedOpts = [
        {
          opt1: "End of world",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: 5.678,
          opt6: {
            subop: "test"
          }
        },
        {
          opt1: "Hello World",
          opt2: "Test",
          opt3: true,
          opt4: null,
          opt5: 123,
          opt6: {
            subop: "test"
          }
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: 5.678,
          opt6: {},
          opt7: null
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: true,
          opt5: 5.678,
          opt6: {
            subop: "test"
          },
          other: "Testing"
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: null,
          opt6: {
            subop: "test"
          },
          opt7: "aloha"
        },
        {
          opt1: "Modified",
          opt2: 4321,
          opt3: false,
          opt4: "Hello",
          opt5: -3.1415,
          opt6: {
            subop: "",
            other: "123",
            testing: 123
          },
          opt7: "hi"
        },
        {
          opt1: "Hello World",
          opt2: 1234,
          opt3: true,
          opt4: null,
          opt5: 5.678,
          opt6: {
            subop: "test"
          },
          other: 123,
          more: "Hello",
          someMore: 34343,
          "crazYName345$@#@#": Infinity
        }
      ]

      expect(util.merge_options({}, defaultOpts)).to.eql(defaultOpts);
      expect(util.merge_options({
        opt1: "End of world"
      }, defaultOpts)).to.eql(expectedOpts[0]);
      expect(util.merge_options({
        opt2: "Test",
        opt5: 123
      }, defaultOpts)).to.eql(expectedOpts[1]);
      expect(util.merge_options({
        opt6: {},
        opt7: null
      }, defaultOpts)).to.eql(expectedOpts[2]);
      expect(util.merge_options({
        other: "Testing",
        opt4: true
      }, defaultOpts)).to.eql(expectedOpts[3]);
      expect(util.merge_options({
        opt7: "aloha",
        opt5: null
      }, defaultOpts)).to.eql(expectedOpts[4]);
      expect(util.merge_options(expectedOpts[5], defaultOpts)).to.eql(expectedOpts[5]);
      expect(util.merge_options({
        other: 123,
        more: "Hello",
        someMore: 34343,
        "crazYName345$@#@#": Infinity
      }, defaultOpts)).to.eql(expectedOpts[6]);
    });
  });
});
