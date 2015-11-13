/* global createjs */
/* jshint globalstrict: true */
"use strict";

var q = require("q");

var DECK_WIDTH   = 62,
    DECK_HEIGHT  = 40,
    DECK_SPACING = 5;

function Decks() {
  this.Container_constructor();

  this.setup();
}

var p = createjs.extend(Decks, createjs.Container);

p.setup = function() {
  var totalHeight = DECK_HEIGHT * 3 + DECK_SPACING * 2;
  this.setBounds(0, 0, DECK_WIDTH, totalHeight);
  this.regX = 0;
  this.regY = totalHeight / 2; // I think this is sort of an anti-pattern but am not terribly concerned right now

  var carDeck = createCarCard();
  this.addChild(carDeck);

  var dcDeck = createDcCard();
  dcDeck.y = DECK_HEIGHT + DECK_SPACING;
  this.addChild(dcDeck);

  var insuranceDeck = createInsuranceCard();
  insuranceDeck.y = 2 * (DECK_HEIGHT + DECK_SPACING);
  this.addChild(insuranceDeck);
};

p.giveCar = function(destCoords, transitionTime) {
  var newCar = createCarCard();
  this.addChild(newCar);

  var deferred = q.defer();
  createjs.Tween.get(newCar)
    .to(destCoords, transitionTime)
    // .call(deferred.resolve)
    .call(function() {
      console.log("hiya!");
    });

  return deferred.promise;
};

function createCarCard() {
  return createCard("#FABA2F");
}

function createDcCard() {
  return createCard("#AA0099");
}

function createInsuranceCard() {
  return createCard("#22FF77");
}

function createCard(color) {
  var shape = new createjs.Shape();
  shape.graphics
    .beginStroke("#000")
    .beginFill(color)
    .drawRect(0, 0, DECK_WIDTH, DECK_HEIGHT);
  return shape;
}

module.exports = createjs.promote(Decks, "Container");