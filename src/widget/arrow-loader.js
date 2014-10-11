/* global FINANCIAL_TABLE_CONFIG */

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};
RiseVision.Common.ArrowLoader = {};

RiseVision.Common.ArrowLoader = (function (config) {
  
  "use strict";
  
  var _arrowCount;
  var _loaded = false;
  var _callback = null;

  function _load(callback) {
    if (!_loaded) {
      _loadArrows();
      
      if (callback) {
        _callback = callback;
      }
    }
    else if (callback) {
      callback();
    }        
  }
  
  function _loadArrows() {
    _arrowCount = 0;

    _loadArrow(config.LOGOS_URL + "animated-green-arrow.gif");
    _loadArrow(config.LOGOS_URL + "animated-red-arrow.gif");
  }

  function _loadArrow(url) {
    var img = new Image();

    img.onload = function() {
      _onArrowLoaded();
    };

    img.onerror = function() {
      _onArrowLoaded();
    };

    img.src = url;
  }

  function _onArrowLoaded() {
    _arrowCount++;

    if (_arrowCount === 2 && _callback) {
      _callback();
    }
  }
  
  return {
    load: _load
  };
  
})(FINANCIAL_TABLE_CONFIG);
