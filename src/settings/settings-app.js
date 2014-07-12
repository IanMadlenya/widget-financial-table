angular.module('risevision.widget.financialTable.settings',
  ['risevision.widget.common',
   'pascalprecht.translate',
   'risevision.widget.common.scrollSetting'])
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'locales/',
      suffix: '/translation.json'
    });
    $translateProvider.determinePreferredLanguage();
    if($translateProvider.preferredLanguage().indexOf('en_') === 0){
      //default to 'en' on any of the English variants
      $translateProvider.preferredLanguage('en');
    }
  }]);
