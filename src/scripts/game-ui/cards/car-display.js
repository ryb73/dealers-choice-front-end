/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CardDisplay = require("./card-display"),
    assets      = require("../assets");

function CarDisplay(car) {
  var frontImgId;
  if(car && car.image)
    frontImgId = car.image;

  this.CardDisplay_constructor(assets.carBack, assets[frontImgId]);
}

createjs.extend(CarDisplay, CardDisplay);

module.exports = createjs.promote(CarDisplay, "CardDisplay");