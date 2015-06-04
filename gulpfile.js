"use strict";
/* jshint node: true, browser: false */

var gulp       = require("gulp"),
    //concat     = require("gulp-concat"),
    uglify     = require("gulp-uglify"),
    less       = require("gulp-less"),
    minifyCss  = require("gulp-minify-css"),
    minifyHtml = require("gulp-minify-html"),
    //vinylPaths = require("vinyl-paths"),
    rename     = require("gulp-rename"),
    gulpIf     = require("gulp-if"),
    q          = require("q"),
    del        = require("del"),
    gulpDebug  = require("gulp-debug");

var BOWER_DIR     = "bower_components/",
    NODE_DIR      = "node_modules/",
    SRC_DIR       = "src/",
    // TEMP_DIR      = "tmp/",
    BUILD_DIR     = "build/",
    BUILD_DEV_DIR = "build-dev/";

gulp.task("prod", ["clean"], function() {
  build(BUILD_DIR, true);
});

gulp.task("default", ["clean"], function() {
  return build(BUILD_DEV_DIR, false);
});

gulp.task("build styles", buildStyles.bind(null, SRC_DIR, BUILD_DEV_DIR, false));
gulp.task("build scripts", buildScripts.bind(null, SRC_DIR, BUILD_DEV_DIR, false));
gulp.task("build html", buildHtml.bind(null, SRC_DIR, BUILD_DEV_DIR, false));

gulp.task("watch", ["default"], function() {
  gulp.watch(SRC_DIR + "styles/**/*.less", ["build styles"]);
  gulp.watch(SRC_DIR + "scripts/**/*.js", ["build scripts"]);
  gulp.watch(SRC_DIR + "**/*.html", ["build html"]);
});

function build(buildDir, prodMode) {
  return copyVendor(buildDir, prodMode)
    .then(buildStyles.bind(null, SRC_DIR, buildDir, prodMode))
    .then(buildScripts.bind(null, SRC_DIR, buildDir, prodMode))
    .then(buildHtml.bind(null, SRC_DIR, buildDir, prodMode));
}

// function createTemp() {
//   var deferred = q.defer();

//   gulp.src(SRC_DIR + "**/*")
//     .pipe(gulp.dest(TEMP_DIR))
//     .on("end", deferred.resolve);

//   return deferred.promise;
// }

function copyVendor(buildDir, prodMode) {
  if(prodMode) {
    return q.all([
      doCopy(BOWER_DIR + "jquery/dist/jquery.min.js",
             buildDir + "scripts", "jquery.js"),
      doCopy(NODE_DIR + "socket.io-client/socket.io.js",
             buildDir + "scripts/socket.io"),
      doCopy(NODE_DIR + "socket.io-client/lib/**",
             buildDir + "scripts/socket.io/lib")
    ]);
  } else {
    return q.all([
      doCopy(BOWER_DIR + "jquery/dist/jquery.js",
             buildDir + "scripts"),
      doCopy(BOWER_DIR + "webcomponentsjs/**",
             buildDir + "webcomponentsjs"),
      doCopy(BOWER_DIR + "polymer/**",
             buildDir + "polymer"),
      doCopy(BOWER_DIR + "polymer-expressions/**",
             buildDir + "polymer-expressions"),
      doCopy(BOWER_DIR + "polymer-gestures/**",
             buildDir + "polymer-gestures"),
      doCopy(BOWER_DIR + "observe-js/**",
             buildDir + "observe-js"),
      doCopy(BOWER_DIR + "NodeBind/**",
             buildDir + "NodeBind"),
      doCopy(BOWER_DIR + "TemplateBinding/**",
             buildDir + "TemplateBinding"),
      doCopy(BOWER_DIR + "URL/**",
             buildDir + "URL"),
      doCopy(BOWER_DIR + "jsonymer/**",
             buildDir + "jsonymer"),
      doCopy(NODE_DIR + "socket.io-client/socket.io.js",
             buildDir + "scripts/socket.io"),
      // doCopy(NODE_DIR + "socket.io-client/lib/**",
      //        buildDir + "scripts/socket.io/lib")
    ]);
  }
}

function doCopy(src, dest, fileName) {
  var deferred = q.defer();

  gulp.src([src])
    .pipe(gulpIf(!!fileName, rename(fileName)))
    .pipe(gulp.dest(dest))
    .on("end", deferred.resolve);

  return deferred.promise;
}

function buildStyles(fromDir, toDir, prodMode) {
  var deferred = q.defer(),
      path = fromDir + "styles/**/*.less";

  gulp.src(path)
    .pipe(less())
    .pipe(gulpIf(prodMode, minifyCss()))
    .pipe(gulp.dest(toDir + "styles"))
    .on("end", deferred.resolve);

  return deferred.promise;
}

function buildScripts(fromDir, toDir, prodMode) {
  var deferred = q.defer(),
      path = fromDir + "scripts/**/*.js";

  gulp.src(path)
    .pipe(gulpIf(prodMode, uglify()))
    .pipe(gulp.dest(toDir + "scripts"))
    .on("end", deferred.resolve);

  return deferred.promise;
}

function buildHtml(fromDir, toDir, prodMode) {
  var deferred = q.defer(),
      path = fromDir + "**/*.html";

  gulp.src(path)
    .pipe(gulpIf(prodMode,
      minifyHtml({
        conditionals: true,
        empty: true
      }))
    )
    .pipe(gulp.dest(toDir))
    .on("end", deferred.resolve);

  return deferred.promise;
}

// function copyTempToBuild(buildDir) {
//   var deferred = q.defer();

//   gulp.src(TEMP_DIR + "**/*")
//     .pipe(gulp.dest(buildDir))
//     .on("end", deferred.resolve);

//   return deferred.promise;
// }

gulp.task("clean", function(cb) {
  del([ BUILD_DIR, BUILD_DEV_DIR ], cb);
});