/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CARD_WIDTH  = 40,
    CARD_HEIGHT = 62;

function DcCardDisplay(availWidth, cards, isMe) {
  this.Container_constructor();

  this.setBounds(0, 0, availWidth, CARD_HEIGHT);
  this.addCards(availWidth, cards, isMe);
}

var p = createjs.extend(DcCardDisplay, createjs.Container);

p.addCards = function(availWidth, cards, isMe) {
  var cardsShape;

  var idealCSF = (this.isMe) ? 1.25 : 0.75;
  var availableCSF = availWidth / (CARD_WIDTH * cards.length);

  var cardSpacingFactor = Math.min(idealCSF, availableCSF);

  // Calculate the horizontal space that the cards will take up
  // This allows us to determine where we should place the first
  // card (originX)
  var cardsHSpace = cardSpacingFactor * CARD_WIDTH *
                     (cards.length - 1) + CARD_WIDTH;
  var originX = (availWidth - cardsHSpace) / 2;

  cards.forEach(function(card, idx) {
    cardsShape = new createjs.Shape();

    cardsShape.graphics
      .beginFill("#AA0099")
      .beginStroke("black")
      .drawRect(
        originX + idx * cardSpacingFactor * CARD_WIDTH,
        0, CARD_WIDTH, CARD_HEIGHT
      );

    this.addChild(cardsShape);
  }.bind(this));
};

module.exports = createjs.promote(DcCardDisplay, "Container");