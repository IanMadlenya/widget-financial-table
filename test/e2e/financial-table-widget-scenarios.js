casper.test.begin("Alignment - Loading", function (test) {
  var system = require('system');
  var e2ePort = system.env.E2E_PORT || 8099;
  casper.start("http://localhost:"+e2ePort+"/src/widget-e2e.html",
    function () {
      test.assertTitle("Financial Table Widget");
    }
  );

  casper.run(function() {
    test.done();
  });
});
