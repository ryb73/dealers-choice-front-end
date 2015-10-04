/* global createjs */
/* jshint globalstrict: true */
"use strict";

var CARD_WIDTH    = 62,
    CARD_HEIGHT   = 40,
    VERT_SPACING  = 10,
    HORIZ_SPACING = 10;

function CarDisplay(cars) {
  this.Container_constructor();

  this.addCars(cars);
}

var p = createjs.extend(CarDisplay, createjs.Container);

p.addCars = function(cars) {
  var columns = Math.ceil(Math.sqrt(cars.length));
  var rows = Math.ceil(cars.length / columns);

  var totalWidth = columns * CARD_WIDTH +
                   (columns - 1) * HORIZ_SPACING;
  var totalHeight = rows * CARD_HEIGHT +
                    (rows - 1) * VERT_SPACING;
  this.setBounds(0, 0, totalWidth, totalHeight);

  var remainingCars = cars.slice();
  for(var i = 0; i < rows; ++i) {
    this.addRow(remainingCars, columns, totalWidth,
                (CARD_HEIGHT + VERT_SPACING) * i);
  }
};

p.addRow = function(cars, columns, totalWidth, rowY) {
  var carsToTake = Math.min(columns, cars.length);
  var rowWidth = carsToTake * CARD_WIDTH +
                 (carsToTake - 1) * HORIZ_SPACING;
  var originX = (totalWidth - rowWidth) / 2;

  var car;
  for(var i = 0; i < carsToTake; ++i) {
    car = cars.pop();
    this.addCar(car, originX + (CARD_WIDTH + HORIZ_SPACING) * i,
                  rowY);
  }
};

p.addCar = function(car, x, y) {
  var rect = new createjs.Shape();
  rect.graphics
    .beginStroke("#000")
    .beginFill("#FABA2F")
    .drawRect(x, y, CARD_WIDTH, CARD_HEIGHT);
  this.addChild(rect);
};

module.exports = createjs.promote(CarDisplay, "Container");