/* global createjs */
/* jshint globalstrict: true */
"use strict";

var consts = require("./constants");

var VERT_SPACING  = 10,
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

  var rotation = 0;
  if(this._rotation >= 90 && this._rotation <= 270)
    rotation = 180;

  return {
    x: x,
    y: y,
    rotation: rotation
  };
};

p._addCars = function(cars) {
  var columns = getTotalColumns(cars.length);
  var rows = getTotalRows(cars.length);

  this.setBounds(0, 0, getRowWidth(columns),
                       getTotalHeight(rows));

  for(var i = 0; i < cars.length; ++i) {
    var carCoords = this._getCoordsForCar(i, cars.length);
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
    .drawRect(0, 0, consts.carWidth, consts.carHeight);

  rect.x = x;
  rect.y = y;
  rect.regX = consts.carWidth / 2;
  rect.regY = consts.carHeight / 2;
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
  return this._getCoordsForCar(newCarNum - 1, newCarNum);
};

p._rearrangeCars = function(numCars, transitionTime) {
  if(numCars === undefined) numCars = this._carSlots.length;
  if(transitionTime === undefined) transitionTime = 0;

  for(var i = 0; i < this._carSlots.length; ++i) {
    var dispCar = this._carSlots[i];
    if(!dispCar) continue;

    createjs.Tween.get(dispCar)
      .to(this._getCoordsForCar(i, numCars),
           transitionTime, createjs.Ease.cubicOut);
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

    var coords = this._getCoordsForCar(this._openSlotIdx,
                  this._carSlots.length);
    newCar.x = coords.x;
    newCar.y = coords.y;
    newCar.rotation = 0;
    this.addChild(newCar);

    ++this._openSlotIdx;
  }.bind(this));
};

p.setRotation = function(rotation) {
  this._rotation = rotation;
  this._rearrangeCars();
};

module.exports = createjs.promote(CarDisplay, "Container");