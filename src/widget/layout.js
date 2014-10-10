/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.Financial = RiseVision.Financial || {};
RiseVision.Financial.Layout = {};

RiseVision.Financial.Layout = (function (document, gadgets) {
  
  "use strict";
  
  var _layoutURL;
  var _layout;
  
  var _useDefault = false;
  
  function _load(callback) {
    var params = {};

    //Gadget settings
    // _useDefault = prefs.getBool("useDefault");

    // Use fixed layout
    // _layoutURL = "/Layouts/Table.xml";
    _layoutURL = "https://s3.amazonaws.com/Widget-Financial-Table/0.1.0/Layouts/Table.xml";
    // if (_useDefault) {
    //   _layoutURL = "";
    // }
    // else {	
    //   _layoutURL = prefs.getString("layoutURL");
    // }

    if (_useDefault) {
      callback();
    }
    else if (_layoutURL) {
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;	
      gadgets.io.makeRequest(_layoutURL, function(obj) {
        var data = obj.data;

        if (data.getElementsByTagName("Style").length > 0) {
          var head = document.getElementsByTagName("head")[0],
            style = document.createElement("style");
          
          style.type = "text/css";
          style.innerHTML = data.getElementsByTagName("Style")[0].childNodes[1].nodeValue;
          head.appendChild(style);
        }

        if (data.getElementsByTagName("Layout").length === 0) {
          console.log("No Layout tag specified in custom layout file.");
          return;
        }

        _layout = data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue;
        
        callback();
      }, params);
    }
  }
  
  function _loadLayout(numRows) {
    if (_layoutURL) {
        _showCustomLayout(numRows);
    }
    else {
        _showDefaultLayout();
    }
  }
  
  function _showDefaultLayout() {
    var disclaimer = null,
      table = null;

    $("#container").empty();

    //Configure disclaimer.
    disclaimer = document.createElement("div");
    disclaimer.setAttribute("id", "disclaimer");
    disclaimer.setAttribute("class", "default");
    $("#container").append(disclaimer);

    //Configure table.
    table = document.createElement("table");
    table.setAttribute("id", "financial");
    table.setAttribute("class", "default page");	
    $("#container").append(table);
  }

  /* Custom layout may or may not be a table. Need to account for both possibilities. */
  function _showCustomLayout(numRows) {
    $("#container").empty();
    $("#container").append(_layout);

    for (var row = 0; row < numRows; row++) {
      var parent = $(".repeat:first").parent();
      
      if (row > 0) {
        $(parent).append($(".repeat:first").clone());
      }
    }
  }
  
  return {
    load: _load,
    loadLayout: _loadLayout
  };
  
})(document, gadgets);
