"use strict";

var FINANCIAL_TABLE_CONFIG = {
  PRODUCT_CODE: "1eb155d506a7c3e6e4dbe0d2089d64d879521894",
  LOGOS_URL: "https://s3.amazonaws.com/risecontentlogos/financial/"
};

if (typeof angular !== "undefined") {
  angular.module("risevision.widget.financialTable.config", [])
    .value("PRODUCT_CODE", FINANCIAL_TABLE_CONFIG.PRODUCT_CODE)
    .value("PRODUCT_ID", "77");
  
  angular.module("risevision.common.i18n.config", [])
    .constant("LOCALES_PREFIX",
      "components/rv-common-i18n/dist/locales/translation_")
    .constant("LOCALES_SUFIX", ".json");

}
