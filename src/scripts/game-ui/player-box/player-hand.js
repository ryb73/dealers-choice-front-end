// Abstract class representing a displayable container of cards

/* global createjs */
/* jshint globalstrict: true */
"use strict";

function PlayerHand(cardsData) {
  this.Container_constructor();

  this._cardSlots = [];
  this._openSlotIdx = 0;

  this._addCards(cardsData);
}

var p = createjs.extend(PlayerHand, createjs.Container);
createjs.EventDispatcher.initialize(p);

p._addToOpenSlot = function(dispCard) {
  if(!this._hasOpenSlot())
    this._cardSlots.push(null);

  dispCard.on("rollover", this._cardMouseOver.bind(this, this._openSlotIdx));
  dispCard.on("rollout", this._cardMouseOut.bind(this, this._openSlotIdx));

  this._cardSlots[this._openSlotIdx++] = dispCard;
  this.addChild(dispCard);
};

p._cardMouseOver = function(idx) {
  this.dispatchEvent({
    type: "card-mouseover",
    cardIndex: idx
  });
};

p._cardMouseOut = function(idx) {
  this.dispatchEvent({
    type: "card-mouseout",
    cardIndex: idx
  });
};

p._hasOpenSlot = function() {
  return this._openSlotIdx !== this._cardSlots.length;
};

p._rearrangeCards = function(transitionTime) {
  if(transitionTime === undefined) transitionTime = 0;

  for(var i = 0; i < this._cardSlots.length; ++i) {
    var dispCard = this._cardSlots[i];
    if(!dispCard) continue;

    var coords = this._getCoordsForCard(i);
    randomizeCoords(coords);

    createjs.Tween.get(dispCard, { override: true })
      .to(coords, transitionTime,
        createjs.Ease.cubicOut);
  }
};

// Randomize coords a bit more a slightly more realistic look
function randomizeCoords(coords) {
  coords.x += (Math.random() * 9) - 4;
  coords.y += (Math.random() * 9) - 4;
  coords.rotation += (Math.random() * 5) - 2;
}

p.makeSpaceForCard = function(transitionTime) {
  this._cardSlots.push(null);
  this._rearrangeCards(transitionTime);
  return this._getCoordsForCard(this._cardSlots.length - 1);
};

p.putCardInBlankSpace = function(qNewCard) {
  return qNewCard.then(function(newCard) {
    if(this._openSlotIdx === this._cardSlots.length)
      throw new Error("No open slots in car display");

    if(newCard.parent)
      newCard.parent.removeChild(newCard);

    var coords = this._getCoordsForCard(this._openSlotIdx);
    newCard.x = coords.x;
    newCard.y = coords.y;
    newCard.rotation = coords.rotation;

    this._addToOpenSlot(newCard);
  }.bind(this));
};

p._addCards = unimplemented;

function unimplemented() {
  throw new Error("Method not implemented");
}

module.exports = createjs.promote(PlayerHand, "Container");