/* global gadgets, FINANCIAL_TABLE_CONFIG */

var RiseVision = RiseVision || {};
RiseVision.Financial = RiseVision.Financial || {};
RiseVision.Financial.Table = {};

RiseVision.Financial.Table = (function (window, document, gadgets, utils, config) {

  "use strict";
  
  // var SCROLL = {
  //   DIRECTION: "down",
  //   RESUMES: 5
  // };

  // private variables
  var _prefs = null;

  var _displayId = "", _companyId = "";
  var _isAuthorized = true;

  // instance variable Financial (RiseVision.Common.Financial.RealTime)
  var _financial = null;
  var _table = null;
  
  var _data, _urls;

  var _additionalParams = null;
  var _requestedFields = [];
    
  var _hasLogos = false;
  var _updateInterval = 60000;
  
  var _requested;
  var _checkForUpdates;
    
  var _isLoading = true;
  
  function _appendStyle() {
    if (_additionalParams && _additionalParams.table) {
      //Inject CSS font styles into the DOM.
      utils.addCSSRules([
        utils.getFontCssStyle("heading_font-style", _additionalParams.table.colHeaderFont),
        utils.getFontCssStyle("data_font-style", _additionalParams.table.dataFont),
        utils.getFontCssStyle("disclaimer_font-style", _additionalParams.disclaimer.font),
        ".dataTable .even{background-color:" + _additionalParams.table.rowColor + ";}",
        ".dataTable .odd{background-color:" + _additionalParams.table.altRowColor + ";}"
        // ".selected{background-color:" + _additionalParams.table.selectedColor + ";}"
      ]);
    }
  }

  function _getInstrument(index) {
    $("tr").removeClass("selected");		
    $(".item").eq(index).addClass("selected");
    
    return $(".item").eq(index).attr("data-code");
  }

  /*
   * Keep track of previously unrequested instruments, particularly in a chain.
   * This list is made available via an RPC call.
   */
  function _checkInstruments(includeAll) {
    var instruments = [],
      unrequested = [],
      numRows = _data.getNumberOfRows();
    
    if (includeAll) {
      _requested = [];
    }

    for (var row = 0; row < numRows; row++) {
      instruments.push(_data.getFormattedValue(row, _financial.dataFields["code"]));
    }
      
    //Find all symbols in "instruments" that are not already in "_requested".
    unrequested = $.grep(instruments, function(el) {
      return $.inArray(el, _requested) === -1;
    });

    for (var i = 0; i < unrequested.length; i++) {
      _requested.push(unrequested[i]);
    }
    
    if (unrequested.length > 0) {
      gadgets.rpc.call("", "instrumentsChanged", null, _displayId, unrequested);
    }
      
    if (includeAll) {
      //Every 24 hours, pass a list of all instruments to any listeners.
      setTimeout(function() {
        _checkInstruments(true);
      }, 24 * 60 * 60 * 1000);
    }
  }

  function _setParams(name, value) {
    if (name[0] && name[0] === "additionalParams" && value[0]) {
      _additionalParams = JSON.parse(value[0]);
      
      document.body.style.background = _additionalParams.background.color || "transparent";
      
      _appendStyle();
            
      //Determine what columns will need to be requested from the data source.
      //Instrument is always returned.      
      $.each(_additionalParams.columns, function(index, value) {
        if ((value.id === "name" ) || (value.id === "logo") || (value.id === "instrument") || (value.id === "arrow")) {
          
        }	//Issue 853
        else {
          _requestedFields.push(value.id);
        }
        
        if (value.id === "logo") {
          _hasLogos = true;		    
        }	    
      });

      _requestedFields.push("code");
      _requestedFields.push("name");	//Issue 853    
    }
    
    if (name[1] && name[1] === "displayId") {
      _displayId = value[1];
    }
    
    if (name[2] && name[2] === "companyId") {
      _companyId = value[2];
    }
    
    _prefs = new gadgets.Prefs();
    
    _init();
  }
  
  function _init() {    
    _financial = new RiseVision.Common.Financial.RealTime(_displayId, _additionalParams.instruments);
    _table = new RiseVision.Common.Table(_additionalParams, _financial, _prefs);

    RiseVision.Financial.Layout.load(function() {
      _getData();
      _authorize();      
    });
  }
  
  function _authorize() {
    var productCode = config.PRODUCT_CODE;
    var auth = new RiseVision.Common.Store.Auth();
    
    if (_displayId) {
      auth.checkForDisplay(_displayId, productCode, function(authorized) {
          _isAuthorized = authorized;
      });
    }
    else if (_companyId) {
      auth.checkForCompany(_companyId, productCode, function(authorized) {
        _isAuthorized = authorized;
      });
    }
    else {
      _isAuthorized = false;
    }
  }
  
  function _getData() {
    if (_isAuthorized) {
      _financial.getData(_requestedFields, _hasLogos, _isChain(), function(data, urls) {
        if (data) {
          _data = data;
          _urls = urls;
          
          //Temporarily size the Gadget using the UserPrefs. Workaround for multi-page Presentation issue.
          $("#container").width(_prefs.getString("rsW"));
          $("#container").height(_prefs.getString("rsH"));
          
          if (_isLoading) {
            RiseVision.Common.ArrowLoader.load(function() {
              _loadLayout();
            });
          }
          else {
            //Only chains could potentially contain different instruments.
            if (_isChain()) {
              _checkInstruments(false);
            }

            _loadLayout();
          }
        }
        else {
          _startTimer();
        }
      });
    }
    else {
      _startTimer();
    }
  } 
  
  function _loadLayout() {
    var selectedIndex = -1;
    
    if (_isLoading || _isChain()) {
      if (!_isLoading) {
        // $(".dataTables_scrollBody").infiniteScroll.stop();
        $(".dataTables_scrollBody").data("plugin_autoScroll").stop();
      }
      
      selectedIndex = $(".selected").index();

      RiseVision.Financial.Layout.loadLayout(_data.getNumberOfRows());
      
      RiseVision.Financial.Disclaimer.load();
    }

    _table.initTable(_data, _urls, _isLoading, _isChain(), selectedIndex);

    //Initialize scrolling after conditions so that when scrolling by page, the cloned items will show the conditions as well.
    if (_isLoading || _isChain()) {
      $(".dataTables_scrollBody").autoScroll(_additionalParams.scroll)
      .on("done", function() {
        _onLastItemScrolled.call();
      });
      // $(".dataTables_scrollBody").infiniteScroll({
      //   scrollBy: this._additionalParams.scroll.by,
      //   direction: (this._additionalParams.scroll.by === "none" ? this._additionalParams.scroll.by : _SCROLL.DIRECTION),
      //   duration: this._additionalParams.scroll.pause * 1000,
      //   speed: this._additionalParams.scroll.speed,
      //   swipingTimeout: _SCROLL.RESUMES * 1000,
      //   toggleOddEven: true
      // })
      // .bind("onLastItemScrolled", function(event) {
      //   _onLastItemScrolled.call(_, event);
      // });
    }

    //Size container back to its original dimensions.
    $("#container").width("100%");
    $("#container").height("95%");

    if (_isLoading) {
      _isLoading = false;
      _ready();

      _checkInstruments(true);
    }
    else {
      $(".dataTables_scrollBody").data("plugin_autoScroll").play();
      // $(".dataTables_scrollBody").infiniteScroll.start();
    }
    
    _startTimer();
  }

  function _onLastItemScrolled() {
    if (_additionalParams.scroll.by !== "page") {
      _done();
    }

    if (_checkForUpdates) {
      if (_additionalParams.scroll.by === "page") {
        //$(".dataTables_scrollBody").infiniteScroll.stop();
        _checkForUpdates = false;
        _getData();
      }
      else {	    
        _checkForUpdates = false;
        _getData();
      }
    }
  }

  function _startTimer() {
    setTimeout(function() {
      //If we"re not scrolling, or there is not enough content to scroll, check for updates right away.
      // if ((_additionalParams.scroll.by === "none") || (!$(".dataTables_scrollBody").infiniteScroll.canScroll())) {
      if (_additionalParams.scroll.by === "none" || !$(".dataTables_scrollBody").data("plugin_autoScroll").canScroll()) {
        _getData();
      }
      else {
        _checkForUpdates = true;
      }
    }, _updateInterval);
  }

  function _isChain() {
    var instruments = _additionalParams.instruments;

    //This is a chain if there is only one instrument being requested, but multiple rows of data are returned.
    if (_data !== null) {
      return instruments.length === 1 && _data.getNumberOfRows() > 1;
    }
    else {
      return false;
    }
  } 

  // sends "READY" event to the Viewer
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"), true, true, true, true, true);
  }

  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));
  }
  
  function _play() {
    // $(".dataTables_scrollBody").infiniteScroll.start(); 
    $(".dataTables_scrollBody").data("plugin_autoScroll").play();  
  }

  function _pause() {
    // $(".dataTables_scrollBody").infiniteScroll.pause();	
    $(".dataTables_scrollBody").data("plugin_autoScroll").pause();
  }

  return {
    setParams: _setParams,
    pause: _pause,
    play: _play,
    getInstrument: _getInstrument
  };

})(window, document, gadgets, RiseVision.Common.Utilities, FINANCIAL_TABLE_CONFIG);