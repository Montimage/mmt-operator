var assert = require("assert");
var Probe  = require("../libs/Probe");

describe("Probe", function(){
  describe("set and get input-source", function(){
    it("should have the same value", function(){
      var probe = new Probe("online");
      probe.updateInputSource("eth0", function( err ){
        assert.ifError( err );
        probe.get_input_source( function(err, iface ){
          assert.ifError( err );
          assert.equal(iface, "eth0");
        });
      })
    });
  });
});
