/* global RiseVision, gadgets */

(function (window, document, gadgets) {
  "use strict";

  var prefs = new gadgets.Prefs();

  function play() {
    RiseVision.Financial.Table.play();
  }

  function pause() {
    RiseVision.Financial.Table.pause();
  }

  function stop() {
    RiseVision.Financial.Table.pause();
  }
  
  // Disable context menu (right click menu)
  window.oncontextmenu = function () {
    return false;
  };

  $(document).ready(function() {
    var id = prefs.getString("id");

    gadgets.rpc.register("rscmd_getInstrument", function(index) {
      return RiseVision.Financial.Table.getInstrument.call(financial, index);
    });

    if (id && id !== "") {
      gadgets.rpc.register("rscmd_play_" + id, play);
      gadgets.rpc.register("rscmd_pause_" + id, pause);
      gadgets.rpc.register("rscmd_stop_" + id, stop);
      gadgets.rpc.register("rsparam_set_" + id, RiseVision.Financial.Table.setParams);
      // requesting all params at once
      gadgets.rpc.call("", "rsparam_get", null, id, ["additionalParams", "displayId", "companyId"]);
    }
  });
  
  // ensuring a transparent background immediately
  document.body.style.background = "transparent";
  
})(window, document, gadgets);