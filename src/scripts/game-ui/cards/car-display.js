/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CardDisplay = require("./card-display"),
    assets      = require("../assets");

function CarDisplay(car, fullSize) {
  var frontImgId;
  if(car)
    frontImgId = (fullSize) ? car.image : car.imageSm;

  this.CardDisplay_constructor(
    new createjs.Bitmap(assets.carBack),
    new createjs.Bitmap(assets[frontImgId])
  );
}

createjs.extend(CarDisplay, CardDisplay);

module.exports = createjs.promote(CarDisplay, "CardDisplay");