angular.module("risevision.widget.financialTable.settings")
  .controller("financialTableSettingsController", ["$scope", "PRODUCT_CODE", "PRODUCT_ID",
    function ($scope, PRODUCT_CODE, PRODUCT_ID) {

      $scope.PRODUCT_CODE = PRODUCT_CODE;
      $scope.PRODUCT_ID = PRODUCT_ID;
      $scope.companyId = "f114ad26-949d-44b4-87e9-8528afc76ce4";

      $scope.financialColumns = [
        {
          id: "instrument",
          name: "columns.instrument",
          type: "text"
        },
        {
          id: "instrument-logo",
          name: "columns.instrument-logo",
          type: "text"
        },
        {
          id: "instrument-name",
          name: "columns.instrument-name",
          type: "text"
        },
        {
          id: "last-price",
          name: "columns.last-price",
          type: "int"
        },
        {
          id: "previous-close",
          name: "columns.previous-close",
          type: "int"
        },
        {
          id: "change",
          name: "columns.change",
          type: "int"
        },
        {
          id: "percent-change",
          name: "columns.percent-change",
          type: "int"
        },
        {
          id: "accumulated-volume",
          name: "columns.accumulated-volume",
          type: "int"
        },
        {
          id: "day-high",
          name: "columns.day-high",
          type: "int"
        },
        {
          id: "day-low",
          name: "columns.day-low",
          type: "int"
        },
        {
          id: "52-week-high",
          name: "columns.52-week-high",
          type: "int"
        },
        {
          id: "52-week-low",
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
          id: "yield-change",
          name: "columns.yield-change",
          type: "int"
        },
        {
          id: "trade-time",
          name: "columns.trade-time",
          type: "text"
        }
      ];

  }])
  .value("defaultSettings", {
    params: {
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
      background: {}
    },
    additionalParams: {
      scroll: {
      },
      table: {
      },
      columns: [
        {
          id: "instrument",
        },
        {
          id: "instrument-logo"
        }
      ],
      disclaimer: {
        font: {
          size: "9",
          italic: true,
          align: "right"
        }
      }
    }
  });
