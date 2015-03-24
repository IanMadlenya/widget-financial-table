/* jshint node: true */

(function () {
  "use strict";

  var bump = require("gulp-bump");
  var del = require("del");
  var factory = require("widget-tester").gulpTaskFactory;
  var gulp = require("gulp");
  var gutil = require("gulp-util");
  var jshint = require("gulp-jshint");
  var minifyCSS = require("gulp-minify-css");
  var path = require("path");
  var rename = require("gulp-rename");
  var runSequence = require("run-sequence");
  var sourcemaps = require("gulp-sourcemaps");
  var uglify = require("gulp-uglify");
  var usemin = require("gulp-usemin");

  var appJSFiles = [
      "src/**/*.js",
      "!./src/components/**/*"
    ],
    htmlFiles = [
      "./src/settings.html",
      "./src/widget.html"
    ];

  gulp.task("clean", function(cb) {
    del(["./dist/**"], cb);
  });

  gulp.task("config", function() {
    var env = process.env.NODE_ENV || "dev";
    gutil.log("Environment is", env);

    return gulp.src(["./src/config/" + env + ".js"])
      .pipe(rename("config.js"))
      .pipe(gulp.dest("./src/config"));
  });

  gulp.task("bump", function(){
    return gulp.src(["./package.json", "./bower.json"])
      .pipe(bump({type:"patch"}))
      .pipe(gulp.dest("./"));
  });

  gulp.task("lint", function() {
    return gulp.src(appJSFiles)
      .pipe(jshint())
      .pipe(jshint.reporter("jshint-stylish"));
      // .pipe(jshint.reporter("fail"));
  });

  gulp.task("source", ["lint"], function () {
    return gulp.src(htmlFiles)
      .pipe(usemin({
        css: [sourcemaps.init(), minifyCSS(), sourcemaps.write()],
        js: [sourcemaps.init(), uglify(), sourcemaps.write()]
      }))
      .pipe(gulp.dest("dist/"));
  });

  gulp.task("unminify", function () {
    return gulp.src(htmlFiles)
      .pipe(usemin({
        css: [rename(function (path) {
          path.basename = path.basename.substring(0, path.basename.indexOf(".min"))
        }), gulp.dest("dist")],
        js: [rename(function (path) {
          path.basename = path.basename.substring(0, path.basename.indexOf(".min"))
        }), gulp.dest("dist")]
      }))
  });

  gulp.task("fonts", function() {
    return gulp.src("src/components/common-style/dist/fonts/**/*")
      .pipe(gulp.dest("dist/fonts"));
  });

  gulp.task("images", function() {
    return gulp.src(["src/components/select2/*.png", "src/components/select2/*.gif"])
      .pipe(gulp.dest("dist/css"));
  });

  gulp.task("layouts", function() {
    return gulp.src(["src/layouts/*.xml"])
      .pipe(gulp.dest("dist/layouts"));
  });

  gulp.task("i18n", function(cb) {
    return gulp.src(["src/components/rv-common-i18n/dist/locales/**/*"])
      .pipe(gulp.dest("dist/locales"));
  });

  gulp.task("build", function (cb) {
      runSequence(["clean", "config"], ["source", "fonts", "images", "layouts", "i18n"], ["unminify"], cb)
  });

  gulp.task("e2e:server", ["config", "html:e2e"], factory.testServer());
  gulp.task("html:e2e", factory.htmlE2E({
    files: ["./src/settings.html", "./src/widget.html"],
    e2emockData: "../test/mock-data.js",
    e2eVisualization: "../node_modules/widget-tester/mocks/visualization-api-mock.js"
  }));

  gulp.task("test:unit:settings", factory.testUnitAngular(
    {testFiles: [
      "src/components/jquery/dist/jquery.min.js",
      "src/components/q/q.js",
      "src/components/angular/angular.js",
      "src/components/angular-sanitize/angular-sanitize.js",
      "src/components/angular-route/angular-route.js",
      "src/components/angular-mocks/angular-mocks.js",
      "node_modules/widget-tester/mocks/common-mock.js",
      "src/components/angular-bootstrap/ui-bootstrap-tpls.js",
      "src/config/test.js",
      "src/components/bootstrap-form-components/dist/js/**/*.js",
      "src/components/widget-settings-ui-core/dist/widget-settings-ui-core.js",
      "src/components/component-financial-selector/dist/js/financial-selector.js",
      "src/components/component-subscription-status/dist/js/subscription-status.js",
      "src/components/widget-settings-ui-components/dist/js/angular/*.js",
      "src/settings/settings-app.js",
      "src/settings/**/*.js",
      "test/unit/settings/**/*spec.js"]}
  ));

  gulp.task("test:unit:widget", factory.testUnitAngular(
    {testFiles: [
      "src/components/jquery/dist/jquery.min.js",
      "node_modules/widget-tester/mocks/gadget-mocks.js",
      "node_modules/widget-tester/mocks/visualization-api-mock.js",
      "src/config/test.js",
      "src/widget/**/*.js",
      "test/unit/widget/**/*spec.js"]}
  ));

  gulp.task("webdriver_update", factory.webdriveUpdate());
  gulp.task("e2e:server-close", factory.testServerClose());
  gulp.task("test:e2e:widget", factory.testE2E({
    testFiles: "test/e2e/financial-table-widget-scenarios.js"}
  ));
  gulp.task("test:e2e:settings", ["webdriver_update"], factory.testE2EAngular({
    testFiles: "test/e2e/financial-table-settings-scenarios.js"}
  ));

  gulp.task("test:unit", function(cb) {
    runSequence("test:unit:widget", "test:unit:settings", cb);
  });

  gulp.task("test:e2e", function(cb) {
    runSequence(["html:e2e", "e2e:server"], "test:e2e:widget", "test:e2e:settings", "e2e:server-close", cb);
  });

  gulp.task("test", function(cb) {
    runSequence("test:unit", "test:e2e", cb);
  });

  gulp.task("default", function(cb) {
    runSequence("test", "build", cb);
  });
})();
