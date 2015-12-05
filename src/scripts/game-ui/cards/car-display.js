/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CardDisplay = require("./card-display"),
    assets      = require("../assets");

function CarDisplay(car) {
  var frontImgId;
  if(car && car.image)
    frontImgId = car.image;

  this.CardDisplay_constructor(
    new createjs.Bitmap(assets.carBack),
    new createjs.Bitmap(assets[frontImgId])
  );
}

createjs.extend(CarDisplay, CardDisplay);

module.exports = createjs.promote(CarDisplay, "CardDisplay");