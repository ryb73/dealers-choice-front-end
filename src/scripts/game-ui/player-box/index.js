/* global createjs */
/* jshint globalstrict: true */
"use strict";

var BOX_WIDTH         = 600,
    BOX_HEIGHT_ME     = 150,
    BOX_HEIGHT_OTHERS = 300;

var PlayerDcCards = require("./player-dc-cards"),
    PlayerCars    = require("./player-cars"),
    AvatarDisplay = require("./avatar-display");

function PlayerBox(user, isMe, debugMode) {
  this.Container_constructor();

  this._setup(user, isMe, debugMode);
}

var p = createjs.extend(PlayerBox, createjs.Container);

p._setup = function(user, isMe, debugMode) {
  var height = (isMe) ? BOX_HEIGHT_ME : BOX_HEIGHT_OTHERS;
  this.setBounds(0, 0, BOX_WIDTH, height);
  this.regX = BOX_WIDTH / 2;
  this.regY = height / 2;

  if(debugMode)
    this._createBackground();
  this._createCars(user.player.cars);
  this._createDcCards(user.player.dcCards, isMe);
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
  // Reg point is 0,0
  var playerCars = new PlayerCars(cars);
  var carCoords = getCoordsForCars(playerCars);
  playerCars.x = carCoords.x;
  playerCars.y = carCoords.y;
  this.addChild(playerCars);

  this._playerCars = playerCars;
};

p._createDcCards = function(dcCards, isMe) {
  // Reg point is 0,0
  var playerDcCards = new PlayerDcCards(
    BOX_WIDTH, dcCards, isMe
  );
  playerDcCards.y = 60;
  this.addChild(playerDcCards);

  this._playerDcCards = playerDcCards;
};

p._createAvatar = function(user) {
  // Reg point is center of picture
  var avatarDisplay = new AvatarDisplay(user);
  avatarDisplay.x = BOX_WIDTH / 2;
  avatarDisplay.y = this._playerDcCards.y +
                    this._playerDcCards.getBounds().height + 40 +
                    avatarDisplay.regY;
  this.addChild(avatarDisplay);

  this._avatarDisplay = avatarDisplay;
};

p.setRotation = function(rotationDeg) {
  if(this._avatarDisplay)
    this._avatarDisplay.rotation = -rotationDeg;

  this._playerCars.setRotation(rotationDeg);
};

p.makeSpaceForCar = function(transitionTime) {
  var coords = this._playerCars.makeSpaceForCar(transitionTime);
  var carDispCoords = getCoordsForCars(this._playerCars);
  createjs.Tween.get(this._playerCars)
    .to(carDispCoords, transitionTime);

  // We'll get the coords in relation to the playerCars
  // Return them in relation to the playerBox
  coords.x += carDispCoords.x;
  coords.y += carDispCoords.y;
  return coords;
};

function getCoordsForCars(playerCars) {
  return {
    x: (BOX_WIDTH - playerCars.getBounds().width) / 2,
    y: 50 - playerCars.getBounds().height
  };
}

p.putCarInBlankSpace = function(qNewCar) {
  return this._playerCars.putCarInBlankSpace(qNewCar);
};

p.makeSpaceForDcCard = function(transitionTime) {
  var coords = this._playerDcCards.makeSpaceForCard(transitionTime);
  coords.y += this._playerDcCards.y;
  return coords;
};

p.putDcCardInBlankSpace = function(qNewCard) {
  return this._playerDcCards.putCardInBlankSpace(qNewCard);
};

module.exports = createjs.promote(PlayerBox, "Container");