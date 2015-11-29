/* global createjs */
/* jshint globalstrict: true */
"use strict";

var constants = require("../constants");

function PlayerDcCards(availWidth, cards, isMe) {
  this.Container_constructor();

  this.setBounds(0, 0, availWidth, constants.dcCardHeight);

  this._availWidth = availWidth;
  this._isMe = isMe;
  this._cardSlots = [];
  this._openSlotIdx = 0;
  this._addCards(cards);
}

var p = createjs.extend(PlayerDcCards, createjs.Container);

p._addCards = function(cards) {
  for(var i = 0; i < cards.length; ++i)
    this._cardSlots.push(null);

  var cardSpacingFactor = this._getCardSpacingFactor();
  var originX = this._getOriginX(cardSpacingFactor);

  cards.forEach(function(card, idx) {
    this._cardSlots[idx] = new createjs.Shape();

    this._cardSlots[idx].graphics
      .beginFill("#AA0099")
      .beginStroke("black")
      .drawRect(
        0, 0, constants.dcCardWidth, constants.dcCardHeight
      );

    this._cardSlots[idx].regX = constants.dcCardWidth / 2;
    this._cardSlots[idx].regY = constants.dcCardHeight / 2;
    this._cardSlots[idx].x = originX + idx * cardSpacingFactor *
                              constants.dcCardWidth;
    this._cardSlots[idx].y = this._cardSlots[idx].regY;

    this.addChild(this._cardSlots[idx]);
    ++this._openSlotIdx;
  }.bind(this));
};

p._rearrangeCards = function(transitionTime) {
  for(var i = 0; i < this._cardSlots.length; ++i) {
    var dispCard = this._cardSlots[i];
    if(!dispCard) continue;

    createjs.Tween.get(dispCard)
      .to({
            x: this._getCoordsForCard(i).x
          }, transitionTime, createjs.Ease.cubicOut);
  }
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

//TODO: this totally needs to be extracted into a superclass
p.putCardInBlankSpace = function(qNewCard) {
  return qNewCard.then(function(newCard) {
    if(this._openSlotIdx === this._cardSlots.length)
      throw new Error("No open slots in car display");

    if(newCard.parent)
      newCard.parent.removeChild(newCard);

    this._cardSlots[this._openSlotIdx] = newCard;

    var coords = this._getCoordsForCard(this._openSlotIdx,
                  this._cardSlots.length);
    newCard.x = coords.x;
    newCard.y = coords.y;
    newCard.rotation = coords.rotation;
    this.addChild(newCard);

    ++this._openSlotIdx;
  }.bind(this));
};

module.exports = createjs.promote(PlayerDcCards, "Container");