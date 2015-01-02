/* jshint node: true */

(function () {
  'use strict';

  var gulp = require('gulp');
  var spawn = require('child_process').spawn;
  var es = require("event-stream");
  var gutil = require('gulp-util');
  var concat = require("gulp-concat");
  var bump = require('gulp-bump');
  var jshint = require("gulp-jshint");
  var minifyCSS = require("gulp-minify-css");
  var rimraf = require("gulp-rimraf");
  var sourcemaps = require("gulp-sourcemaps");
  var usemin = require("gulp-usemin");
  var uglify = require("gulp-uglify");
  var runSequence = require('run-sequence');
  var path = require('path');
  var rename = require("gulp-rename");
  var factory = require("widget-tester").gulpTaskFactory;

  var appJSFiles = [
    "src/**/*.js",
    "!./src/components/**/*"
  ];

  var cssFiles = [
    "src/css/**/*.css"
  ];

  gulp.task("clean", function() {
    return gulp.src("dist")
      .pipe(rimraf({force: true}));
  });

  gulp.task('config', function() {
    var env = process.env.NODE_ENV || 'dev';
    gutil.log('Environment is', env);

    return gulp.src(['./src/config/' + env + '.js'])
      .pipe(rename('config.js'))
      .pipe(gulp.dest('./src/config'));
  });

  gulp.task("lint", function() {
    return gulp.src(appJSFiles)
      .pipe(jshint())
      .pipe(jshint.reporter("jshint-stylish"));
      // .pipe(jshint.reporter("fail"));
  });

  gulp.task("html", ["lint"], function () {
    return gulp.src(['./src/settings.html', './src/widget.html'])
    .pipe(usemin({
      css: [sourcemaps.init(), minifyCSS(), sourcemaps.write()],
      js: [sourcemaps.init(), uglify(), sourcemaps.write()]
    }))
    .pipe(gulp.dest("dist/"));
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

  gulp.task('build', function (cb) {
      runSequence(["clean", "config"], ["html", "fonts", "images", "layouts", "i18n"], cb);
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
  gulp.task("test:metrics", factory.metrics());

  gulp.task("test", function(cb) {
    runSequence("test:unit", "test:e2e", "test:metrics", cb);
  });

  gulp.task("default", function(cb) {
    runSequence("test", "build", cb);
  });

})();
