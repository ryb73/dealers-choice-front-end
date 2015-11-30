/* global createjs */
/* jshint globalstrict: true */
"use strict";

function CardDisplay(backImage, frontImage) {
  this.Container_constructor();

  this._backBmp = createBmp(backImage);
  this.addChild(this._backBmp);
  this._updateBounds();

  if(frontImage)
    this._frontBmp = createBmp(frontImage);
}

var p = createjs.extend(CardDisplay, createjs.Container);

p._updateBounds = function() {
  var bounds = this._backBmp.getBounds();
  this.setBounds(0, 0, bounds.width, bounds.height);
  this.regX = bounds.width / 2;
  this.regY = bounds.height / 2;
};

function createBmp(image) {
  var bmp = new createjs.Bitmap(image);
  bmp.shadow = new createjs.Shadow("#807E73", 2, 2, 5);
  return bmp;
}

// Only support back to front for now
p.flip = function(delay) {
  if(!delay) delay = 0;

  createjs.Tween.get(this._backBmp)
    .to({ scaleX: 0, x: this.regX }, delay / 2)
    .call(this._flipToFront.bind(this, delay));
};

p._flipToFront = function(delay) {
  this._frontBmp.scaleX = 0;
  this._frontBmp.x = this.regX;
  this.addChild(this._frontBmp);
  createjs.Tween.get(this._frontBmp)
    .to({ scaleX: 1, x: 0 }, delay / 2);
};

module.exports = createjs.promote(CardDisplay, "Container");