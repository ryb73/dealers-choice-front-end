"use strict";
/* jshint node: true, browser: false */

// TODO: make this not ugly and terrible

var gulp       = require("gulp"),
    uglify     = require("gulp-uglify"),
    less       = require("gulp-less"),
    minifyCss  = require("gulp-minify-css"),
    minifyHtml = require("gulp-minify-html"),
    rename     = require("gulp-rename"),
    gulpIf     = require("gulp-if"),
    q          = require("q"),
    del        = require("del"),
    browserify = require("browserify"),
    globby     = require("globby"),
    vinylSourceStream = require("vinyl-source-stream"),
    path       = require("path"),
    debug  = require("gulp-debug");

var BOWER_DIR     = "bower_components/",
    NODE_DIR      = "node_modules/",
    SRC_DIR       = "src/",
    BUILD_DIR     = "build/",
    BUILD_DEV_DIR = "build-dev/";

gulp.task("prod", ["clean"], function() {
  return build(BUILD_DIR, true);
});

gulp.task("default", ["clean"], function() {
  return build(BUILD_DEV_DIR, false);
});

gulp.task("build styles", buildStyles.bind(null, SRC_DIR, BUILD_DEV_DIR, false));
gulp.task("build scripts", buildScripts.bind(null, SRC_DIR, BUILD_DEV_DIR, false));
gulp.task("build html", buildHtml.bind(null, SRC_DIR, BUILD_DEV_DIR, false));

gulp.task("watch", ["default"], function() {
  gulp.watch(SRC_DIR + "**/*.less", ["build styles"]);
  gulp.watch(SRC_DIR + "**/*.js", ["build scripts"]);
  gulp.watch(SRC_DIR + "**/*.html", ["build html"]);
});

function build(buildDir, prodMode) {
  return copyVendor(buildDir)
    .then(buildStyles.bind(null, SRC_DIR, buildDir, prodMode))
    .then(buildScripts.bind(null, SRC_DIR, buildDir, prodMode))
    .then(buildHtml.bind(null, SRC_DIR, buildDir, prodMode));
}

function copyVendor(buildDir) {
  var qCopyJobs = [
    doCopy(NODE_DIR + "socket.io-client/socket.io.js",
           buildDir + "scripts/socket.io"),

    doCopy(NODE_DIR + "socket.io-client/lib/**",
           buildDir + "scripts/socket.io/lib"),

    doCopy([BOWER_DIR + "polymer/*.html"],
           buildDir + "components/polymer"),

    doCopy([BOWER_DIR + "EaselJS/lib/**.js"],
           buildDir + "scripts/easel"),

    doCopy([BOWER_DIR + "TweenJS/lib/**.js"],
           buildDir + "scripts/tween")
  ];

  return q.all(qCopyJobs);
}

function doCopy(src, dest, fileName) {
  var deferred = q.defer();

  gulp.src(src)
    .pipe(gulpIf(!!fileName, rename(fileName)))
    .pipe(gulp.dest(dest))
    .on("end", deferred.resolve);

  return deferred.promise;
}

function buildStyles(fromDir, toDir, prodMode) {
  var deferred = q.defer(),
      path = fromDir + "**/*.less";

  gulp.src(path)
    // .pipe(debug())
    .pipe(less())
    .pipe(gulpIf(prodMode, minifyCss()))
    .pipe(gulp.dest(toDir))
    // .pipe(debug())
    .on("end", deferred.resolve);

  return deferred.promise;
}

function buildScripts(fromDir, toDir, prodMode) {
  var deferred = q.defer(),
      subDeferrals,
      srcPath = fromDir + "**/*.js";

  globby([ srcPath ], function(err, myJsPaths) {
    subDeferrals = new Array(myJsPaths.length);

    for(var i = 0; i < myJsPaths.length; ++i) {
       var b = browserify(myJsPaths[i], {
        paths: [
          "./" + BOWER_DIR + "webcomponentsjs/"
        ]
      });

      subDeferrals[i] = q.defer();

      var fullToDir = getFullToDir(myJsPaths[i], fromDir, toDir);

      b.bundle()
        .pipe(vinylSourceStream(path.basename(myJsPaths[i])))
        .pipe(gulp.dest(fullToDir))
        .on("end", subDeferrals[i].resolve);
    }

    q.all(subDeferrals.map(function(deferred) {
      return deferred.promise;
    })).then(deferred.resolve);
  });

  return deferred.promise;
}

function getFullToDir(filename, fromBase, toBase) {
  var splitPath = path.dirname(filename).split(path.sep);
  var splitFrom = path.normalize(fromBase).split(path.sep);
  var splitTo = path.normalize(toBase).split(path.sep);

  while(splitFrom.length > 0 && splitPath.length > 0 && splitFrom[0] === splitPath[0])
    splitPath.shift();

  return path.normalize(splitTo.concat(splitPath).join(path.sep));
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

gulp.task("clean", function(cb) {
  del([ BUILD_DIR, BUILD_DEV_DIR ], cb);
});