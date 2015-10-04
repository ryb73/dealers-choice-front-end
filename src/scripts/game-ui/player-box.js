/* global createjs */
/* jshint globalstrict: true */
"use strict";

var BOX_WIDTH   = 400,
    BOX_HEIGHT  = 150;

var DcCardDisplay = require("./dc-card-display"),
    CarDisplay    = require("./car-display");

function PlayerBox(user, isMe) {
  this.Container_constructor();

  this.user = user;
  this.isMe = isMe;
  this.setup();
}

var p = createjs.extend(PlayerBox, createjs.Container);

p.setup = function() {
  this.drawBackground();

  var carDisplay = new CarDisplay(this.user.player.cars);
  carDisplay.x = (BOX_WIDTH - carDisplay.getBounds().width) / 2;
  carDisplay.regY = carDisplay.getBounds().height;
  carDisplay.y = 50;
  this.addChild(carDisplay);

  var dcCardDisplay = new DcCardDisplay(
    BOX_WIDTH, this.user.player.dcCards, this.isMe
  );
  dcCardDisplay.y = 60;
  this.addChild(dcCardDisplay);
};

p.drawBackground = function() {
  this.setBounds(0, 0, BOX_WIDTH, BOX_HEIGHT);
  this.regX = BOX_WIDTH / 2;
  this.regY = BOX_HEIGHT / 2;

  var bg = new createjs.Shape();
  bg.graphics
    .beginFill("#D5EBD5")
    .drawRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

  this.addChild(bg);
};

module.exports = createjs.promote(PlayerBox, "Container");