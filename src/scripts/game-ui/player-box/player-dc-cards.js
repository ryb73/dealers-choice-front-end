/* global createjs */
/* jshint globalstrict: true */
"use strict";

var constants     = require("../constants"),
    DcCardDisplay = require("../cards/dc-card-display"),
    PlayerHand    = require("./player-hand");

function PlayerDcCards(availWidth, cards, isMe) {
  this._availWidth = availWidth;
  this._isMe = isMe;

  this.PlayerHand_constructor(cards);

  this.setBounds(0, 0, availWidth, constants.dcCardHeight);
}

var p = createjs.extend(PlayerDcCards, PlayerHand);

// Overrides superclass
p._addCards = function(cards) {
  for(var i = 0; i < cards.length; ++i)
    this._addToOpenSlot(new DcCardDisplay());

  this._rearrangeCards();
};

p._getCoordsForCard = function(idx) {
  var cardSpacingFactor = this._getCardSpacingFactor();
  var originX = this._getOriginX(cardSpacingFactor);
  return {
    x: originX + idx * cardSpacingFactor *
        constants.dcCardWidth,
    y: constants.dcCardHeight / 2
  };
};

// Calculates the horizontal space that the cards will take up
// This allows us to determine where we should place the first
// card.
p._getOriginX = function(cardSpacingFactor) {
  var cardsHSpace = cardSpacingFactor * constants.dcCardWidth *
                     (this._cardSlots.length - 1) +
                     constants.dcCardWidth;
  return (this._availWidth - cardsHSpace) / 2 +
          constants.dcCardWidth / 2; // account for regX
};

p._getCardSpacingFactor = function() {
  var idealCSF = (this._isMe) ? 1.25 : 0.75;
  var availCSF = this._availWidth /
                  (constants.dcCardWidth * this._cardSlots.length);

  return Math.min(idealCSF, availCSF);
};

p.makeSpaceForCard = function(transitionTime) {
  this._cardSlots.push(null);
  this._rearrangeCards(transitionTime);
  return this._getCoordsForCard(this._cardSlots.length - 1);
};

module.exports = createjs.promote(PlayerDcCards, "PlayerHand");