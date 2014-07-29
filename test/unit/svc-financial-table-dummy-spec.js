/*jshint expr:true */
"use strict";

describe("Financial Table Widget: dummy service", function() {

  beforeEach(module("risevision.widget.financialTable.settings"));

  it("should exist", inject(function(
    //dummyService
  ) {
    // expect(dummyService).not.to.equal(null);
  }));

  xit("Should do something", inject(function(dummyService) {
    expect(dummyService.doSomething()).to.equal("done");
  }));

});
