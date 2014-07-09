/* jshint node: true */

(function () {
  'use strict';

  var gulp = require('gulp');
  var spawn = require('child_process').spawn;
  var gutil = require('gulp-util');
  var connect = require('gulp-connect');
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
  var rename = require('gulp-rename');
  var httpServer;

  var appJSFiles = [
    "src/**/*.js",
    "test/**/*.js",
    '!./src/components/**/*'
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

  gulp.task('e2e:server', ['build'], function() {
    httpServer = connect.server({
      root: './',
      port: 8099,
      livereload: false
    });
    return httpServer;
  });

  gulp.task('e2e:test', ['build', 'e2e:server'], function () {
      var tests = ['test/e2e/test1.js'];

      var casperChild = spawn('casperjs', ['test'].concat(tests));

      casperChild.stdout.on('data', function (data) {
          gutil.log('CasperJS:', data.toString().slice(0, -1)); // Remove \n
      });

      casperChild.on('close', function (code) {
          var success = code === 0; // Will be 1 in the event of failure
          connect.serverClose();
          // Do something with success here
          if(!success) {
            throw 'CasperJS returned error.';
          }
      });
  });

  gulp.task('e2e:test-ng', ['webdriver_update', 'e2e:server'], function () {
    return gulp.src(['./test/e2e/test-ng.js'])
      .pipe(protractor({
          configFile: './test/protractor.conf.js',
          args: ['--baseUrl', 'http://127.0.0.1:' + e2ePort + '/test/e2e/test-ng.html']
      }))
      .on('error', function (e) { console.log(e); throw e; })
      .on('end', function () {
        connect.serverClose();
      });
  });

  gulp.task('build', function (cb) {
      runSequence(['clean', 'config'], ["html", "css", "i18n"], cb);
  });

  gulp.task('test', function(){});

  gulp.task('default', ['build']);

})();
