/* global Polymer, createjs, $, Decks, PlayerBox */
/* jshint globalstrict: true */
"use strict";

var stage; // assume only one canvas per page
var decks;

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
    this.gameState.users.push(user);
    this.refresh();
  },

  removePlayerAtIndex: function(index) {
    var user = this.gameState.users[index];
    for(var key in user.displayObjects) {
      if(user.displayObjects.hasOwnProperty(key)) {
        stage.removeChild(user.displayObjects[key]);
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
    var carCoords = user.playerBox.makeSpaceForCar(250);
    carCoords.x += user.playerBox.x - decks.x;
    carCoords.y += user.playerBox.y - decks.y;

    var qNewCard = decks.giveCar(carCoords, 250);
    // user.playerBox.putCarInBlankSpace(qNewCard);
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

    if(!user.playerBox) {
      user.playerBox = new PlayerBox(user, idx === 0);
      stage.addChild(user.playerBox);
    }

    user.playerBox.setRotation(rotationDeg);

    user.playerBox.x = coords.x;
    user.playerBox.y = coords.y;
    user.playerBox.rotation = rotationDeg;

    if(this.debugMode) this._textAt(user, idx, coords);
  },

  _textAt: function(user, txt, coords) {
    if(!user.point) {
      user.point = new createjs.Shape();
      user.point.graphics.beginFill("red")
        .drawRect(0, 0, 5, 5);
      stage.addChild(user.point);

      user.pointLabel = new createjs.Text(txt, "16px Arial", "#000");
      stage.addChild(user.pointLabel);
    }

    user.point.x = coords.x - 2;
    user.point.y = coords.y - 2;

    user.pointLabel.x = coords.x;
    user.pointLabel.y = coords.y;
  },

  _getCoordsForPlayer: function(playerIndex) {
    var origin = {
      x: this._width() / 2,
      y: this._height() / 2
    };
    var radius = (this._height() * 0.7) / 2;

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