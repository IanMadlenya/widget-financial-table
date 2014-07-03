angular.module('risevision.widget.financialTable.settings')
  .controller('financialTableSettingsController', ['$scope', 'settingsSaver', 'settingsGetter', '$timeout',
    function ($scope, settingsSaver, settingsGetter, $timeout) {


  }])
  .value('defaultSettings', {
    params: {
      instruments: 'AA.N, AXP.N, BA.N, BAC.N, CAT.N, CSCO.O, CVX.N, DD.N, DIS.N, GE.N, HD.N, HPQ.N, IBM.N, INTC.O, JNJ.N, JPM.N, KO.N, KRFT.O, MCD.N, MMM.N, MRK.N, MSFT.O, PFE.N, PG.N, T.N, TRV.N, UTX.N, VZ.N, WMT.N, XOM.N',
      scrollDirection: 'up',
      scrollBy: 'continuous',
      scrollSpeed: 'medium',
      scrollResumes: '5',
      rowPadding:'0',
      colPadding:'0'
    },
    additionalParams: {
    }
  });
