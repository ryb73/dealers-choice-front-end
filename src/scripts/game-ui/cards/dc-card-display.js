/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CardDisplay = require("./card-display");

var BACK_URL = "/images/dc-cards/back.png";

function DcCardDisplay() {
  this.CardDisplay_constructor(BACK_URL);
}

createjs.extend(DcCardDisplay, CardDisplay);

module.exports = createjs.promote(DcCardDisplay, "CardDisplay");