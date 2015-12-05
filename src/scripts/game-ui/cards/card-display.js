/* global createjs */
/* jshint globalstrict: true */
"use strict";

function CardDisplay(backDisp, frontDisp) {
  this.Container_constructor();

  this._backDisp = addShadow(backDisp);
  this.addChild(this._backDisp);
  this._updateBounds();

  if(frontDisp)
    this._frontDisp = addShadow(frontDisp);
}

var p = createjs.extend(CardDisplay, createjs.Container);

p._updateBounds = function() {
  var bounds = this._backDisp.getBounds();
  this.setBounds(0, 0, bounds.width, bounds.height);
  this.regX = bounds.width / 2;
  this.regY = bounds.height / 2;
};

function addShadow(dispObj) {
  dispObj.shadow = new createjs.Shadow("#807E73", 2, 2, 5);
  return dispObj;
}

// Only support back to front for now
p.flip = function(delay) {
  if(!delay) delay = 0;

  createjs.Tween.get(this._backDisp)
    .to({ scaleX: 0, x: this.regX }, delay / 2)
    .call(this._flipToFront.bind(this, delay));
};

p._flipToFront = function(delay) {
  this._frontDisp.scaleX = 0;
  this._frontDisp.x = this.regX;
  this.addChild(this._frontDisp);
  createjs.Tween.get(this._frontDisp)
    .to({ scaleX: 1, x: 0 }, delay / 2);
};

module.exports = createjs.promote(CardDisplay, "Container");