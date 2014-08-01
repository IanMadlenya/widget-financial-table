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
          name: "last-price"
        },
        {
          name: "previous-close"
        },
        {
          name: "change"
        },
        {
          name: "percent-change"
        },
        {
          name: "accumulated-volume"
        },
        {
          name: "day-high"
        },
        {
          name: "day-low"
        },
        {
          name: "52-week-high"
        },
        {
          name: "52-week-low"
        },
        {
          name: "bid"
        },
        {
          name: "ask"
        },
        {
          name: "yield"
        },
        {
          name: "yield-change"
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
