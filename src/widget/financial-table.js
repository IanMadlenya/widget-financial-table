/* global gadgets */

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
  var _data, _urls;

  var _additionalParams = null;
  var _requestedFields = [];
  
  var _useDefault = false;
    
  var _hasLogos = false;
  var _hasLastItemScrolled = false;
  var _updateInterval = 60000;
  var _selectedIndex = -1;
  
  var _requested;
  var _checkForUpdates;
    
  var _isLoading = true;
  var _sortConfig = {
    "bAutoWidth": false,
    "bDestroy": true,
    "bFilter": false,
    "bInfo": false,
    "bLengthChange": false,
    "bPaginate": false,
    "bSort": false,
    "sScrollY": "500px"	//Needed just to force table structure conducive to sorting.
  };
  var f_dataTableOptions = {
    destroy: true,
    searching: false,
    info: false,
    lengthChange: false,
    paging: false,
    ordering: false,
    scrollY: "500px",
    scrollCollapse: true
  };
  
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
      var currentIndex = 0;
        
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
    if (_isLoading || _isChain()) {
      _selectedIndex = $(".selected").index();

      RiseVision.Financial.Layout.loadLayout(_data.getNumberOfRows());
      
      RiseVision.Financial.Disclaimer.load();
      _initTable();
    }
  }

  function _initTable() {
    var numRows = _data.getNumberOfRows(),
      numCols = _data.getNumberOfColumns();
        
    //The table data can be removed and re-added only for a chain.
    //Individual stocks have to have their rows updated since it is possible for only some stocks to be returned
    //by the Data Server depending on collection times (e.g. one stock within collection time, another not).
    if (_isLoading || _isChain()) {
      if (!_isLoading) {
        // $(".dataTables_scrollBody").infiniteScroll.stop();
        $(".dataTables_scrollBody").data("plugin_autoScroll").stop();
      }
    
      //Add table headings.
      if (numCols > 0) {
        _addHeadings();
      }
        
      //Add table rows.
      for (var row = 0; row < numRows; row++) {
        if ($(".repeat").eq(row).length > 0) {
          _addRow(row, $(".repeat").eq(row));
        }
        else {
          _addRow(row, null);
        }
      }
    
      if (_selectedIndex !== -1) {
        $(".item").eq(_selectedIndex).addClass("selected");
      }
    }
    else {
      //Update rows.
      _updateRows();
    }
      
    _formatFields();    
      
    if (_isLoading || _isChain()) {
      _sortConfig.aoColumnDefs = [];
    
      //Use oSettings.aoColumns.sWidth for datatables to size columns.
      $.each(_additionalParams.columns, function(index, value) {
        if (value.width) {		
          _sortConfig.aoColumnDefs.push({
            "sWidth": value.width,
            "aTargets": [index]
          });
        }
      });

      $("#financial").dataTable(_sortConfig);

      //TODO: Try setting padding as part of _sortConfig to see if it prevents column alignment issues.
      //Row Padding
      $(".dataTables_scrollHead table thead tr th, td").css({
        "padding-top": _additionalParams.table.rowPadding / 2 + "px",
        "padding-bottom": _additionalParams.table.rowPadding / 2 + "px"
      });

      //Column Padding
      $("table thead tr th, td").css({ 
        "padding-left": _additionalParams.table.colPadding / 2 + "px",
        "padding-right": _additionalParams.table.colPadding / 2 + "px"
      });

      //First cell should have 10px of padding in front of it.
      $("table tr th:first-child, td:first-child").css({
        "padding-left": "10px"
      });

      //Last cell should have 10px of padding after it.
      $("table tr th:last-child, td:last-child").css({
        "padding-right": "10px"
      });

      //$(".dataTables_scrollBody").height(($("#container").outerHeight(true) - $("#disclaimer").height() - $(".dataTables_scrollHead").height()) / prefs.getInt("rsH") * 100 + "%");    
      $(".dataTables_scrollBody").height($("#container").outerHeight() - $("#disclaimer").outerHeight() - $(".dataTables_scrollHead").outerHeight() + "px");    
    }
      
    //Conditions
    $.each(_additionalParams.columns, function(index, value) {
      if (value.colorCondition === "change-up" || value.colorCondition === "change-down") {
        var results = _financial.compare(value.id);
          
        $.each(results, function(i, result) {
          var $cell = $("td." + value.id).eq(i);
          
          if (value.colorCondition === "change-up") {
            if (result === 1) {
              $cell.addClass("changeUpIncrease");
            }
            else if (result === -1) {
              $cell.addClass("changeUpDecrease");
            }
            else {
              $cell.removeClass("changeUpIncrease changeUpDecrease");
            }
          }
          else {
            if (result === 1) {
              $cell.addClass("changeDownIncrease");
            }
            else if (result === -1) {
              $cell.addClass("changeDownDecrease");
            }
            else {
              $cell.removeClass("changeDownIncrease changeDownDecrease");
            }
          }
        });
      }
      else if (value.colorCondition === "value-positive" || value.colorCondition === "value-negative") {
        var results = _financial.checkSigns(value.id);

        $.each(results, function(i, result) {
          var $cell = $("td." + value.id).eq(i);

          if (value.colorCondition === "value-positive") {
            //Positive or 0
            if (result === 1) {
              $cell.addClass("valuePositivePositive");
            }
            //Negative
            else {
              $cell.addClass("valuePositiveNegative");
            }
          }
          else {
            //Positive or 0
            if (result === 1) {
              $cell.addClass("valueNegativePositive");
            }
            //Negative
            else {
              $cell.addClass("valueNegativeNegative");
            }
          }
        });
      }
    });
      
    //Initialize scrolling after conditions so that when scrolling by page, the cloned items will show the conditions as well.
    if (_isLoading || _isChain()) {
      $(".dataTables_scrollBody").autoScroll(_additionalParams.scroll)
      .on("done", function() {
        _onLastItemScrolled.call();
      });
      // $(".dataTables_scrollBody").infiniteScroll({
      //   scrollBy: _additionalParams.scroll.by,
      //   direction: (_additionalParams.scroll.by === "none" ? _additionalParams.scroll.by : _SCROLL.DIRECTION),
      //   duration: _additionalParams.scroll.pause * 1000,
      //   speed: _additionalParams.scroll.speed,
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

  function _addHeadings() {
    var tr = document.createElement("tr");

    //Add headings for data.
    $.each(_additionalParams.columns, function(index, value) {
      var th = document.createElement("th");

      if (value.id === "logo") {
        th.setAttribute("class", "logo");
        $(th).html(value.headerText || "Logo");
      }
      else if (value.id === "instrument") {
        th.setAttribute("class", _data.getColumnId(0));
        $(th).html(value.headerText || _data.getColumnLabel(0));
      }
      else {
        th.setAttribute("class", _data.getColumnId(_financial.dataFields[value.id]));
        $(th).html(value.headerText || _data.getColumnLabel(_financial.dataFields[value.id]));	    
      }

      $(th).addClass("heading_font-style");	
      $(tr).append(th);
    });    

    $("#financial").prepend($("<thead>").append(tr));   
  }

  function _addRow(row, tr) {
    var logoIndex = -1,
    instruments,
    numCols = _data.getNumberOfColumns();

    if (_data.getFormattedValue(row, 0) === "INCORRECT_TYPE") {
      console.log("Chain could not be displayed. Please check that only one chain is being requested and that " +
        "chains are not being requested together with stocks.");
    }    
    else {
      if (tr === null) {
        tr = document.createElement("tr");
        tr.setAttribute("class", "item");
        tr.setAttribute("data-alias", _data.getFormattedValue(row, 0));
        tr.setAttribute("data-code", _data.getFormattedValue(row, _financial.dataFields["code"]));
      }
      else {
        tr.attr("data-alias", _data.getFormattedValue(row, 0));
        tr.attr("data-code", _data.getFormattedValue(row, _financial.dataFields["code"]));
      }

      //Add an event handler for when a row is clicked.		
      $(tr).on("click", function(event) {		
        $("tr").removeClass("selected");		
        $(this).addClass("selected");		
        gadgets.rpc.call("", "instrumentSelected", null, $(this).attr("data-code"));		
      });

      $.each(_additionalParams.columns, function(index, value) {
        var td = document.createElement("td");
        
        //Remember the position of the logo column.
        if (value.id === "logo") {
          logoIndex = index;
          td.setAttribute("class", "data_font-style logo");
          $(tr).append(td);
        }
        else if (value.id === "instrument") {
          td.setAttribute("class", "data_font-style " + _data.getColumnId(0));
          $(td).html(_data.getFormattedValue(row, 0));
          $(tr).append(td);
        }
        else {
          td.setAttribute("class", "data_font-style " + _data.getColumnId(_financial.dataFields[value.id]));
          $(td).html(_data.getFormattedValue(row, _financial.dataFields[value.id]));
          $(td).attr("data-value", _data.getFormattedValue(row, _financial.dataFields[value.id]));		//Issue 978
          $(tr).append(td);
        }
        
        //Add logo as background image last, so that we know what the height of the logo should be.
        if ((logoIndex !== -1) && (index === _additionalParams.columns.length - 1)) {
          td = $(tr).find("td").eq(logoIndex);
          td.attr("class", "data_font-style logo");

          if (_urls[row] !== null) {
            var $img = $("<img>");
            $img.attr("src", _urls[row]);
            $img.height(0);	//For now so that we can determine the true height of the row without taking the logo into account.
            $(td).append($img);
          }
          else {
            $(td).html(_data.getFormattedValue(row, _financial.dataFields["name"]));
          }
        }
      });

      if (_useDefault) {
        $("#financial").append(tr);
      }

      $(".logo img").height($(tr).height());

      //If this is a non-permissioned instrument, don"t request it again.
      if (_data.getFormattedValue(row, _financial.dataFields["name"]) === "N/P") {
        instruments = _additionalParams.instruments;
        instruments.splice(row, 1);
        _financial.setInstruments(instruments.join());
      }
    }
  }

  //Update the rows in place for all instruments returned by the data server.
  function _updateRows () {
    var $tr,
      newRows = [],
      numRows = _data.getNumberOfRows(),
      numCols = _data.getNumberOfColumns();

    //Try to find a match for each instrument in the table.
    for (var row = 0; row < numRows; row++) {
      $tr = $("tr[data-alias='" + _data.getFormattedValue(row, 0) + "']:first");

      //Issue 736, 755 - Unable to locate row as data-alias is ... or N/A. Find first ... or N/A and update that row.
      //Issue 978 - This could also occur if the request to the data server only returned a partial list of stocks because the
      //others were outside of their collection times.
      if ($tr.length === 0) {
        $tr = $("tr[data-alias='N/A']");	    

        if ($tr.length === 0) {
          $tr = $("tr[data-alias='...']");
        }

        if ($tr.length > 0) {	//Issue 978
          $tr.attr("data-alias", _data.getFormattedValue(row, 0));
          $tr.attr("data-code", _data.getFormattedValue(row, numCols - 1));
        }
      }

      //Update row.
      if ($tr.length > 0) {
        $.each(_additionalParams.columns, function(index, value) {
          var $td = $tr.find("." + value.id);

          //Update logo.
          if (value.id === "logo") {
            if (_urls[row] !== null) {
              var $img = $("<img>");
              $img.attr("src", _urls[row]);
              $img.height($tr.height());
              $td.find("div").append($img);
            }
            else {
              $td.html(_data.getFormattedValue(row, _financial.dataFields["name"]));
            }
          }
          else if (value.id === "instrument") {
            $td.html(_data.getFormattedValue(row, 0));
          }
          else {
            $td.html(_data.getFormattedValue(row, _financial.dataFields[value.id]));
            $td.attr("data-value", _data.getFormattedValue(row, _financial.dataFields[value.id]));	//Issue 978
          }	
        });
      }
    }
  }

  function _formatFields() {
    $.each(_additionalParams.columns, function(index, value) {
      if (value.id) {
        var $fields = $("td." + value.id),
          width;
        
        if ($fields.length > 0) {
          if (!$fields.hasClass("updated")) {
            if (_isLoading || _isChain()) {
              //Header Text
              if (value.header) {
                $("th").eq(index).html(value.header);
              }

              if (_isLoading) {
                if (value.width) {
                  width = parseInt(value.width);
                  width = width / _prefs.getInt("rsW") * 100 + "%";
                  value.width = width;
                }
              }

              $("th").eq(index).css("text-align", value.align);
            }
              
            $fields.css("text-align", value.align);
              
            //Decimals and Sign
            $fields.each(function(i) {
              var number, height;

              if ($(this).text() && !isNaN($(this).text())) {
                $(this).text(parseFloat($(this).text()).toFixed(value.decimals));
                
                //Issue 978 Start - The value in data-value is the true value together with its sign.
                number = $(this).attr("data-value");
                
                //If there is no old value, use the current value.
                if (!number) {
                  number = $(this).text();
                }
                //Issue 978 End
                
                if (value.sign === "none") {
                  $(this).html(_addCommas(Math.abs(number).toFixed(value.decimals)));
                }
                else if (value.sign === "neg") {
                  $(this).html(_addCommas(number));
                }
                else if (value.sign === "pos-neg") {
                  if (parseFloat(number) > 0) {
                    $(this).html("+" + _addCommas(number));
                  }
                }
                else if (value.sign === "bracket") {
                  if (parseFloat(number) < 0) {
                    $(this).html("(" + _addCommas(Math.abs(number).toFixed(value.decimals)) + ")");
                  }
                }
                //Add img tags to show arrows.
                else if (value.sign === "arrow") {
                  var $img = $("<img class='arrow'>");

                  $img.height($(this).height());

                  //Issue 708 - Eliminate - sign for negative numbers, add commas.
                  $(this).html(_addCommas(Math.abs(number).toFixed(value.decimals)));

                  if (parseFloat(number) < 0) {
                    $img.attr("src", config.LOGOS_URL + "animated-red-arrow.gif");				    				    			
                  }
                  else if (parseFloat(number) >= 0) {
                    $img.attr("src", config.LOGOS_URL + "animated-green-arrow.gif");
                  }

                  $(this).prepend($img);
                }
              }
            });
              
            //Keep track of which cells have been updated, as it"s possible that some cells may have been selected multiple times in the Gadget settings.			    
            $fields.addClass("updated");
          }
        }
      }
    });

    $("td").removeClass("updated");
  }

  function _addCommas(number) {
    number += "";
    var x = number.split(".");
    var x1 = x[0];
    var x2 = x.length > 1 ? "." + x[1] : "";
    var regex = /(\d+)(\d{3})/;

    while (regex.test(x1)) {
      x1 = x1.replace(regex, "$1" + "," + "$2");
    }

    return x1 + x2;
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