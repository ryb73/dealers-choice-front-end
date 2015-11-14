/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CARD_WIDTH    = 62,
    CARD_HEIGHT   = 40,
    VERT_SPACING  = 10,
    HORIZ_SPACING = 10;

function CarDisplay(cars) {
  this.Container_constructor();

  this._carSlots = [];
  this._openSlotIdx = 0;

  this._addCars(cars);
}

var p = createjs.extend(CarDisplay, createjs.Container);

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
  return CARD_WIDTH * numColumns +
         HORIZ_SPACING * (numColumns - 1);
}

function getTotalHeight(numRows) {
  return numRows * CARD_HEIGHT +
         (numRows - 1) * VERT_SPACING;
}

function getCoordsForCar(whichCarIndex, numCars) {
  var column = getColumnForCar(whichCarIndex, numCars);
  var row = getRowForCar(whichCarIndex, numCars);

  var y = (CARD_HEIGHT + VERT_SPACING) * row;

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

  var x = originX + (CARD_WIDTH + HORIZ_SPACING) * column;

  return {
    x: x,
    y: y
  };
}

p._addCars = function(cars) {
  var columns = getTotalColumns(cars.length);
  var rows = getTotalRows(cars.length);

  this.setBounds(0, 0, getRowWidth(columns),
                       getTotalHeight(rows));

  for(var i = 0; i < cars.length; ++i) {
    var carCoords = getCoordsForCar(i, cars.length);
    var dispCar = this._addCar(cars[i], carCoords.x, carCoords.y);
    this._carSlots.push(dispCar);
    this._openSlotIdx++;
  }
};

p._addCar = function(car, x, y) {
  var rect = new createjs.Shape();
  rect.graphics
    .beginStroke("#000")
    .beginFill("#FABA2F")
    .drawRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  rect.x = x;
  rect.y = y;
  this.addChild(rect);

  return rect;
};

p.makeSpaceForCar = function(transitionTime) {
  var newCarNum = this._carSlots.length + 1;

  // Resize if necessary
  var newColumns = getTotalColumns(newCarNum);
  var newRows = getTotalRows(newCarNum);
  if(newColumns !== getTotalColumns(newCarNum - 1) ||
     newRows !== getTotalRows(newCarNum - 1))
  {
    this.setBounds(0, 0, getRowWidth(newColumns),
                         getTotalHeight(newRows));
  }

  this._rearrangeCars(newCarNum, transitionTime);
  this._carSlots.push(null);
  return getCoordsForCar(newCarNum - 1, newCarNum);
};

p._rearrangeCars = function(numCars, transitionTime) {
  for(var i = 0; i < this._carSlots.length; ++i) {
    var dispCar = this._carSlots[i];
    if(!dispCar) continue;

    createjs.Tween.get(dispCar)
      .to(getCoordsForCar(i, numCars), transitionTime, createjs.Ease.cubicOut);
  }
};

p.putCarInBlankSpace = function(qNewCar) {
  // I'm going to finish the promise, but I'm thinking
  // a more "correct" pattern might be to return the promise
  qNewCar.done(function(newCar) {
    if(this._openSlotIdx === this._carSlots.length)
      throw new Error("No open slots in car display");

    if(newCar.parent)
      newCar.parent.removeChild(newCar);

    this._carSlots[this._openSlotIdx] = newCar;

    var coords = getCoordsForCar(this._openSlotIdx,
                  this._carSlots.length);
    newCar.x = coords.x;
    newCar.y = coords.y;
    newCar.rotation = 0;
    this.addChild(newCar);

    ++this._openSlotIdx;
  }.bind(this));
};

module.exports = createjs.promote(CarDisplay, "Container");