angular.module('risevision.widget.financialTable.settings')
  .controller('financialTableSettingsController', ['$scope', 'settingsSaver', 'settingsGetter', '$timeout',
    function ($scope, settingsSaver, settingsGetter, $timeout) {


  }])
  .value('defaultSettings', {
    params: {
      instruments: 'AA.N, AXP.N, BA.N, BAC.N, CAT.N, CSCO.O, CVX.N, DD.N, DIS.N, GE.N, HD.N, HPQ.N, IBM.N, INTC.O, JNJ.N, JPM.N, KO.N, KRFT.O, MCD.N, MMM.N, MRK.N, MSFT.O, PFE.N, PG.N, T.N, TRV.N, UTX.N, VZ.N, WMT.N, XOM.N',
      rowPadding:'0',
      colPadding:'0'
    },
    additionalParams: {
      scroll: {
        scrollDirection: 'up'
      },
      columns: [
        {
          name: 'instrument',
          show: true,
          alignment: 'right'
        },
        {
          name: 'instrument-logo',
          show: true
        },
        {
          name: 'instrument-name'
        },
        {
          name: 'last-price'
        },
        {
          name: 'previous-close'
        },
        {
          name: 'change'
        },
        {
          name: 'percent-change'
        },
        {
          name: 'accumulated-volume'
        },
        {
          name: 'day-high'
        },
        {
          name: 'day-low'
        },
        {
          name: '52-week-high'
        },
        {
          name: '52-week-low'
        },
        {
          name: 'bid'
        },
        {
          name: 'ask'
        },
        {
          name: 'yield'
        },
        {
          name: 'yield-change'
        },
        {
          name: 'trade-time'
        }
      ]
    }
  });
