/* global createjs */
/* jshint globalstrict: true */
"use strict";

var constants = require("../constants");

function PlayerDcCards(availWidth, cards, isMe) {
  this.Container_constructor();

  this.setBounds(0, 0, availWidth, constants.dcCardHeight);
  this.addCards(availWidth, cards, isMe);
}

var p = createjs.extend(PlayerDcCards, createjs.Container);

p.addCards = function(availWidth, cards, isMe) {
  var cardsShape;

  var idealCSF = (isMe) ? 1.25 : 0.75;
  var availableCSF = availWidth /
                      (constants.dcCardWidth * cards.length);

  var cardSpacingFactor = Math.min(idealCSF, availableCSF);

  // Calculate the horizontal space that the cards will take up
  // This allows us to determine where we should place the first
  // card (originX)
  var cardsHSpace = cardSpacingFactor * constants.dcCardWidth *
                     (cards.length - 1) + constants.dcCardWidth;
  var originX = (availWidth - cardsHSpace) / 2;

  cards.forEach(function(card, idx) {
    cardsShape = new createjs.Shape();

    cardsShape.graphics
      .beginFill("#AA0099")
      .beginStroke("black")
      .drawRect(
        originX + idx * cardSpacingFactor * constants.dcCardWidth,
        0, constants.dcCardWidth, constants.dcCardHeight
      );

    this.addChild(cardsShape);
  }.bind(this));
};

module.exports = createjs.promote(PlayerDcCards, "Container");