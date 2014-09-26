/* global gadgets */

var prefs = new gadgets.Prefs(),
// global variable financial (RiseVision.Financial)
financial = null;

function play() {
  if (financial !== null) {
    financial.play();
  }
}

function pause() {
  if (financial !== null) {
    financial.pause();
  }
}

function stop() {
  if (financial !== null) {
    financial.pause();
  }
}

// sends "READY" event to the Viewer
function readyEvent() {
  gadgets.rpc.call("", "rsevent_ready", null, prefs.getString("id"), true, true, true, true, true);
}

// sends "DONE" event to the Viewer
function doneEvent() {
  gadgets.rpc.call("", "rsevent_done", null, prefs.getString("id"));
}

$(document).ready(function() {
  var id = prefs.getString("id");
  financial = new RiseVision.Financial();

  gadgets.rpc.register("rscmd_getInstrument", function(index) {
    return financial.getInstrument.call(financial, index);
  });

  if (id && id !== "") {
    gadgets.rpc.register("rscmd_play_" + id, play);
    gadgets.rpc.register("rscmd_pause_" + id, pause);
    gadgets.rpc.register("rscmd_stop_" + id, stop);
    gadgets.rpc.register("rsparam_set_" + id, financial.setParams);
    // requesting all params at once
    gadgets.rpc.call("", "rsparam_get", null, id, ["additionalParams", "displayId", "companyId"]);
  }
});

/* Primary functionality for the Financial Gadget. */
var RiseVision = RiseVision || {};

/* Functionality Start */
RiseVision.Financial = {};

RiseVision.Financial = function() {
  this.SCROLL = {
    DIRECTION: "down",
    RESUMES: 5
  };
  this.disclaimerLoc = "bottomRight";
  
  this.displayId = "";
  this.companyId = "";
  this.isAuthorized = true;
  
  // instance variable Financial (RiseVision.Common.Financial.RealTime)
  this.financial = null;
  
  this.additionalParams = null;
    
  this.logosURL = "https://s3.amazonaws.com/risecontentlogos/financial/";
  this.hasLogos = false;
  this.hasLastItemScrolled = false;
  this.updateInterval = 60000;
  this.selectedIndex = -1;
    
  this.isLoading = true;
  this.sortConfig = {
  	"bAutoWidth": false,
  	"bDestroy": true,
  	"bFilter": false,
  	"bInfo": false,
  	"bLengthChange": false,
  	"bPaginate": false,
  	"bSort": false,
  	"sScrollY": "500px"	//Needed just to force table structure conducive to sorting.
  };
  
  function getTextNode(font, name) {
    return document.createTextNode("." + name + "{" +
    "font-family: " + font.font.family + ";" +
    "font-size: " + font.size + "px" + ";" +
    "font-weight: " + (font.bold ? "bold" : "normal") + ";" +
    "font-style: " + (font.italic ? "italic" : "normal") + ";" +
    "text-decoration: " + (font.underline ? "underline" : "none") + ";" +
    "}");
  }
  
  this.appendStyle = function() {
    var styleNode = document.createElement("style");
    
    if (this.additionalParams && this.additionalParams.table) {
      //Inject CSS font styles into the DOM.
      styleNode.appendChild(getTextNode(this.additionalParams.table.colHeaderFont, "heading_font-style"));
      styleNode.appendChild(getTextNode(this.additionalParams.table.dataFont, "data_font-style"));
      styleNode.appendChild(getTextNode(this.additionalParams.disclaimer.font, "disclaimer_font-style"));
      styleNode.appendChild(document.createTextNode(".dataTable .even{background-color:" + this.additionalParams.table.rowColor + ";}"));
      styleNode.appendChild(document.createTextNode(".dataTable .odd{background-color:" + this.additionalParams.table.altRowColor + ";}"));
      // styleNode.appendChild(document.createTextNode(".selected{background-color:" + this.additionalParams.table.selectedColor + ";}"));
      document.getElementsByTagName("head")[0].appendChild(styleNode);
    }
  }
};

RiseVision.Financial.prototype.getInstrument = function(index) {
  $("tr").removeClass("selected");		
  $(".item").eq(index).addClass("selected");
  
  return $(".item").eq(index).attr("data-code");
};

/*
 * Keep track of previously unrequested instruments, particularly in a chain.
 * This list is made available via an RPC call.
 */
RiseVision.Financial.prototype.checkInstruments = function(includeAll) {
  var self = this,
    instruments = [],
    unrequested = [],
    numRows = this.data.getNumberOfRows();
	
  if (includeAll) {
    this.requested = [];
  }

  for (var row = 0; row < numRows; row++) {
    instruments.push(this.data.getFormattedValue(row, this.financial.dataFields["code"]));
  }
    
  //Find all symbols in "instruments" that are not already in "this.requested".
  unrequested = $.grep(instruments, function(el) {
    return $.inArray(el, self.requested) === -1;
  });

  for (var i = 0; i < unrequested.length; i++) {
  	this.requested.push(unrequested[i]);
  }
  
  if (unrequested.length > 0) {
    gadgets.rpc.call("", "instrumentsChanged", null, this.displayId, unrequested);
  }
    
  if (includeAll) {
    //Every 24 hours, pass a list of all instruments to any listeners.
    setTimeout(function() {
      self.checkInstruments(true);
    }, 24 * 60 * 60 * 1000);
  }
};

RiseVision.Financial.prototype.setParams = function(name, value) {
  if (name[0] && name[0] === "additionalParams" && value[0]) {
  	var currentIndex = 0;
      
    financial.additionalParams = JSON.parse(value[0]);
    
    var bgColor = financial.additionalParams.background.color;

    if (bgColor && bgColor !== "") {
      document.body.style.background = bgColor;
    }
    
    financial.appendStyle();
    
    //Gadget settings
    // financial.useDefault = prefs.getBool("useDefault");

    // Use fixed layout
    // financial.layoutURL = "/Layouts/Table.xml";
    financial.layoutURL = "https://s3.amazonaws.com/Widget-Financial-Table/0.1.0/Layouts/Table.xml";
    // if (financial.useDefault) {
    //   financial.layoutURL = "";
    // }
    // else {	
    //   financial.layoutURL = prefs.getString("layoutURL");
    // }

    // financial.instruments = financial.additionalParams.instruments;
    
    //Determine what columns will need to be requested from the data source.
    //Instrument is always returned.
    financial.requestedFields = [];
    
    $.each(financial.additionalParams.columns, function(index, value) {
    	if ((value.id === "name" ) || (value.id === "logo") || (value.id === "instrument") || (value.id === "arrow")) {
        
      }	//Issue 853
    	else {
  	    financial.requestedFields.push(value.id);
    	}
    });
      
    financial.requestedFields.push("code");
    financial.requestedFields.push("name");	//Issue 853
    
    $.each(financial.additionalParams.columns, function(index, value) {				
    	if (value.id === "logo") {
    	    financial.hasLogos = true;		    
    	    return false;
    	}	    
    });
  }
  
  if (name[1] && name[1] === "displayId") {
    financial.displayId = value[1];
  }
  
  if (name[2] && name[2] === "companyId") {
    financial.companyId = value[2];
  }
  
  financial.init();
};

RiseVision.Financial.prototype.init = function() {
  var self = this,
    params = {};
	
  this.financial = new RiseVision.Common.Financial.RealTime(this.displayId, this.additionalParams.instruments);
    
  if (this.useDefault) {
    this.getData();
    this.authorize();
  }
  else {
    //Load custom layout.
    if (this.layoutURL) {
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;	
      gadgets.io.makeRequest(this.layoutURL, function(obj) {
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

        self.layout = data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue;
        
        self.getData();
        self.authorize();
      }, params);
    }
  }
};

RiseVision.Financial.prototype.authorize = function() {
  var self = this;
  var productCode = FINANCIAL_TABLE_CONFIG.PRODUCT_CODE;
  var auth = new RiseVision.Common.Store.Auth();
  
  if (this.displayId) {
    auth.checkForDisplay(this.displayId, productCode, function(authorized) {
        self.isAuthorized = authorized;
    });
  }
  else if (this.companyId) {
    auth.checkForCompany(this.companyId, productCode, function(authorized) {
      self.isAuthorized = authorized;
    });
  }
  else {
    self.isAuthorized = false;
  }
};

RiseVision.Financial.prototype.getData = function() {
  var self = this;

  if (this.isAuthorized) {
    this.financial.getData(this.requestedFields, this.hasLogos, this.isChain(), function(data, urls) {
      if (data) {
        self.data = data;
        self.urls = urls;
        self.arrowCount = 0;
        
        //Temporarily size the Gadget using the UserPrefs. Workaround for multi-page Presentation issue.
        $("#container").width(prefs.getString("rsW"));
        $("#container").height(prefs.getString("rsH"));
        
        if (self.isLoading) {
          self.loadArrow(self.logosURL + "animated-green-arrow.gif");
          self.loadArrow(self.logosURL + "animated-red-arrow.gif");
        }
        else {
          //Only chains could potentially contain different instruments.
          if (self.isChain()) {
              self.checkInstruments(false);
          }

          if (self.layoutURL) {
              self.showCustomLayout();
          }
          else {
              self.showDefaultLayout();
          }
        }
      }
      else {
        self.startTimer();
      }
    });
  }
  else {
    this.startTimer();
  }
};

RiseVision.Financial.prototype.loadArrow = function(url) {
  var self = this,
  img = new Image();

  img.onload = function() {
    self.onArrowLoaded();
  };

  img.onerror = function() {
    self.onArrowLoaded();
  };

  img.src = url;
};

RiseVision.Financial.prototype.onArrowLoaded = function() {
  this.arrowCount++;

  if (this.arrowCount === 2) {
    if (this.layoutURL) {
      this.showCustomLayout();
    }
    else {
      this.showDefaultLayout();
    }
  }
};

RiseVision.Financial.prototype.showDefaultLayout = function() {
  var disclaimer = null,
    table = null;

  if (this.isLoading || this.isChain()) {
    this.selectedIndex = $(".selected").index();

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

  this.initTable();
};

/* Custom layout may or may not be a table. Need to account for both possibilities. */
RiseVision.Financial.prototype.showCustomLayout = function() {
  var numRows = 0;

  if (this.isLoading || this.isChain()) {
    numRows = this.data.getNumberOfRows();

    $("#container").empty();
    $("#container").append(this.layout);

    for (var row = 0; row < numRows; row++) {
      var parent = $(".repeat:first").parent();
      
      if (row > 0) {
        $(parent).append($(".repeat:first").clone());
      }
    }
  }

  this.initTable();
};

RiseVision.Financial.prototype.initTable = function() {
  var self = this,
  	numRows = this.data.getNumberOfRows(),
  	numCols = this.data.getNumberOfColumns();
      
  //The table data can be removed and re-added only for a chain.
  //Individual stocks have to have their rows updated since it is possible for only some stocks to be returned
  //by the Data Server depending on collection times (e.g. one stock within collection time, another not).
  if (this.isLoading || this.isChain()) {
  	if (!this.isLoading) {
	    $(".dataTables_scrollBody").infiniteScroll.stop();
  	}
	
  	//Add table headings.
  	if (numCols > 0) {
	    this.addHeadings();
  	}
      
  	//Add table rows.
  	for (var row = 0; row < numRows; row++) {
	    if ($(".repeat").eq(row).length > 0) {
        this.addRow(row, $(".repeat").eq(row));
	    }
	    else {
        this.addRow(row, null);
	    }
  	}
	
  	if (this.selectedIndex !== -1) {
      $(".item").eq(this.selectedIndex).addClass("selected");
  	}
  }
  else {
  	//Update rows.
  	this.updateRows();
  }
    
  this.formatFields();    
    
  if (this.isLoading || this.isChain()) {
    this.sortConfig.aoColumnDefs = [];
	
    //Use oSettings.aoColumns.sWidth for datatables to size columns.
    $.each(this.additionalParams.columns, function(index, value) {
      if (value.width) {		
        self.sortConfig.aoColumnDefs.push({
          "sWidth": value.width,
          "aTargets": [index]
        });
      }
    });

    $("#financial").dataTable(this.sortConfig);

    //TODO: Try setting padding as part of this.sortConfig to see if it prevents column alignment issues.
    //Row Padding
    $(".dataTables_scrollHead table thead tr th, td").css({
      "padding-top": this.additionalParams.table.rowPadding / 2 + "px",
      "padding-bottom": this.additionalParams.table.rowPadding / 2 + "px"
    });

    //Column Padding
    $("table thead tr th, td").css({ 
      "padding-left": this.additionalParams.table.colPadding / 2 + "px",
      "padding-right": this.additionalParams.table.colPadding / 2 + "px"
    });

    //First cell should have 10px of padding in front of it.
    $("table tr th:first-child, td:first-child").css({
      "padding-left": "10px"
    });

    //Last cell should have 10px of padding after it.
    $("table tr th:last-child, td:last-child").css({
      "padding-right": "10px"
    });

    //Configure disclaimer.
    $("#disclaimer").text("Market Data by Thomson Reuters - Delayed 20 Minutes");
    $("#disclaimer").addClass("disclaimer_font-style");
    $("#disclaimer").addClass("default");

    if ((this.disclaimerLoc === "bottomRight") || (this.disclaimerLoc === "bottomLeft")) {	
      $("#disclaimer").addClass("bottom");

      if (this.disclaimerLoc === "bottomRight") {
        $("#disclaimer").addClass("right");
      }
    }
    else {
      $("#container").addClass("fullScreen");	
      $("#disclaimer").addClass("top");
      
      if (this.disclaimerLoc === "topRight") {
        $("#disclaimer").addClass("right");
      }
    }

    //$(".dataTables_scrollBody").height(($("#container").outerHeight(true) - $("#disclaimer").height() - $(".dataTables_scrollHead").height()) / prefs.getInt("rsH") * 100 + "%");    
    $(".dataTables_scrollBody").height($("#container").outerHeight() - $("#disclaimer").outerHeight() - $(".dataTables_scrollHead").outerHeight() + "px");    
  }
    
  //Conditions
  $.each(this.additionalParams.columns, function(index, value) {
    if (value.condition === "changeUp" || value.condition === "changeDown") {
      var results = self.financial.compare(value.id);
        
      $.each(results, function(i, result) {
        var $cell = $("td." + value.id).eq(i);
        
        if (value.condition === "changeUp") {
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
    else if (value.condition === "valuePositive" || value.condition === "valueNegative") {
      var results = self.financial.checkSigns(value.id);

      $.each(results, function(i, result) {
        var $cell = $("td." + value.id).eq(i);

        if (value.condition === "valuePositive") {
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
  if (this.isLoading || this.isChain()) {
    $(".dataTables_scrollBody").infiniteScroll({
      scrollBy: self.additionalParams.scroll.by,
      direction: (self.additionalParams.scroll.by === "none" ? self.additionalParams.scroll.by : self.SCROLL.DIRECTION),
      duration: self.additionalParams.scroll.pause * 1000,
      speed: self.additionalParams.scroll.speed,
      swipingTimeout: self.SCROLL.RESUMES * 1000,
      toggleOddEven: true
    })
    .bind("onLastItemScrolled", function(event) {
      self.onLastItemScrolled.call(self, event);
    });
  }

  //Size container back to its original dimensions.
  $("#container").width("100%");
  $("#container").height("95%");

  if (this.isLoading) {
    this.isLoading = false;
    readyEvent();

    this.checkInstruments(true);
  }
  else {
    $(".dataTables_scrollBody").infiniteScroll.start();
  }
    
  this.startTimer();
};

RiseVision.Financial.prototype.addHeadings = function() {
  var self = this,
    tr = document.createElement("tr");

  //Add headings for data.
  $.each(this.additionalParams.columns, function(index, value) {
    var th = document.createElement("th");

    if (value.id === "logo") {
      th.setAttribute("class", "logo");
      $(th).html("Logo");
    }
    else if (value.id === "instrument") {
      th.setAttribute("class", self.data.getColumnId(0));
      $(th).html(self.data.getColumnLabel(0));
    }
    else {
      th.setAttribute("class", self.data.getColumnId(self.financial.dataFields[value.id]));
      $(th).html(self.data.getColumnLabel(self.financial.dataFields[value.id]));	    
    }

    $(th).addClass("heading_font-style");	
    $(tr).append(th);
  });    

  $("#financial").prepend($("<thead>").append(tr));   
};

RiseVision.Financial.prototype.addRow = function(row, tr) {
  var self = this,
  logoIndex = -1,
  instruments,
  numCols = this.data.getNumberOfColumns();

  if (this.data.getFormattedValue(row, 0) === "INCORRECT_TYPE") {
    console.log("Chain could not be displayed. Please check that only one chain is being requested and that " +
      "chains are not being requested together with stocks.");
  }    
  else {
    if (tr === null) {
      tr = document.createElement("tr");
      tr.setAttribute("class", "item");
      tr.setAttribute("data-alias", this.data.getFormattedValue(row, 0));
      tr.setAttribute("data-code", this.data.getFormattedValue(row, this.financial.dataFields["code"]));
    }
    else {
      tr.attr("data-alias", this.data.getFormattedValue(row, 0));
      tr.attr("data-code", this.data.getFormattedValue(row, this.financial.dataFields["code"]));
    }

    //Add an event handler for when a row is clicked.		
    $(tr).on("click", function(event) {		
      $("tr").removeClass("selected");		
      $(this).addClass("selected");		
      gadgets.rpc.call("", "instrumentSelected", null, $(this).attr("data-code"));		
    });

    $.each(this.additionalParams.columns, function(index, value) {
      var td = document.createElement("td");
      
      //Remember the position of the logo column.
      if (value.id === "logo") {
        logoIndex = index;		
      }
      else if (value.id === "instrument") {
        td.setAttribute("class", "data_font-style " + self.data.getColumnId((0)));
        $(td).html(self.data.getFormattedValue(row, 0));
        $(tr).append(td);
      }
      else {
        td.setAttribute("class", "data_font-style " + self.data.getColumnId(self.financial.dataFields[value.id]));
        $(td).html(self.data.getFormattedValue(row, self.financial.dataFields[value.id]));
        $(td).attr("data-value", self.data.getFormattedValue(row, self.financial.dataFields[value.id]));		//Issue 978
        $(tr).append(td);
      }
      
      //Add logo as background image last, so that we know what the height of the logo should be.
      if ((logoIndex !== -1) && (index === self.additionalParams.columns.length - 1)) {
        td = document.createElement("td");
        td.setAttribute("class", "data_font-style logo");

        if (self.urls[row] !== null) {
          var $img = $("<img>");
          $img.attr("src", self.urls[row]);
          $img.height(0);	//For now so that we can determine the true height of the row without taking the logo into account.
          $(td).append($img);
        }
        else {
          $(td).html(self.data.getFormattedValue(row, self.financial.dataFields["name"]));
        }

        $(tr).find("td").eq(logoIndex).before(td);
      }
    });

    if (this.useDefault) {
      $("#financial").append(tr);
    }

    $(".logo img").height($(tr).height());

    //If this is a non-permissioned instrument, don"t request it again.
    if (this.data.getFormattedValue(row, self.financial.dataFields["name"]) === "N/P") {
      instruments = this.additionalParams.instruments;
      instruments.splice(row, 1);
      this.financial.setInstruments(instruments.join());
    }
  }
};

//Update the rows in place for all instruments returned by the data server.
RiseVision.Financial.prototype.updateRows = function () {
  var $tr,
    self = this,
    newRows = [],
    numRows = this.data.getNumberOfRows(),
    numCols = this.data.getNumberOfColumns();

  //Try to find a match for each instrument in the table.
  for (var row = 0; row < numRows; row++) {
    $tr = $("tr[data-alias='" + this.data.getFormattedValue(row, 0) + "']:first");

    //Issue 736, 755 - Unable to locate row as data-alias is ... or N/A. Find first ... or N/A and update that row.
    //Issue 978 - This could also occur if the request to the data server only returned a partial list of stocks because the
    //others were outside of their collection times.
    if ($tr.length === 0) {
      $tr = $("tr[data-alias='N/A']");	    

      if ($tr.length === 0) {
        $tr = $("tr[data-alias='...']");
      }

      if ($tr.length > 0) {	//Issue 978
        $tr.attr("data-alias", this.data.getFormattedValue(row, 0));
        $tr.attr("data-code", this.data.getFormattedValue(row, numCols - 1));
      }
    }

    //Update row.
    if ($tr.length > 0) {
      $.each(this.additionalParams.columns, function(index, value) {
        var $td = $tr.find("." + value.id);

        //Update logo.
        if (value.id === "logo") {
          if (self.urls[row] !== null) {
            var $img = $("<img>");
            $img.attr("src", self.urls[row]);
            $img.height($tr.height());
            $td.find("div").append($img);
          }
          else {
            $td.html(self.data.getFormattedValue(row, self.financial.dataFields["name"]));
          }
        }
        else if (value.id === "instrument") {
          $td.html(self.data.getFormattedValue(row, 0));
        }
        else {
          $td.html(self.data.getFormattedValue(row, self.financial.dataFields[value.id]));
          $td.attr("data-value", self.data.getFormattedValue(row, self.financial.dataFields[value.id]));	//Issue 978
        }	
      });
    }
  }
};

RiseVision.Financial.prototype.formatFields = function() {
  var self = this;

  $.each(this.additionalParams.columns, function(index, value) {
    if (value.id) {
      var $fields = $("td." + value.id),
        width;
      
      if ($fields.length > 0) {
        if (!$fields.hasClass("updated")) {
          if (self.isLoading || self.isChain()) {
            //Header Text
            if (value.header) {
              $("th").eq(index).html(value.header);
            }

            if (self.isLoading) {
              if (value.width) {
                width = parseInt(value.width);
                width = width / prefs.getInt("rsW") * 100 + "%";
                value.width = width;
              }
            }

            $("th").eq(index).css("text-align", value.alignment);
          }
            
          $fields.css("text-align", value.alignment);
            
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
                $(this).html(self.addCommas(Math.abs(number).toFixed(value.decimals)));
              }
              else if (value.sign === "minus") {
                $(this).html(self.addCommas(number));
              }
              else if (value.sign === "plusMinus") {
                if (parseFloat(number) > 0) {
                  $(this).html("+" + self.addCommas(number));
                }
              }
              else if (value.sign === "parentheses") {
                if (parseFloat(number) < 0) {
                  $(this).html("(" + self.addCommas(Math.abs(number).toFixed(value.decimals)) + ")");
                }
              }
              //Add img tags to show arrows.
              else if (value.sign === "arrow") {
                var $img = $("<img class='arrow'>");

                $img.height($(this).height());

                //Issue 708 - Eliminate - sign for negative numbers, add commas.
                $(this).html(self.addCommas(Math.abs(number).toFixed(value.decimals)));

                if (parseFloat(number) < 0) {
                  $img.attr("src", self.logosURL + "animated-red-arrow.gif");				    				    			
                }
                else if (parseFloat(number) >= 0) {
                  $img.attr("src", self.logosURL + "animated-green-arrow.gif");
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
};

RiseVision.Financial.prototype.addCommas = function(number)
{
  number += "";
  var x = number.split(".");
  var x1 = x[0];
  var x2 = x.length > 1 ? "." + x[1] : "";
  var regex = /(\d+)(\d{3})/;

  while (regex.test(x1)) {
    x1 = x1.replace(regex, "$1" + "," + "$2");
  }

  return x1 + x2;
};

RiseVision.Financial.prototype.onLastItemScrolled = function(e) {
  if (this.scrollBy !== "page") {
    doneEvent();
  }

  if (this.checkForUpdates) {
    if (this.scrollBy === "page") {
      //$(".dataTables_scrollBody").infiniteScroll.stop();
      this.checkForUpdates = false;
      this.getData();
    }
    else {	    
      this.checkForUpdates = false;
      this.getData();
    }
  }
};

RiseVision.Financial.prototype.startTimer = function() {
  var self = this;

  setTimeout(function() {
    //If we"re not scrolling, or there is not enough content to scroll, check for updates right away.
    if ((self.additionalParams.scroll.by === "none") || (!$(".dataTables_scrollBody").infiniteScroll.canScroll())) {
      self.getData();
    }
    else {
      self.checkForUpdates = true;
    }
  }, this.updateInterval);
};

RiseVision.Financial.prototype.isChain = function() {
  var instruments = this.additionalParams.instruments;

  //This is a chain if there is only one instrument being requested, but multiple rows of data are returned.
  if (this.data !== null) {
    return instruments.length === 1 && this.data.getNumberOfRows() > 1;
  }
  else {
    return false;
  }
};

RiseVision.Financial.prototype.play = function() {
  $(".dataTables_scrollBody").infiniteScroll.start();   
};

RiseVision.Financial.prototype.pause = function() {
  $(".dataTables_scrollBody").infiniteScroll.pause();	
};