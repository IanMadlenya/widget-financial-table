(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;
  browser.driver.manage().window().setSize(1024, 768);

  var INSTRUMENT_COUNT = 30;
  var COLUMN_COUNT = 18;

  var settings = {
    params: {
      instruments: [
        "AA.N",
        "AXP.N",
        "BA.N",
        "BAC.N",
        "CAT.N",
        "CSCO.O",
        "CVX.N",
        "DD.N",
        "DIS.N",
        "GE.N",
        "HD.N",
        "HPQ.N",
        "IBM.N",
        "INTC.O",
        "JNJ.N",
        "JPM.N",
        "KO.N",
        "KRFT.O",
        "MCD.N",
        "MMM.N",
        "MRK.N",
        "MSFT.O",
        "PFE.N",
        "PG.N",
        "T.N",
        "TRV.N",
        "UTX.N",
        "VZ.N",
        "WMT.N",
        "XOM.N"
      ],
      background: {
        color: "transparent"
      }
    },
    additionalParams: {
      "scroll": {
        "by":"none",
        "speed":"medium",
        "pause":"5"
      },
      "table": {
        "colHeaderFont": {
          "font": {
            "family":"Verdana"
          },
          "size":"20",
          "bold":false,
          "italic":false,
          "underline":false,
          "color":"black",
          "highlightColor":"transparent",
          "align":"left"
        },
        "dataFont": {
          "font": {
            "family":"Verdana"
          },
          "size":"20",
          "bold":false,
          "italic":false,
          "underline":false,
          "color":"black",
          "highlightColor":"transparent",
          "align":"left"
        },
        "rowColor":"transparent",
        "altRowColor":"transparent",
        "rowPadding":"0",
        "colPadding":"0"
      },
      "columns": [{
          "name":"instrument",
          "type":"text",
          "alignment":"left",
          "width":"100",
          "decimals":0,
          "sign":"arrow",
          "colorCondition":"none"
        },
        {
          "name":"instrument-logo",
          "type":"text",
          "alignment":"left",
          "width":"100",
          "decimals":0,
          "sign":"arrow",
          "colorCondition":"none"
        }
      ],
      "disclaimer": {
        "font": {
          "size":"9",
          "italic":true,
          "align":"right",
          "font": {
            "type":"standard",
            "name":"Verdana",
            "family":"Verdana"
          },
          "bold":false,
          "underline":false,
          "color":"black",
          "highlightColor":"transparent"
        }
      }
    }
  };

  describe("Financial Tables Settings UI", function() {
    beforeEach(function (){
      browser.get("/src/settings-e2e.html");
    });

    it("Should load all components", function () {
      expect(element(by.css("div[name=instruments] .select2-container")).isPresent()).
        to.equal.true;

      expect(element(by.id("scroll-by")).isPresent()).
        to.equal.true;

      expect(element(by.id("row-padding")).isPresent()).
        to.equal.true;

      expect(element(by.id("column-selector")).isPresent()).
        to.equal.true;
    });

    it("Should correctly load default settings", function () {
      // check default instrument count
      expect(element.all(by.css(".tag-manager .tags span")).count()).
        to.equal.INSTRUMENT_COUNT;

      //scroll disabled
      expect(element(by.id("scroll-by")).getAttribute("value")).
        to.eventually.equal("none");

      expect(element.all(by.css("#column-selector option")).count()).
        to.eventually.equal(COLUMN_COUNT - 2);
    });

    it("Form should be valid", function () {
      expect(element(by.css("form[name=settingsform].ng-valid")).isPresent()).
        to.equal.true;

      element(by.id("save")).click();

      expect(element(by.css("form[name=settingsform].ng-valid")).isPresent()).
        to.equal.true;
    });

    it("If all columns are removed, form should be invalid", function () {
      element.all(by.css(".panel-group div.panel a.glyphicon")).then(function (elements) {
        elements[1].click();
        elements[0].click();

        expect(element(by.css("form[name=settingsform].ng-valid")).isPresent()).
          to.equal.false;

        expect(element(by.css("form[name=settingsform].ng-invalid")).isPresent()).
          to.equal.true;

        expect(element(by.id("save")).getAttribute("disabled")).
          to.eventually.equal("true");
      });
    });

    it("Should correctly save settings", function (done) {
      var paramsString = "?up_instruments="
            + encodeURIComponent(JSON.stringify(settings.params.instruments))
            + "&up_background="
            + encodeURIComponent(JSON.stringify(settings.params.background));

      element(by.id("save")).click();

      expect(browser.executeScript('return window.result')).to.eventually.deep.equal(
        {
          'additionalParams': JSON.stringify(settings.additionalParams),
          'params': paramsString
        });
    });
  });
})();
