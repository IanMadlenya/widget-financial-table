/* jshint node: true */

(function () {
  'use strict';

  var gulp = require('gulp');
  var spawn = require('child_process').spawn;
  var gutil = require('gulp-util');
  var clean = require("gulp-clean");
  var concat = require("gulp-concat");
  var bump = require('gulp-bump');
  var html2string = require('gulp-html2string');
  var jshint = require("gulp-jshint");
  var minifyCSS = require("gulp-minify-css");
  var usemin = require("gulp-usemin");
  var uglify = require("gulp-uglify");
  var runSequence = require('gulp-run-sequence');
  var path = require('path');
  var rename = require("gulp-rename");
  var factory = require("widget-tester").gulpTaskFactory;

  var appJSFiles = [
    "src/**/*.js",
    "test/**/*.js",
    "!./src/components/**/*"
  ];

  var cssFiles = [
    "src/css/**/*.css"
  ];

  gulp.task("clean", function() {
    return gulp.src("dist")
      .pipe(clean({force: true}));
  });

  gulp.task('config', function() {
    var env = process.env.NODE_ENV || 'dev';
    gutil.log('Environment is', env);

    return gulp.src(['./js/config/' + env + '.js'])
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
    return gulp.src(['./src/*.html'])
      .pipe(usemin({
      js: [uglify({mangle:false, outSourceMap: true})] //disable mangle just for $routeProvider in controllers.js
    }))
    .pipe(gulp.dest("dist/"));
  });

  gulp.task("css", function () {
    return gulp.src(cssFiles)
      .pipe(minifyCSS({keepBreaks:true}))
      .pipe(concat("all.min.css"))
      .pipe(gulp.dest("dist/css"));
  });

  gulp.task("fonts", function() {
    return gulp.src("src/components/boostrap/fonts/**/*")
      .pipe(gulp.dest("dist/fonts"));
  });

  gulp.task("i18n", function() {
    return gulp.src("src/locales/**/*.json")
    .pipe(gulp.dest("dist/locales"));
  });


  gulp.task('build', function (cb) {
      runSequence(["clean", "config"], ["html", "css", "fonts", "i18n"], cb);
  });

  gulp.task("e2e:server", ["config", "html:e2e"], factory.testServer());
  gulp.task("html:e2e", factory.htmlE2E());
  gulp.task("test:e2e", ["html:e2e", "e2e:server"], factory.testE2E());

  gulp.task("test:unit:ng", factory.testUnitAngular(
    {testFiles: [
      "src/components/q/q.js",
      "src/components/angular/angular.js",
      "src/components/angular-route/angular-route.js",
      "src/components/angular-mocks/angular-mocks.js",
      "src/components/angular-translate/angular-translate.js",
      "src/components/angular-translate-loader-url/angular-translate-loader-url.js",
      "src/components/angular-translate-loader-static-files/angular-translate-loader-static-files.js",
      "src/config/test.js",
      "src/components/widget-settings-ui-core/dist/widget-settings-ui-core.js",
      "src/components/component-financial-selector/dist/js/financial-selector.js",
      "src/settings/settings-app.js",
      "src/settings/**/*.js",
      "test/unit/**/*spec.js"]}
  ));

  gulp.task("webdriver_update", factory.webdriveUpdate());
  gulp.task("e2e:server-close", factory.testServerClose());
  gulp.task("test:e2e:settings", ["webdriver_update", "html:e2e", "e2e:server"], factory.testE2EAngular());

  gulp.task("test", function(cb) {
    runSequence("test:unit:ng", "test:e2e:settings", "e2e:server-close", "test:metrics", cb);
  });

  gulp.task("default", function(cb) {
    runSequence("test", "build", cb);
  });

})();
