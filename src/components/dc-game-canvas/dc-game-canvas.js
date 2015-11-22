/* global Polymer, createjs, $, Decks, PlayerBox */
/* jshint globalstrict: true */
"use strict";

var stage; // assume only one canvas per page
var decks;

// Given an object and point relating to that object,
// returns a set of coords representing the same point with
// respect to the parent.
// TODO: refactor out
function normalizeCoords(dispObj, coords) {
  var focalAngleRad = dispObj.rotation * Math.PI / 180;
  var oppositeRad = (Math.PI - focalAngleRad) / 2;

  // Distance from register point to coords
  var relX = coords.x - dispObj.regX;
  var relY = dispObj.regY - coords.y; // opposite of cartesian
  var distFromFocal = Math.sqrt(Math.pow(relX, 2) +
                                Math.pow(relY, 2));
  if(relX < 0) distFromFocal = -distFromFocal;

  // Distance between the relative and normalized point
  var pointDistance;
  if(oppositeRad !== 0)
    pointDistance = distFromFocal * Math.sin(focalAngleRad) /
                     Math.sin(oppositeRad);
  else
    pointDistance =  distFromFocal * 2;

  var totalRelativeRad = Math.asin(relY / distFromFocal);

  var xRad = (Math.PI / 2) - focalAngleRad - oppositeRad +
              totalRelativeRad;

  var x = Math.sin(xRad) * pointDistance +
           coords.x - dispObj.regX + dispObj.x;
  var y = Math.cos(xRad) * pointDistance +
           coords.y - dispObj.regY + dispObj.y;

  var rotation = coords.rotation || 0;
  rotation = coords.rotation + dispObj.rotation;

  return {
    x: x,
    y: y,
    rotation: rotation
  };
}

Polymer({
  is: "dc-game-canvas",
  properties: {
    gameState: {
      type: Object,
      value: null
    },

    debugMode: Boolean
  },

  attached: function() {
    var canvas = this.$.gameCanvas;
    stage = new createjs.Stage(canvas);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);

    this._setCanvasSize();
    $(window).resize(this._setCanvasSize.bind(this));

    this._setup();
  },

  refresh: function() {
    this._refreshPlayers();
    stage.update();
  },

  addPlayer: function(user) {
    user.dispObjs = user.dispObjs || {};
    this.gameState.users.push(user);
    this.refresh();
  },

  removePlayerAtIndex: function(index) {
    var user = this.gameState.users[index];
    for(var key in user.dispObjs) {
      if(user.dispObjs.hasOwnProperty(key)) {
        stage.removeChild(user.dispObjs[key]);
      }
    }

    this.gameState.users.splice(index, 1);
    this.refresh();
  },

  giveCarFromDeck: function(userIdx, car) {
    var user = this.gameState.users[userIdx];

    // Make room for the new car and get the new car's
    // coords. The coords will be in relation to the
    // player box; we want them in relation to the decks.
    var playerBox = user.dispObjs.playerBox;
    var carCoords = playerBox.makeSpaceForCar(2500);
    carCoords = normalizeCoords(playerBox, carCoords);
    carCoords.x -= decks.x - decks.regX;
    carCoords.y -= decks.y - decks.regY;

    if(playerBox.rotation >= 90 && playerBox.rotation <= 270)
      carCoords.rotation += 180;

    var qNewCard = decks.giveCar(car, carCoords, 2500);
    playerBox.putCarInBlankSpace(qNewCard);
  },

  _setup: function() {
    this._createPlayers();
    this._createDecks();
    stage.update();
  },

  _createPlayers: function() {
    this._refreshPlayers();
  },

  _createDecks: function() {
    decks = new Decks();
    decks.x = 5;
    decks.y = this._height() / 2;
    stage.addChild(decks);
  },

  _refreshPlayers: function() {
    this.gameState.users.forEach(
      this._positionPlayer.bind(this)
    );
  },

  _positionPlayer: function(user, idx) {
    var coords = this._getCoordsForPlayer(idx);
    var rotationDeg = coords.rotationRad *
                    180 / Math.PI;

    var playerBox = user.dispObjs.playerBox;
    if(!playerBox) {
      playerBox = user.dispObjs.playerBox =
        new PlayerBox(user, idx === 0);
      stage.addChildAt(playerBox, 0);
    }

    playerBox.setRotation(rotationDeg);

    playerBox.x = coords.x;
    playerBox.y = coords.y;
    playerBox.rotation = rotationDeg;

    if(this.debugMode) this._textAt(user, idx, coords);
  },

  _textAt: function(user, txt, coords) {
    if(!user.dispObjs.point) {
      user.dispObjs.point = new createjs.Shape();
      user.dispObjs.point.graphics.beginFill("red")
        .drawRect(0, 0, 5, 5);
      stage.addChild(user.dispObjs.point);

      user.dispObjs.pointLabel = new createjs.Text(txt, "16px Arial", "#000");
      stage.addChild(user.dispObjs.pointLabel);
    }

    user.dispObjs.point.x = coords.x - 2;
    user.dispObjs.point.y = coords.y - 2;

    user.dispObjs.pointLabel.x = coords.x;
    user.dispObjs.pointLabel.y = coords.y;
  },

  _getCoordsForPlayer: function(playerIndex) {
    var origin = {
      x: this._width() / 2,
      y: this._height() / 2 + 25
    };
    var radius = (this._height() * 0.65) / 2;

    var anglePerPlayer =
      2 * Math.PI / this.gameState.users.length;

    var angle = (anglePerPlayer * playerIndex) +
      Math.PI / 2; // begin at bottom of screen

    return {
      x: origin.x + Math.cos(angle) * radius,
      y: origin.y + Math.sin(angle) * radius,

      // Our starting angle is Math.PI / 2, at which point
      // we have zero rotation. As we go around the circle,
      // the player box should rotate at the same rate
      rotationRad: angle - Math.PI / 2
    };
  },

  _setCanvasSize: function() {
    this.$.gameCanvas.width = 0;
    this.$.gameCanvas.height = 0;
    this.$.gameCanvas.width = this.clientWidth;
    this.$.gameCanvas.height = this.clientHeight;
    this.refresh();
  },

  _width: function() {
    return this.$.gameCanvas.width;
  },

  _height: function() {
    return this.$.gameCanvas.height;
  }
});