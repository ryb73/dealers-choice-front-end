/* global createjs */
/* jshint globalstrict: true */
"use strict";

var WIDTH  = 400,
    HEIGHT = 100,
    PADDING = 15,
    PROGRESS_BAR_HEIGHT = 20;

// Yeah, I'm tightly coupling this to the assets manager
var q      = require("q"),
    assets = require("./assets");

function LoadingSplash() {
  this.Container_constructor();

  this._setup();
}

var p = createjs.extend(LoadingSplash, createjs.Container);

p._setup = function() {
  this.setBounds(0, 0, WIDTH, HEIGHT);
  this.regX = WIDTH / 2;
  this.regY = HEIGHT / 2;

  var bg = new createjs.Shape();
  bg.graphics
    .beginFill("rgba(255, 249, 229, 0.75)")
    .drawRect(0, 0, WIDTH, HEIGHT);
  this.addChild(bg);

  var loadingText = new createjs.Text("Preparing lot...", "24px Arial", "#202020");
  var textBounds = loadingText.getBounds();
  loadingText.x = WIDTH / 2 - (textBounds.width / 2);
  loadingText.y = PADDING;
  this.addChild(loadingText);

  this._setupProgressBar();
};

p._setupProgressBar = function() {
  this._progressBar = new createjs.Shape();
  this._progressBar.x = PADDING;
  this._progressBar.y = HEIGHT - PADDING - PROGRESS_BAR_HEIGHT;
  this.addChild(this._progressBar);
};

p.load = function() {
  var deferred = q.defer();

  assets.on("error", function(event) {
    console.log("error loading", event);
    // deferred.reject();
  });

  assets.on("progress", this._updateProgress.bind(this));

  assets.on("complete", function() {
    console.log("completed loading");
    // deferred.resolve();
  });
  assets.load();

  return deferred.promise;
};

p._updateProgress = function() {
  var totalProgressWidth = WIDTH - (2 * PADDING);
  var currentProgressWidth = totalProgressWidth * assets.progress;
  this._progressBar.graphics
    .beginFill("#ff592d")
    .drawRect(0, 0, currentProgressWidth, PROGRESS_BAR_HEIGHT);
};

module.exports = createjs.promote(LoadingSplash, "Container");