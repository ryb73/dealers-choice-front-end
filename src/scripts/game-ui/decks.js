/* global createjs */
/* jshint globalstrict: true */
"use strict";

var q                = require("q"),
    _                = require("lodash"),
    consts           = require("./constants"),
    CarDisplay       = require("./cards/car-display"),
    DcCardDisplay    = require("./cards/dc-card-display"),
    InsuranceDisplay = require("./cards/insurance-display");

var DECK_WIDTH   = 93,
    DECK_HEIGHT  = 60,
    DECK_SPACING = 5,
    DC_CARD_Y    = DECK_HEIGHT / 2 + DECK_HEIGHT + DECK_SPACING;

function Decks() {
  this.Container_constructor();

  this._setup();
}

var p = createjs.extend(Decks, createjs.Container);

p._setup = function() {
  var totalHeight = DECK_HEIGHT * 3 + DECK_SPACING * 2;
  this.setBounds(0, 0, DECK_WIDTH, totalHeight);
  this.regX = 0;
  this.regY = totalHeight / 2; // I think this is sort of an anti-pattern but am not terribly concerned right now

  var carDeck = createCarCard();
  carDeck.y = DECK_HEIGHT / 2;
  this.addChild(carDeck);

  var dcDeck = createDcCard();
  dcDeck.y = DC_CARD_Y;
  this.addChild(dcDeck);

  var insuranceDeck = createInsuranceCard();
  insuranceDeck.y = DECK_HEIGHT / 2 +
                    2 * (DECK_HEIGHT + DECK_SPACING);
  this.addChild(insuranceDeck);
};

p.giveCar = function(car, destCoords, transitionTime) {
  var newCard = createCarCard(car);
  newCard.flip(transitionTime / 4);
  this.addChild(newCard);

  var deferred = q.defer();
  createjs.Tween.get(newCard)
    .to(destCoords, transitionTime, createjs.Ease.cubicOut)
    .call(function() {
      deferred.resolve(newCard);
    });

  return deferred.promise;
};

p.giveDcCard = function(dcCard, destCoords, transitionTime, flip) {
  var newCard = createDcCard(dcCard);
  if(flip) newCard.flip(transitionTime / 4);
  newCard.y = DC_CARD_Y;
  this.addChild(newCard);

  var deferred = q.defer();
  createjs.Tween.get(newCard)
    .to(destCoords, transitionTime, createjs.Ease.cubicOut)
    .call(function() {
      deferred.resolve(newCard);
    });

  return deferred.promise;
};

// car: Optional reference to car. If omitted, creates
//      a blank car
function createCarCard(car) {
  var carDisplay = new CarDisplay(car);
  carDisplay.x = carDisplay.regX;
  return carDisplay;
}

function createDcCard(dcCard) {
  var dcCardDisplay = new DcCardDisplay(dcCard);
  dcCardDisplay.rotation = -90;

  // regY because it's rotated
  dcCardDisplay.x = dcCardDisplay.regY;

  return dcCardDisplay;
}

function createInsuranceCard() {
  var insuranceDisplay = new InsuranceDisplay();
  insuranceDisplay.rotation = -90;

  // regY because it's rotated
  insuranceDisplay.x = insuranceDisplay.regY;

  return insuranceDisplay;
}

module.exports = createjs.promote(Decks, "Container");