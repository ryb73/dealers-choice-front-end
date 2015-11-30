/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CardDisplay = require("./card-display"),
    assets      = require("../assets");

function InsuranceDisplay() {
  this.CardDisplay_constructor(assets.insuranceBack);
}

createjs.extend(InsuranceDisplay, CardDisplay);

module.exports = createjs.promote(InsuranceDisplay, "CardDisplay");