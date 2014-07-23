(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;
  browser.driver.manage().window().setSize(1024, 768);

  describe("Financial Tables Settings UI", function() {
    beforeEach(function (){
      browser.get("/src/settings-e2e.html");
    });

    it("Should correctly load default settings", function () {
      
        //scroll enabled
        expect(element(by.css("input[name=scroll-by]:checked")).getAttribute("value")).
          to.eventually.equal("none");
        expect(element(by.id("row-padding")).getAttribute("value")).
          to.eventually.equal("0");
        expect(element(by.id("col-padding")).getAttribute("value")).
          to.eventually.equal("0");
    });

    it("Should display scroll settings when scroll is enabled", function () {
      expect(element(by.css("input[name=scroll-by]:checked")).getAttribute("value")).
        to.eventually.equal("none");
      expect(element(by.css(".more-scroll-options")).isDisplayed()).to.eventually.be.false;
      //click on option, additional options appear
      element(by.id("scroll-by-continuous")).click();
      expect(element(by.css("input[name=scroll-by]:checked")).getAttribute("value")).
        to.eventually.equal("continuous");
      expect(element(by.css(".more-scroll-options")).isDisplayed()).to.eventually.be.true;
    });

    xit("Should correctly save settings", function (done) {
      //TODO
    });
  });
})();
