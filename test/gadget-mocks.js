
;(function(window) {
  
  var settings = {
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
          "highlightColor":"transparent",
          "align":"left"
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
  
  var rpc = function (methodName, callback, params) {
    if(methodName === "rscmd_saveSettings") {
      window.result.params = params.params;
      window.result.additionalParams = params.additionalParams;
      if(callback) {
        callback(params);
      }
      else{ return params; }
    }
    else if (methodName === "rscmd_getAdditionalParams"){
      if(callback) {
        callback(window.result.additionalParams);
      }
    }
    else if (methodName === "rsparam_get") {
      RiseVision.Financial.Table.setParams([
        "additionalParams", 
        "displayId", 
        "companyId"
      ], 
      [
        JSON.stringify(settings.additionalParams), 
        "displayId", 
        "companyId"
      ]);
    }
    else if (methodName === "rsevent_ready") {
      RiseVision.Financial.Table.play();
    }
    else {throw "Unknown method"; }
  };

  rpc.register = function (methodName, callback) {
  };

  window.result = {
    additionalParams: JSON.stringify(
      {}
    )};

  window.gadgets = {
    Prefs: function () {
      return {
        getString: function (value) {
          switch (value) {
            case "rsW": 
              return window.innerWidth;
            case "rsH": 
              return window.innerHeight;
          }
          return value;
        },
        getBool: function () {
          //TODO
          return false;
        },
        getInt: function () {
          //TODO
          return -1;
        }
      };
    },
    rpc: rpc
  };
  
})(window);
