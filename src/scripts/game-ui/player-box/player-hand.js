// Abstract class representing a displayable container of cards

/* global createjs */
/* jshint globalstrict: true */
"use strict";

var constants = require("../constants");

function PlayerHand(cardsData) {
  this.Container_constructor();

  this._cardSlots = [];
  this._openSlotIdx = 0;

  this._addCards(cardsData);
}

var p = createjs.extend(PlayerHand, createjs.Container);

p._addToOpenSlot = function(dispCard) {
  if(!this._hasOpenSlot())
    this._cardSlots.push(null);

  this._cardSlots[this._openSlotIdx] = dispCard;
  ++this._openSlotIdx;
  this.addChild(dispCard);
};

p._hasOpenSlot = function() {
  return this._openSlotIdx !== this._cardSlots.length;
};

p._rearrangeCards = function(transitionTime) {
  if(transitionTime === undefined) transitionTime = 0;

  for(var i = 0; i < this._cardSlots.length; ++i) {
    var dispCard = this._cardSlots[i];
    if(!dispCard) continue;

    createjs.Tween.get(dispCard)
      .to(this._getCoordsForCard(i), transitionTime,
        createjs.Ease.cubicOut);
  }
};

p.putCardInBlankSpace = function(qNewCard) {
  return qNewCard.then(function(newCard) {
    if(this._openSlotIdx === this._cardSlots.length)
      throw new Error("No open slots in car display");

    if(newCard.parent)
      newCard.parent.removeChild(newCard);

    this._cardSlots[this._openSlotIdx] = newCard;

    var coords = this._getCoordsForCard(this._openSlotIdx);
    newCard.x = coords.x;
    newCard.y = coords.y;
    newCard.rotation = coords.rotation;
    this.addChild(newCard);

    ++this._openSlotIdx;
  }.bind(this));
};

p._addCards = unimplemented;

function unimplemented() {
  throw new Error("Method not implemented");
}

module.exports = createjs.promote(PlayerHand, "Container");