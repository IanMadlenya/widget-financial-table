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

  gulp.task("i18n", function() {
    return gulp.src("src/locales/**/*.json")
    .pipe(gulp.dest("dist/locales"));
  });


  gulp.task('build', function (cb) {
      runSequence(['clean', 'config'], ["html", "css", "i18n"], cb);
  });

  gulp.task("e2e:server", ["config", "html:e2e"], factory.testServer());
  gulp.task("html:e2e", factory.htmlE2E());
  gulp.task("test:e2e", ["html:e2e", "e2e:server"], factory.testE2E());
  gulp.task("webdriver_update", factory.webdriveUpdate());
  gulp.task("e2e:server-close", factory.testServerClose());
  gulp.task("test:e2e:settings", ["webdriver_update", "html:e2e", "e2e:server"], factory.testE2EAngular());

  gulp.task("test", function(cb) {
    runSequence("test:e2e:settings", "e2e:server-close", cb);
  });

  gulp.task("default", function(cb) {
    runSequence("test", "build", cb);
  });

})();
