angular.module("risevision.widget.financialTable.settings")
  .controller("financialTableSettingsController", ["$scope", "PRODUCT_CODE", "PRODUCT_ID",
    function ($scope, PRODUCT_CODE, PRODUCT_ID) {

      $scope.PRODUCT_CODE = PRODUCT_CODE;
      $scope.PRODUCT_ID = PRODUCT_ID;

      $scope.financialColumns = [
        {
          id: "instrument",
          name: "columns.instrument",
          type: "text"
        },
        {
          id: "logo",
          name: "columns.instrument-logo",
          type: "text"
        },
        {
          id: "name",
          name: "columns.instrument-name",
          type: "text"
        },
        {
          id: "lastPrice",
          name: "columns.last-price",
          type: "int"
        },
        {
          id: "historicClose",
          name: "columns.previous-close",
          type: "int"
        },
        {
          id: "netChange",
          name: "columns.change",
          type: "int"
        },
        {
          id: "percentChange",
          name: "columns.percent-change",
          type: "int"
        },
        {
          id: "accumulatedVolume",
          name: "columns.accumulated-volume",
          type: "int"
        },
        {
          id: "dayHigh",
          name: "columns.day-high",
          type: "int"
        },
        {
          id: "dayLow",
          name: "columns.day-low",
          type: "int"
        },
        {
          id: "yearHigh",
          name: "columns.52-week-high",
          type: "int"
        },
        {
          id: "yearLow",
          name: "columns.52-week-low",
          type: "int"
        },
        {
          id: "bid",
          name: "columns.bid",
          type: "int"
        },
        {
          id: "ask",
          name: "columns.ask",
          type: "int"
        },
        {
          id: "yield",
          name: "columns.yield",
          type: "int"
        },
        {
          id: "yieldChange",
          name: "columns.yield-change",
          type: "int"
        },
        {
          id: "tradeTime",
          name: "columns.trade-time",
          type: "text"
        }
      ];

  }])
  .value("defaultSettings", {
    params: {
    },
    additionalParams: {
      instruments: [
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
      scroll: {
      },
      table: {
      },
      columns: [
        {
          id: "instrument",
        },
        {
          id: "logo"
        }
      ],
      disclaimer: {
        font: {
          size: "9",
          italic: true,
          align: "right"
        }
      },
      background: {}
    }
  });
