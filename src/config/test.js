"use strict";

var FINANCIAL_TABLE_CONFIG = {
  PRODUCT_CODE: "1c2acf0b1e789bf4f14506e3e27c8a32832b6d5a",
  LOGOS_URL: "https://s3.amazonaws.com/risecontentlogos/financial/"
};

if (typeof angular !== "undefined") {
  angular.module("risevision.widget.financialTable.config", [])
    .value("PRODUCT_CODE", FINANCIAL_TABLE_CONFIG.PRODUCT_CODE)
    .value("PRODUCT_ID", "13")
  ;
}