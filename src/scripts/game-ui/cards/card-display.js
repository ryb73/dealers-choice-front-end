/* global createjs */
/* jshint globalstrict: true */
"use strict";

function CardDisplay(backUrl, frontUrl) {
  this.Container_constructor();

  this._backBmp = createBmp(backUrl);
  var bounds = this._backBmp.getBounds();
  this.setBounds(0, 0, bounds.width, bounds.height);
  this.addChild(this._backBmp);

  if(frontUrl)
    this._frontBmp = createBmp(frontUrl);
}

var p = createjs.extend(CardDisplay, createjs.Container);

function createBmp(url) {
  var bmp = new createjs.Bitmap(url);
  bmp.shadow = new createjs.Shadow("#807E73", 2, 2, 5);
  return bmp;
}

// Only support back to front for now
p.flip = function(delay) {
  createjs.Tween.get(this._backBmp)
    .to({ scaleX: 0, x: this._backBmp.regX }, delay / 2)
    .call(this._flipToFront.bind(this, delay));
};

p._flipToFront = function(delay) {
  this._frontBmp.scaleX = 0;
  this._frontBmp.x = this._frontBmp.regX;
  this.addChild(this._frontBmp);
  createjs.Tween.get(this._frontBmp)
    .to({ scaleX: 1, x: 0 }, delay / 2);
};

module.exports = createjs.promote(CardDisplay, "Container");