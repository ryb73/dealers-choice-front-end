/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CardDisplay = require("./card-display");

var BACK_URL = "/images/cars/blank.png";

function CarDisplay(car) {
  var frontUrl;
  if(car && car.image)
    frontUrl = car.image;

  this.CardDisplay_constructor(BACK_URL, frontUrl);
}

createjs.extend(CarDisplay, CardDisplay);

module.exports = createjs.promote(CarDisplay, "CardDisplay");