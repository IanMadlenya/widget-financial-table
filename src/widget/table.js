/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

/* Functionality Start */
RiseVision.Common.Table = {};

RiseVision.Common.Table = function(additionalParams, financial, prefs) {

  // instance variable Financial (RiseVision.Common.Financial.RealTime)
  this._financial = financial;
  this._data = null;
  this._urls = [];
  
  this._prefs = prefs;

  this._additionalParams = additionalParams;
      
  this._isLoading = true;
  this._isChain = false;
  
  this._tableConfig = {
    autoWidth: false,
    destroy: true,
    searching: false,
    info: false,
    lengthChange: false,
    paging: false,
    ordering: false,
    scrollY: "500px",
    scrollCollapse: true
  };
  
  this._addCommas = function(number) {
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
  
  this._addHeadings = function() {
    var self = this;
    var tr = document.createElement("tr");

    //Add headings for data.
    $.each(this._additionalParams.columns, function(index, value) {
      var th = document.createElement("th");

      if (value.id === "logo") {
        th.setAttribute("class", "logo");
        $(th).html(value.headerText || "Logo");
      }
      else if (value.id === "instrument") {
        th.setAttribute("class", self._data.getColumnId(0));
        $(th).html(value.headerText || self._data.getColumnLabel(0));
      }
      else {
        th.setAttribute("class", self._data.getColumnId(self._financial.dataFields[value.id]));
        $(th).html(value.headerText || self._data.getColumnLabel(self._financial.dataFields[value.id]));	    
      }

      $(th).addClass("heading_font-style");	
      $(tr).append(th);
    });    

    $("#financial").prepend($("<thead>").append(tr));   
  };
  
  //Update the rows in place for all instruments returned by the data server.
  this._updateRows = function() {
    var self = this;
    var $tr,
      newRows = [],
      numRows = this._data.getNumberOfRows(),
      numCols = this._data.getNumberOfColumns();

    //Try to find a match for each instrument in the table.
    for (var row = 0; row < numRows; row++) {
      $tr = $("tr[data-alias='" + this._data.getFormattedValue(row, 0) + "']:first");

      //Issue 736, 755 - Unable to locate row as data-alias is ... or N/A. Find first ... or N/A and update that row.
      //Issue 978 - This could also occur if the request to the data server only returned a partial list of stocks because the
      //others were outside of their collection times.
      if ($tr.length === 0) {
        $tr = $("tr[data-alias='N/A']");	    

        if ($tr.length === 0) {
          $tr = $("tr[data-alias='...']");
        }

        if ($tr.length > 0) {	//Issue 978
          $tr.attr("data-alias", this._data.getFormattedValue(row, 0));
          $tr.attr("data-code", this._data.getFormattedValue(row, numCols - 1));
        }
      }

      //Update row.
      if ($tr.length > 0) {
        $.each(this._additionalParams.columns, function(index, value) {
          var $td = $tr.find("." + value.id);

          //Update logo.
          if (value.id === "logo") {
            if (self._urls[row] !== null) {
              var $img = $("<img>");
              $img.attr("src", self._urls[row]);
              $img.height($tr.height());
              $td.find("div").append($img);
            }
            else {
              $td.html(self._data.getFormattedValue(row, self._financial.dataFields["name"]));
            }
          }
          else if (value.id === "instrument") {
            $td.html(self._data.getFormattedValue(row, 0));
          }
          else {
            $td.html(self._data.getFormattedValue(row, self._financial.dataFields[value.id]));
            $td.attr("data-value", self._data.getFormattedValue(row, self._financial.dataFields[value.id]));	//Issue 978
          }	
        });
      }
    }
  };
  
  this._addRow = function(row, tr) {
    var self = this;
    var logoIndex = -1,
    instruments,
    numCols = this._data.getNumberOfColumns();
    var appendTr = false;

    if (this._data.getFormattedValue(row, 0) === "INCORRECT_TYPE") {
      console.log("Chain could not be displayed. Please check that only one chain is being requested and that " +
        "chains are not being requested together with stocks.");
    }    
    else {
      if (tr === null) {
        tr = document.createElement("tr");
        tr.setAttribute("class", "item");
        tr.setAttribute("data-alias", this._data.getFormattedValue(row, 0));
        tr.setAttribute("data-code", this._data.getFormattedValue(row, this._financial.dataFields["code"]));
        appendTr = true;
      }
      else {
        tr.attr("data-alias", this._data.getFormattedValue(row, 0));
        tr.attr("data-code", this._data.getFormattedValue(row, this._financial.dataFields["code"]));
      }

      //Add an event handler for when a row is clicked.		
      $(tr).on("click", function(event) {		
        $("tr").removeClass("selected");		
        $(this).addClass("selected");		
        gadgets.rpc.call("", "instrumentSelected", null, $(this).attr("data-code"));		
      });

      $.each(this._additionalParams.columns, function(index, value) {
        var td = document.createElement("td");
        
        //Remember the position of the logo column.
        if (value.id === "logo") {
          logoIndex = index;
          td.setAttribute("class", "data_font-style logo");
          $(tr).append(td);
        }
        else if (value.id === "instrument") {
          td.setAttribute("class", "data_font-style " + self._data.getColumnId(0));
          $(td).html(self._data.getFormattedValue(row, 0));
          $(tr).append(td);
        }
        else {
          td.setAttribute("class", "data_font-style " + self._data.getColumnId(self._financial.dataFields[value.id]));
          $(td).html(self._data.getFormattedValue(row, self._financial.dataFields[value.id]));
          $(td).attr("data-value", self._data.getFormattedValue(row, self._financial.dataFields[value.id]));		//Issue 978
          $(tr).append(td);
        }
        
        //Add logo as background image last, so that we know what the height of the logo should be.
        if ((logoIndex !== -1) && (index === self._additionalParams.columns.length - 1)) {
          td = $(tr).find("td").eq(logoIndex);
          td.attr("class", "data_font-style logo");

          if (self._urls[row] !== null) {
            var $img = $("<img>");
            $img.attr("src", self._urls[row]);
            $img.height(0);	//For now so that we can determine the true height of the row without taking the logo into account.
            $(td).append($img);
          }
          else {
            $(td).html(self._data.getFormattedValue(row, self._financial.dataFields["name"]));
          }
        }
      });

      if (appendTr) {
        $("#financial").append(tr);
      }

      $(".logo img").height($(tr).height());

      //If this is a non-permissioned instrument, don"t request it again.
      if (this._data.getFormattedValue(row, this._financial.dataFields["name"]) === "N/P") {
        instruments = this._additionalParams.instruments;
        instruments.splice(row, 1);
        this._financial.setInstruments(instruments.join());
      }
    }
  };
  
  this._formatFields = function() {
    var self = this;
    
    $.each(this._additionalParams.columns, function(index, value) {
      if (value.id) {
        var $fields = $("td." + value.id),
          width;

        if ($fields.length > 0) {
          if (!$fields.hasClass("updated")) {
           if (self._isLoading || self._isChain) {
             //Header Text
             if (value.header) {
               $("th").eq(index).html(value.header);
             }

             if (self._isLoading) {
               if (value.width) {
                 width = parseInt(value.width);
                 width = width / self._prefs.getInt("rsW") * 100 + "%";
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
                 $(this).html(self._addCommas(Math.abs(number).toFixed(value.decimals)));
               }
               else if (value.sign === "neg") {
                 $(this).html(self._addCommas(number));
               }
               else if (value.sign === "pos-neg") {
                 if (parseFloat(number) > 0) {
                   $(this).html("+" + self._addCommas(number));
                 }
               }
               else if (value.sign === "bracket") {
                 if (parseFloat(number) < 0) {
                   $(this).html("(" + self._addCommas(Math.abs(number).toFixed(value.decimals)) + ")");
                 }
               }
               //Add img tags to show arrows.
               else if (value.sign === "arrow") {
                 var $img = $("<img class='arrow'>");

                 $img.height($(this).height());

                 //Issue 708 - Eliminate - sign for negative numbers, add commas.
                 $(this).html(self._addCommas(Math.abs(number).toFixed(value.decimals)));

                 if (parseFloat(number) < 0) {
                   $img.attr("src", FINANCIAL_TABLE_CONFIG.LOGOS_URL + "animated-red-arrow.gif");				    				    			
                 }
                 else if (parseFloat(number) >= 0) {
                   $img.attr("src", FINANCIAL_TABLE_CONFIG.LOGOS_URL + "animated-green-arrow.gif");
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
};

RiseVision.Common.Table.prototype.getInstrument = function(index) {
  $("tr").removeClass("selected");		
  $(".item").eq(index).addClass("selected");
  
  return $(".item").eq(index).attr("data-code");
};

RiseVision.Common.Table.prototype.initTable = function(data, urls, isLoading, isChain, selectedIndex) {
  var self = this;
  
  this._data = data;
  this._urls = urls;
  this._isLoading = isLoading;
  this._isChain = isChain;
  
  var numRows = this._data.getNumberOfRows(),
    numCols = this._data.getNumberOfColumns();
      
  //The table data can be removed and re-added only for a chain.
  //Individual stocks have to have their rows updated since it is possible for only some stocks to be returned
  //by the Data Server depending on collection times (e.g. one stock within collection time, another not).
  if (this._isLoading || this._isChain) {  
    //Add table headings.
    if (numCols > 0) {
      this._addHeadings();
    }
      
    //Add table rows.
    for (var row = 0; row < numRows; row++) {
      if ($(".repeat").eq(row).length > 0) {
        this._addRow(row, $(".repeat").eq(row));
      }
      else {
        this._addRow(row, null);
      }
    }
  
    if (selectedIndex !== -1) {
      $(".item").eq(selectedIndex).addClass("selected");
    }
  }
  else {
    //Update rows.
    this.updateRows();
  }
    
  this._formatFields();    
    
  if (this._isLoading || this._isChain) {
    this._tableConfig.columnDefs = [];
  
    //Use oSettings.aoColumns.sWidth for datatables to size columns.
    $.each(this._additionalParams.columns, function(index, value) {
      if (value.width) {		
        self._tableConfig.columnDefs.push({
          "width": value.width,
          "targets": [index]
        });
      }
    });

    $("#financial").dataTable(this._tableConfig);

    //TODO: Try setting padding as part of _sortConfig to see if it prevents column alignment issues.
    //Row Padding
    $(".dataTables_scrollHead table thead tr th, td").css({
      "padding-top": this._additionalParams.table.rowPadding / 2 + "px",
      "padding-bottom": this._additionalParams.table.rowPadding / 2 + "px"
    });

    //Column Padding
    $("table thead tr th, td").css({ 
      "padding-left": this._additionalParams.table.colPadding / 2 + "px",
      "padding-right": this._additionalParams.table.colPadding / 2 + "px"
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
  $.each(this._additionalParams.columns, function(index, value) {
    if (value.colorCondition === "change-up" || value.colorCondition === "change-down") {
      var results = self._financial.compare(value.id);
        
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
      var results = self._financial.checkSigns(value.id);

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
};

