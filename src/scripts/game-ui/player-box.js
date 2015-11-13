/* global createjs */
/* jshint globalstrict: true */
"use strict";

var BOX_WIDTH         = 400,
    BOX_HEIGHT_ME     = 150,
    BOX_HEIGHT_OTHERS = 300;

var DcCardDisplay = require("./dc-card-display"),
    CarDisplay    = require("./car-display"),
    AvatarDisplay = require("./avatar-display");

function PlayerBox(user, isMe) {
  this.Container_constructor();

  this._setup(user, isMe);
}

var p = createjs.extend(PlayerBox, createjs.Container);

p._setup = function(user, isMe) {
  var height = (isMe) ? BOX_HEIGHT_ME : BOX_HEIGHT_OTHERS;
  this.setBounds(0, 0, BOX_WIDTH, height);
  this.regX = BOX_WIDTH / 2;
  this.regY = height / 2;

  this._createBackground();
  this._createCars(user.player.cars);
  this._createDcCards(user.player.dcCards);
  if(!isMe)
    this._createAvatar(user);
};

p._createBackground = function() {
  var bg = new createjs.Shape();
  bg.graphics
    .beginFill("#D5EBD5")
    .drawRect(0, 0, this.getBounds().width, this.getBounds().height);

  this.addChild(bg);

  this._bg = bg;
};

p._createCars = function(cars) {
  // Initial reg point is 0,0
  var carDisplay = new CarDisplay(cars);
  var carCoords = getCoordsForCars(carDisplay);
  carDisplay.x = carCoords.x;
  carDisplay.regY = carCoords.regY;
  carDisplay.y = carCoords.y;
  this.addChild(carDisplay);

  this._carDisplay = carDisplay;
};

p._createDcCards = function(dcCards, isMe) {
  // Reg point is 0,0
  var dcCardDisplay = new DcCardDisplay(
    BOX_WIDTH, dcCards, isMe
  );
  dcCardDisplay.y = 60;
  this.addChild(dcCardDisplay);

  this._dcCardDisplay = dcCardDisplay;
};

p._createAvatar = function(user) {
  // Reg point is center of picture
  var avatarDisplay = new AvatarDisplay(user);
  avatarDisplay.x = BOX_WIDTH / 2;
  avatarDisplay.y = this._dcCardDisplay.y +
                    this._dcCardDisplay.getBounds().height + 40 +
                    avatarDisplay.regY;
  this.addChild(avatarDisplay);

  this._avatarDisplay = avatarDisplay;
};

p.setRotation = function(rotationDeg) {
  if(this._avatarDisplay)
    this._avatarDisplay.rotation = -rotationDeg;
};

p.makeSpaceForCar = function(transitionTime) {
  var coords = this._carDisplay.makeSpaceForCar(transitionTime);
  createjs.Tween.get(this._carDisplay)
    .to(getCoordsForCars(this._carDisplay), transitionTime);

  // We'll get the coords in relation to the carDisplay
  // Return them in relation to the playerBox
  coords.x += this._carDisplay.x;
  coords.y += this._carDisplay.y - this._carDisplay.regY;
  return coords;
};

function getCoordsForCars(carDisplay) {
  return {
    x: (BOX_WIDTH - carDisplay.getBounds().width) / 2,
    y: 50,
    regY: carDisplay.getBounds().height
  };
}

p.putCarInBlankSpace = function(qNewCar) {
  this._carDisplay.putCarInBlankSpace(qNewCar);
};

module.exports = createjs.promote(PlayerBox, "Container");