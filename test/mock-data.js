;(function(window) {
    
  window.gadget = window.gadget || {};
  
  window.gadget.settings = {
    "params": {
    },
    "additionalParams": {
      "instruments": [
        "AA.N",
        "AXP.N",
        "BA.N",
        "BAC.N",
        "CAT.N",
        "CSCO.O",
        "CVX.N",
        "DD.N",
        "DIS.N",
        "GE.N",
        "HD.N",
        "HPQ.N",
        "IBM.N",
        "INTC.O",
        "JNJ.N",
        "JPM.N",
        "KO.N",
        "KRFT.O",
        "MCD.N",
        "MMM.N",
        "MRK.N",
        "MSFT.O",
        "PFE.N",
        "PG.N",
        "T.N",
        "TRV.N",
        "UTX.N",
        "VZ.N",
        "WMT.N",
        "XOM.N"
      ],
      "scroll": {
        "by":"none",
        "speed":"medium",
        "pause":5
      },
      "table": {
        "colHeaderFont": {
          "font": {
            "family":"Verdana"
          },
          "size":"20",
          "bold":false,
          "italic":false,
          "underline":false,
          "color":"black",
          "highlightColor":"transparent"
        },
        "dataFont": {
          "font": {
            "family":"Verdana"
          },
          "size":"20",
          "bold":false,
          "italic":false,
          "underline":false,
          "color":"black",
          "highlightColor":"transparent"
        },
        "rowColor":"transparent",
        "altRowColor":"transparent",
        "rowPadding":"0"
      },
      "columns": [{
          "id":"instrument",
          "type":"text",
          "name":"columns.instrument",
          "align":"left",
          "width":100
        },
        {
          "id":"logo",
          "type":"text",
          "name":"columns.instrument-logo",
          "align":"left",
          "width":100
        }
      ],
      "disclaimer": {
        "font": {
          "size":"9",
          "italic":true,
          "align":"right",
          "font": {
            "type":"standard",
            "name":"Verdana",
            "family":"Verdana"
          },
          "bold":false,
          "underline":false,
          "color":"black",
          "highlightColor":"transparent"
        }
      },
      "background": {
        "color": "transparent"
      }
    }
  };
  
  window.gadget.data = {
    cols: [
      {"id":"instrument","label":"Instrument","type":"string","pattern":""},
      {"id":"code","label":"Symbol Code","type":"string","pattern":""},
      {"id":"name","label":"Name","type":"string","pattern":""},
      {"id":"startTime","label":"Collection Start Time","type":"datetime","pattern":""},
      {"id":"endTime","label":"Collection End Time","type":"datetime","pattern":""},
      {"id":"daysOfWeek","label":"Collection Days of Week","type":"string","pattern":""},
      {"id":"timeZoneOffset","label":"Collection Time Zone Offset","type":"string","pattern":""}
    ],
    rows: [
      ["AA", "AA.N", "ALCOA", new Date(2014,9,15,9,30,0), new Date(2014,9,15,16,30,0), "1,2,3,4,5", "-0400"],
      ["AXP", "AXP.N", "AMERICAN EXPRESS INC", new Date(2014,9,15,9,30,0), new Date(2014,9,15,16,30,0), "1,2,3,4,5", "-0400"],
      ["BA", "BA.N", "BOEING CO", new Date(2014,9,15,9,30,0), new Date(2014,9,15,16,30,0), "1,2,3,4,5", "-0400"],
      ["BAC", "BAC.N", "BANK OF AMERICA CORP", new Date(2014,9,15,9,30,0), new Date(2014,9,15,16,30,0), "1,2,3,4,5", "-0400"],
      ["CAT", "CAT.N", "CATERPILLAR INC", new Date(2014,9,15,9,30,0), new Date(2014,9,15,16,30,0), "1,2,3,4,5", "-0400"],
      ["CSCO", "CSCO.O", "CISCO SYSTEMS", new Date(2014,9,15,9,30,0), new Date(2014,9,15,16,30,0), "1,2,3,4,5", "-0400"]
    ]
  };

})(window);

var $ = $ || {};

$.ajax = function(prefs) {
  if (prefs && prefs.url) {
    if (prefs.url.indexOf("displayId") > -1) {
      var data = {authorized:false};
      var textStatus = "OK";
      prefs.success(data, textStatus);
    }
    else if (prefs.url.indexOf("Layout")){
      
    }
  }
  
  return {
    done: function(callback) {
      var xmlhttp;
      xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", "layouts/table.xml", false); 
      xmlhttp.send(); 
      var xmlDoc = xmlhttp.responseXML;
      callback(xmlDoc);
    }
    
  };
};

var _image = function() {
  this.onload = null;
  this.onerror = null;
  this.src = null;
  var that = this;
  setTimeout(function() { 
    if (that.onload)
      that.onload(); 
  }, 10);
};

window.Image = _image;
