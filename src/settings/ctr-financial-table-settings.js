angular.module("risevision.widget.financialTable.settings")
  .controller("financialTableSettingsController", ["$scope",
    function ($scope) {

      $scope.financialColumns = [
        {
          name: "instrument",
          type: "text"
        },
        {
          name: "instrument-logo",
          type: "text"
        },
        {
          name: "instrument-name",
          type: "text"
        },
        {
          name: "last-price",
          type: "int"
        },
        {
          name: "previous-close",
          type: "int"
        },
        {
          name: "change",
          type: "int"
        },
        {
          name: "percent-change",
          type: "int"
        },
        {
          name: "accumulated-volume",
          type: "int"
        },
        {
          name: "day-high",
          type: "int"
        },
        {
          name: "day-low",
          type: "int"
        },
        {
          name: "52-week-high",
          type: "int"
        },
        {
          name: "52-week-low",
          type: "int"
        },
        {
          name: "bid",
          type: "int"
        },
        {
          name: "ask",
          type: "int"
        },
        {
          name: "yield",
          type: "int"
        },
        {
          name: "yield-change",
          type: "int"
        },
        {
          name: "trade-time",
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
      backgroundColor: "transparent"
    },
    additionalParams: {
      scroll: {
      },
      table: {
      },
      columns: [
        {
          name: "instrument",
          alignment: "right"
        },
        {
          name: "instrument-logo"
        }
      ]
    }
  });
