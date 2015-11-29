/* global createjs */
/* jshint globalstrict: true */
"use strict";

var WIDTH               = 400,
    HEIGHT              = 100,
    PADDING             = 15,
    PROGRESS_BAR_HEIGHT = 20,
    TEXT_COLOR          = "#202020",
    TEXT_FONT           = "Arial";

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

  this._loadingText = createTitleText("Preparing lot...");
  this.addChild(this._loadingText);

  this._setupProgressBar();
};

p._setupProgressBar = function() {
  this._progressBar = new createjs.Shape();
  this._progressBar.x = PADDING;
  this._progressBar.y = HEIGHT - PADDING - PROGRESS_BAR_HEIGHT;
  this.addChild(this._progressBar);
};

p._handleError = function(event) {
  console.error("LoadingSplash error", event);

  this.removeChild(this._loadingText);
  this.removeChild(this._progressBar);

  var errorTitle = createTitleText("Error loading game files.");
  this.addChild(errorTitle);

  var errorMessage = new createjs.Text(
                      "Try refreshing the page?",
                      "18px " + TEXT_FONT, TEXT_COLOR
                     );
  var textBounds = errorMessage.getBounds();
  errorMessage.x = WIDTH / 2 - (textBounds.width / 2);
  errorMessage.y = HEIGHT - PADDING - textBounds.height;
  this.addChild(errorMessage);

  this._deferredLoad.reject(event);
};

function createTitleText(text) {
  var textObj = new createjs.Text(text, "24px " + TEXT_FONT,
                                  TEXT_COLOR);
  var textBounds = textObj.getBounds();
  textObj.x = WIDTH / 2 - (textBounds.width / 2);
  textObj.y = PADDING;
  return textObj;
}

p.load = function() {
  this._deferredLoad = q.defer();

  assets.on("error", this._handleError.bind(this));

  assets.on("progress", this._updateProgress.bind(this));

  assets.on("complete", function() {
    this._deferredLoad.resolve();
  }.bind(this));
  assets.load();

  return this._deferredLoad.promise;
};

p._updateProgress = function() {
  var totalProgressWidth = WIDTH - (2 * PADDING);
  var currentProgressWidth = totalProgressWidth * assets.progress;
  this._progressBar.graphics
    .beginFill("#ff592d")
    .drawRect(0, 0, currentProgressWidth, PROGRESS_BAR_HEIGHT);
};

module.exports = createjs.promote(LoadingSplash, "Container");