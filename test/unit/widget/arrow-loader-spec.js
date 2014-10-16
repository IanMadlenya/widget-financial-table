/*jshint expr:true */
"use strict";

describe("Financial Table Widget: arrow loader service", function() {


  it("should exist", function() {
     expect(RiseVision.Common.ArrowLoader).not.to.equal(null);
  });

  it("Should load arrows", function() {
    assert.doesNotThrow(function() {
      RiseVision.Common.ArrowLoader.load(function() {
        done(); 
      });
    });
  });

});
