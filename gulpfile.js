/* jshint node: true */

(function () {
  'use strict';

  var gulp = require('gulp');
  var spawn = require('child_process').spawn;
  var fs = require("fs");
  var es = require("event-stream");
  var gutil = require('gulp-util');
  var concat = require("gulp-concat");
  var bump = require('gulp-bump');
  var jshint = require("gulp-jshint");
  var jsoncombine = require("gulp-jsoncombine");
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

  var languages = fs.readdirSync("src/locales")
    .filter(function(file) {
      return fs.statSync(path.join("src/locales", file)).isDirectory();
  });

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

  gulp.task("json-move", function() {
    // in case some files have the same name
    var index = 0;
    var tasks = languages.map(function(folder) {
      return gulp.src([path.join("src/locales", folder, "*.json"),
        path.join("src/components/*/dist/locales", folder, "*.json")])
        .pipe(rename(function (path) {
          path.dirname = "";
          path.basename += index++;
        }))
        .pipe(gulp.dest(path.join("tmp/locales", folder)));
    });
    return es.concat.apply(null, tasks);
  });

  gulp.task("json-combine", ["json-move"], function() {
    var tasks = languages.map(function(folder) {
      return gulp.src([path.join("tmp/locales", folder, "*.json")])
        .pipe(jsoncombine("translation.json",function(data) {
          var jsonString,
            newData = {};

          for (var filename in data) {
            var fileObject = data[filename];
            for (var attrname in fileObject) {
              newData[attrname] = fileObject[attrname];
            }
          }

          jsonString = JSON.stringify(newData, null, 2);
          return new Buffer(jsonString);
        }))
        .pipe(gulp.dest(path.join("dist/locales/", folder)));
    });
    return es.concat.apply(null, tasks);
  });

  gulp.task("i18n", function(cb) {
    runSequence("json-move", "json-combine", cb);
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

  gulp.task("test:unit:ng", factory.testUnitAngular(
    {testFiles: [
      "src/components/jquery/dist/jquery.min.js",
      "src/components/q/q.js",
      "src/components/angular/angular.js",
      "src/components/angular-route/angular-route.js",
      "src/components/angular-mocks/angular-mocks.js",
      "src/components/angular-translate/angular-translate.js",
      "src/components/angular-translate-loader-static-files/angular-translate-loader-static-files.js",
      "src/components/angular-bootstrap/ui-bootstrap-tpls.js",
      "src/config/test.js",
      "src/components/bootstrap-form-components/dist/js/**/*.js",
      "src/components/widget-settings-ui-core/dist/widget-settings-ui-core.js",
      "src/components/component-financial-selector/dist/js/financial-selector.js",
      "src/components/component-subscription-status/dist/js/subscription-status.js",
      "src/components/widget-settings-ui-components/dist/js/angular/*.js",
      "src/settings/settings-app.js",
      "src/settings/**/*.js",
      "test/unit/**/*spec.js"]}
  ));

  gulp.task("webdriver_update", factory.webdriveUpdate());
  gulp.task("e2e:server-close", factory.testServerClose());
  gulp.task("test:e2e:widget", factory.testE2E({
    testFiles: "test/e2e/financial-table-widget-scenarios.js"}
  ));
  gulp.task("test:e2e:settings", ["webdriver_update"], factory.testE2EAngular({
    testFiles: "test/e2e/financial-table-settings-scenarios.js"}
  ));
  gulp.task("test:e2e", function(cb) {
    runSequence(["html:e2e", "e2e:server"], "test:e2e:widget", "test:e2e:settings", "e2e:server-close", cb);
  });
  gulp.task("test:metrics", factory.metrics());

  gulp.task("test", function(cb) {
    runSequence("test:unit:ng", "test:e2e", "test:metrics", cb);
  });

  gulp.task("default", function(cb) {
    runSequence("test", "build", cb);
  });

})();
