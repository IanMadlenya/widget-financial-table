casper.test.begin("Testing Financial Table Widget", function (test) {
  var system = require('system');
  var e2ePort = system.env.E2E_PORT || 8099;
  
  casper.options.waitTimeout = 1000;
  
  casper.start("http://localhost:"+e2ePort+"/src/widget-e2e.html",
    function () {
      test.assertTitle("Financial Table Widget");
    }
  );

  casper.waitFor(function check() {
    return this.evaluate(function() {
      return document.querySelectorAll('.dataTables_scroll').length > 0;
    });
  }, function then() {
    casper.then(function() {    
      casper.test.comment("Check Authorization notification");
      
      test.assertExists(".auth-warning", "Widget is not authorized");
    });

    casper.then(function() {    
      casper.test.comment("Disclaimer is present");
      
      test.assertExists("#disclaimer", "Disclaimer is shown");
    });
    
    casper.then(function() {
      casper.test.comment("Table header is present");
      
      // dataTables duplicates header columns
      test.assertElementCount(".dataTables_scrollHead th.heading_font-style", 2,
            "Check number of columns");
    });

    casper.then(function () {
      casper.test.comment("Table is showing data");

      test.assertElementCount("tr.repeat.item", 6,
            "Check number of rows");
            
      test.assertElementCount(".repeat.item td", 12,
            "Check number of cells");
    });
  });
  
  casper.run(function() {
    test.done();
  });
});
