/* global createjs */
/* jshint globalstrict: true */
"use strict";

var consts     = require("../constants"),
    CarDisplay = require("../cards/car-display"),
    PlayerHand = require("./player-hand");

var VERT_SPACING  = 10,
    HORIZ_SPACING = 10;

function PlayerCars(cars) {
  this.PlayerHand_constructor(cars);

  this._resetBounds();
}

var p = createjs.extend(PlayerCars, PlayerHand);

function getTotalColumns(numCars) {
  return Math.ceil(Math.sqrt(numCars));
}

function getTotalRows(numCars) {
  return Math.ceil(numCars / getTotalColumns(numCars));
}

function getRowForCar(whichCarIndex, numCars) {
  return Math.floor(whichCarIndex / getTotalColumns(numCars));
}

function getColumnForCar(whichCarIndex, numCars) {
  return whichCarIndex % getTotalColumns(numCars);
}

function getRowWidth(numColumns) {
  return consts.carWidth * numColumns +
         HORIZ_SPACING * (numColumns - 1);
}

function getTotalHeight(numRows) {
  return numRows * consts.carHeight +
         (numRows - 1) * VERT_SPACING;
}

p._getCoordsForCar = function(whichCarIndex, numCars) {
  var column = getColumnForCar(whichCarIndex, numCars);
  var row = getRowForCar(whichCarIndex, numCars);

  var y = (consts.carHeight + VERT_SPACING) * row +
           consts.carHeight / 2; // reg point is in middle

  var totalColumns = getTotalColumns(numCars);
  var rowColumns;
  if(row === getTotalRows(numCars) - 1) { // if last row
    rowColumns = numCars % totalColumns;  // it might be shorter
    if(rowColumns === 0) rowColumns = totalColumns;
  } else {
    rowColumns = totalColumns;
  }

  // Find the width of this particular row. If it's the
  // "short row", we'll start placing cars at an offset
  var rowWidth = getRowWidth(rowColumns);
  var originX = (getRowWidth(totalColumns) - rowWidth) / 2;

  var x = originX + (consts.carWidth + HORIZ_SPACING) * column +
           consts.carWidth / 2;

  // Rotate so that the user can see the car. While this isn't
  // really how players would lay out their cars in the real
  // world, it makes it easier for the current player
  var rotation = 0;
  if(this._rotation >= 90 && this._rotation <= 270)
    rotation = 180;

  return {
    x: x,
    y: y,
    rotation: rotation
  };
};

p._resetBounds = function() {
  var columns = getTotalColumns(this._cardSlots.length);
  var rows = getTotalRows(this._cardSlots.length);

  this.setBounds(0, 0, getRowWidth(columns),
                       getTotalHeight(rows));
};

// Overrides superclass
p._addCards = function(cars) {
  for(var i = 0; i < cars.length; ++i) {
    var dispCar = this._addCar(cars[i]);
    this._addToOpenSlot(dispCar);
  }

  this._rearrangeCars();
};

p._addCar = function(car) {
  var dispCar = new CarDisplay(car);
  dispCar.flip();
  return dispCar;
};

p.makeSpaceForCar = function(transitionTime) {
  var newCarNum = this._cardSlots.length + 1;

  // Resize if necessary
  var newColumns = getTotalColumns(newCarNum);
  var newRows = getTotalRows(newCarNum);
  if(newColumns !== getTotalColumns(newCarNum - 1) ||
     newRows !== getTotalRows(newCarNum - 1))
  {
    this.setBounds(0, 0, getRowWidth(newColumns),
                         getTotalHeight(newRows));
  }

  this._cardSlots.push(null);
  this._rearrangeCars(transitionTime);
  return this._getCoordsForCar(newCarNum - 1, newCarNum);
};

p._rearrangeCars = function(transitionTime) {
  if(transitionTime === undefined) transitionTime = 0;

  var numCars = this._cardSlots.length;

  for(var i = 0; i < this._cardSlots.length; ++i) {
    var dispCar = this._cardSlots[i];
    if(!dispCar) continue;

    createjs.Tween.get(dispCar)
      .to(this._getCoordsForCar(i, numCars),
           transitionTime, createjs.Ease.cubicOut);
  }
};

p.putCarInBlankSpace = function(qNewCar) {
  return qNewCar.then(function(newCar) {
    if(this._openSlotIdx === this._cardSlots.length)
      throw new Error("No open slots in car display");

    if(newCar.parent)
      newCar.parent.removeChild(newCar);

    this._cardSlots[this._openSlotIdx] = newCar;

    var coords = this._getCoordsForCar(this._openSlotIdx,
                  this._cardSlots.length);
    newCar.x = coords.x;
    newCar.y = coords.y;
    newCar.rotation = coords.rotation;
    this.addChild(newCar);

    ++this._openSlotIdx;
  }.bind(this));
};

p.setRotation = function(rotation) {
  this._rotation = rotation;
  this._rearrangeCars();
};

module.exports = createjs.promote(PlayerCars, "PlayerHand");