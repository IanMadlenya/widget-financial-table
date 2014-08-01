angular.module("risevision.widget.financialTable.settings",
  ["risevision.widget.common",
  "risevision.widget.common.translate",
  'risevision.widget.common.alignment',
  'risevision.widget.common.color-picker',
  'risevision.widget.common.financial',
  'risevision.widget.common.tooltip',
  'risevision.widget.common.font-setting',
  'risevision.widget.common.scroll-setting',
  'risevision.widget.common.column-setting',
  'risevision.widget.common.table-setting',
  'risevision.widget.common.column-selector']);

angular.module("risevision.widget.common.translate", ["pascalprecht.translate"])
  .config(["$translateProvider", function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: "locales/",
      suffix: "/translation.json"
    });
    $translateProvider.determinePreferredLanguage();
    if($translateProvider.preferredLanguage().indexOf("en_") === 0){
      //default to "en" on any of the English variants
      $translateProvider.preferredLanguage("en");
    }
  }]);
