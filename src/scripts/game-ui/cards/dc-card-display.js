/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CardDisplay = require("./card-display"),
    assets      = require("../assets");

function DcCardDisplay() {
  this.CardDisplay_constructor(assets.dcCardBack);
}

createjs.extend(DcCardDisplay, CardDisplay);

module.exports = createjs.promote(DcCardDisplay, "CardDisplay");