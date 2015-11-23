/* global createjs */
/* jshint globalstrict: true */
"use strict";

var IMAGE_WIDTH  = 100,
    IMAGE_HEIGHT = 100;

function AvatarDisplay(user) {
  this.Container_constructor();

  this.setup(user);
}

var p = createjs.extend(AvatarDisplay, createjs.Container);

p.setup = function(user) {
  // Consider the bounds of the object to be the picture. Put
  // the reg point at the center.
  this.setBounds(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  this.regX = 50;
  this.regY = 50;

  var rect = new createjs.Shape();
  rect.graphics
    .beginFill("#CCC")
    .beginStroke("#444")
    .drawRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  this.addChild(rect);

  var text = new createjs.Text(user.name, "bold 16px Arial",
                                "black");
  text.textAlign = "center";
  text.textBaseline = "bottom";
  text.x = 50;
  text.y = -10;
  this.addChild(text);
};

module.exports = createjs.promote(AvatarDisplay, "Container");