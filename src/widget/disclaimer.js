var RiseVision = RiseVision || {};
RiseVision.Financial = RiseVision.Financial || {};
RiseVision.Financial.Disclaimer = {};

RiseVision.Financial.Disclaimer = (function () {
  
  "use strict";
  
  var _disclaimerLoc = "bottomRight";

  function _load() {
    //Configure disclaimer.
    $("#disclaimer").text("Market Data by Thomson Reuters - Delayed 20 Minutes");
    $("#disclaimer").addClass("disclaimer_font-style");
    $("#disclaimer").addClass("default");

    if ((_disclaimerLoc === "bottomRight") || (_disclaimerLoc === "bottomLeft")) {	
      $("#disclaimer").addClass("bottom");

      if (_disclaimerLoc === "bottomRight") {
        $("#disclaimer").addClass("right");
      }
    }
    else {
      $("#container").addClass("fullScreen");	
      $("#disclaimer").addClass("top");
      
      if (_disclaimerLoc === "topRight") {
        $("#disclaimer").addClass("right");
      }
    }
  }
  
  return {
    load: _load,
  };
  
})();
