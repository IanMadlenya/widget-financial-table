angular.module("risevision.widget.financialTable.settings")
  .controller("financialTableSettingsController", ["$scope", "PRODUCT_CODE", "PRODUCT_ID",
    function ($scope, PRODUCT_CODE, PRODUCT_ID) {

      $scope.PRODUCT_CODE = PRODUCT_CODE;
      $scope.PRODUCT_ID = PRODUCT_ID;

      $scope.financialColumns = [
        {
          id: "instrument",
          name: "financial-table.columns.instrument",
          type: "text"
        },
        {
          id: "logo",
          name: "financial-table.columns.instrument-logo",
          type: "text"
        },
        {
          id: "name",
          name: "financial-table.columns.instrument-name",
          type: "text"
        },
        {
          id: "lastPrice",
          name: "financial-table.columns.last-price",
          type: "int"
        },
        {
          id: "historicClose",
          name: "financial-table.columns.previous-close",
          type: "int"
        },
        {
          id: "netChange",
          name: "financial-table.columns.change",
          type: "int"
        },
        {
          id: "percentChange",
          name: "financial-table.columns.percent-change",
          type: "int"
        },
        {
          id: "accumulatedVolume",
          name: "financial-table.columns.accumulated-volume",
          type: "int"
        },
        {
          id: "dayHigh",
          name: "financial-table.columns.day-high",
          type: "int"
        },
        {
          id: "dayLow",
          name: "financial-table.columns.day-low",
          type: "int"
        },
        {
          id: "yearHigh",
          name: "financial-table.columns.52-week-high",
          type: "int"
        },
        {
          id: "yearLow",
          name: "financial-table.columns.52-week-low",
          type: "int"
        },
        {
          id: "bid",
          name: "financial-table.columns.bid",
          type: "int"
        },
        {
          id: "ask",
          name: "financial-table.columns.ask",
          type: "int"
        },
        {
          id: "yield",
          name: "financial-table.columns.yield",
          type: "int"
        },
        {
          id: "yieldChange",
          name: "financial-table.columns.yield-change",
          type: "int"
        },
        {
          id: "tradeTime",
          name: "financial-table.columns.trade-time",
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
