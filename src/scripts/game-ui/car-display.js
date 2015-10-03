/* global createjs */
/* jshint globalstrict: true */
"use strict";

function CarDisplay(availWidth, cars) {
  this.Container_constructor();

  this.addCars(availWidth, cars);
}

var p = createjs.extend(CarDisplay, createjs.Container);

this.addCars = function(availWidth, cars) {
  var columns = Math.ceil(Math.sqrt(cars.length));

};

module.exports = createjs.promote(CarDisplay, "Container");