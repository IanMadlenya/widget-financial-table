(function (window){
  "use strict";

  if (typeof window.google === "undefined") {
    window.google = {};
  }
  
  window.google = {
    load: function(type, retries, params) {
      if (params && params.callback) {
        params.callback();
      }
    }
  };

  window.google.visualization = {
    Query: function (url, options) {
      var queryInstance = {
        abort: function () {},
        setRefreshInterval: function (seconds) {},
        setTimeout: function (seconds) {},
        setQuery: function (str) {},
        send: function (callback) {
          if (callback) {
            var queryResponseInstance = {
              getDataTable: function () {
                  
                var cols = [
                  {"id":"instrument","label":"Instrument","type":"string","pattern":""},
                  {"id":"code","label":"Symbol Code","type":"string","pattern":""},
                  {"id":"name","label":"Name","type":"string","pattern":""},
                  {"id":"startTime","label":"Collection Start Time","type":"datetime","pattern":""},
                  {"id":"endTime","label":"Collection End Time","type":"datetime","pattern":""},
                  {"id":"daysOfWeek","label":"Collection Days of Week","type":"string","pattern":""},
                  {"id":"timeZoneOffset","label":"Collection Time Zone Offset","type":"string","pattern":""}
                ],
                rows = [
                  {"c":[{"v":"AA"},{"v":"AA.N"},{"v":"ALCOA"},{"v":new Date(2014,9,15,9,30,0)},{"v":new Date(2014,9,15,16,30,0)},{"v":"1,2,3,4,5"},{"v":"-0400"}]},
                  {"c":[{"v":"AXP"},{"v":"AXP.N"},{"v":"AMERICAN EXPRESS INC"},{"v":new Date(2014,9,15,9,30,0)},{"v":new Date(2014,9,15,16,30,0)},{"v":"1,2,3,4,5"},{"v":"-0400"}]},
                  {"c":[{"v":"BA"},{"v":"BA.N"},{"v":"BOEING CO"},{"v":new Date(2014,9,15,9,30,0)},{"v":new Date(2014,9,15,16,30,0)},{"v":"1,2,3,4,5"},{"v":"-0400"}]},
                  {"c":[{"v":"BAC"},{"v":"BAC.N"},{"v":"BANK OF AMERICA CORP"},{"v":new Date(2014,9,15,9,30,0)},{"v":new Date(2014,9,15,16,30,0)},{"v":"1,2,3,4,5"},{"v":"-0400"}]},
                  {"c":[{"v":"CAT"},{"v":"CAT.N"},{"v":"CATERPILLAR INC"},{"v":new Date(2014,9,15,9,30,0)},{"v":new Date(2014,9,15,16,30,0)},{"v":"1,2,3,4,5"},{"v":"-0400"}]},
                  {"c":[{"v":"CSCO"},{"v":"CSCO.O"},{"v":"CISCO SYSTEMS"},{"v":new Date(2014,9,15,9,30,0)},{"v":new Date(2014,9,15,16,30,0)},{"v":"1,2,3,4,5"},{"v":"-0400"}]}
                ];
                  
                var dataTableInstance = {
                  getColumnId: function (columnIndex) {
                    return cols[columnIndex].id;
                  },
                  getColumnLabel: function (columnIndex) {
                    return cols[columnIndex].label;
                  },
                  getColumnType: function (columnIndex) {
                    return cols[columnIndex].type;
                  },
                  getNumberOfColumns: function () {
                    return cols.length;
                  },
                  getNumberOfRows: function () {
                    return rows.length;
                  },
                  getValue: function (rowIndex, columnIndex) {
                    return rows[rowIndex].c[columnIndex].v;
                  },
                  getFormattedValue: function(rowIndex, columnIndex) {
                    return rows[rowIndex].c[columnIndex].v;
                  }
                };

                return dataTableInstance;
              },
              getDetailedMessage: function () { return "Mock detailed message"; },
              getMessage: function () { return "Mock message" },
              getReasons: function () { return []; },
              hasWarning: function () { return false; },
              isError: function () { return false; }
            };

            setTimeout(function () {
              callback(queryResponseInstance);
            }, 50);
          }
        }
      };
      return queryInstance;
    }
  };

  window.google.setOnLoadCallback = function (callback) {
    if (callback) {
      callback();
    }
  };

})(window);
