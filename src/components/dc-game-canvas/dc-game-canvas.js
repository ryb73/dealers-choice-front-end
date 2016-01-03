/* global Polymer, createjs, $ */
/* jshint globalstrict: true */
"use strict";

var q                  = require("q"),
    gameUi             = require("dc-game-ui"),
    Decks              = gameUi.Decks,
    PlayerBox          = gameUi.PlayerBox,
    LoadingSplash      = gameUi.LoadingSplash,
    CarDisplay         = gameUi.CarDisplay,
    assets             = gameUi.assets,
    AnimationThrottler = require("./animation-throttler");

var stage; // assume only one canvas per page
var decks;
var displayedCard;
var animationThrottler = new AnimationThrottler();

// Given an object and point relating to that object,
// returns a set of coords representing the same point with
// respect to the parent.
// TODO: refactor out
// TODO: provide more explanation, visuals?
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
  rotation = rotation + dispObj.rotation;

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

    loaded: Boolean,
    debugMode: Boolean
  },

  attached: function() {
    var canvas = this.$.gameCanvas;
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);

    this._setCanvasSize();
    $(window).resize(this._setCanvasSize.bind(this));

    this._setup();
  },

  refresh: function() {
    if(this.loaded) {
      this._refreshDeck();
      this._refreshPlayers();
      stage.update();
    }
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
    animationThrottler.requestAnim(
      this._gcfdImpl.bind(this, userIdx, car)
    ).done();
  },

  _gcfdImpl: function(userIdx, car) {
    var user = this.gameState.users[userIdx];

    // Make room for the new car and get the new car's
    // coords. The coords will be in relation to the
    // player box; we want them in relation to the decks.
    var playerBox = user.dispObjs.playerBox;
    var carCoords = playerBox.makeSpaceForCar(500);
    carCoords = normalizeCoords(playerBox, carCoords);
    carCoords.x -= decks.x - decks.regX;
    carCoords.y -= decks.y - decks.regY;

    var qNewCard = decks.giveCar(car, carCoords, 500);
    return playerBox.putCarInBlankSpace(qNewCard);
  },

  giveDcCardFromDeck: function(userIdx, dcCard) {
    animationThrottler.requestAnim(
      this._gdcfdImpl.bind(this, userIdx, dcCard)
    ).done();
  },

  //TODO: this looks very similar to giveCarFromDeck. refactor?
  _gdcfdImpl: function(userIdx, dcCard) {
    var user = this.gameState.users[userIdx];

    // Make room for the new card
    var playerBox = user.dispObjs.playerBox;
    var cardCoords = playerBox.makeSpaceForDcCard(500);
    cardCoords = normalizeCoords(playerBox, cardCoords);
    cardCoords.x -= decks.x - decks.regX;
    cardCoords.y -= decks.y - decks.regY;

    var qNewCard = decks.giveDcCard(dcCard, cardCoords, 500,
                                     this._isMe(userIdx));
    return playerBox.putDcCardInBlankSpace(qNewCard);
  },

  // Determines whether the player at the given index
  // is the current (i.e. local) player
  _isMe: function(idx) {
    return idx === 0;
  },

  _setup: function() {
    this._createBackground();

    this._loadAssets()
      // .catch(function() {
        //TODO: log error
      // })
      .done(function() {
        this.loaded = true;

        this._createPlayers();
        this._createDecks();
        stage.update();
      }.bind(this));
  },

  _loadAssets: function() {
    var loadingSplash = new LoadingSplash();
    loadingSplash.x = this._width() / 2;
    loadingSplash.y = this._height() / 2;
    stage.addChild(loadingSplash);
    stage.update();

    return loadingSplash.load()
      .tap(function() {
        stage.removeChild(loadingSplash);
      });
  },

  _createBackground: function() {
    var bgBmp = new createjs.Bitmap("/images/game-bg.png");
    stage.addChildAt(bgBmp, 0);
  },

  _createPlayers: function() {
    this._refreshPlayers();
  },

  _createDecks: function() {
    decks = new Decks();
    this._refreshDeck();
    stage.addChild(decks);
  },

  _refreshDeck: function() {
    decks.x = 5;
    decks.y = this._height() / 2;
  },

  _refreshPlayers: function() {
    this.gameState.users.forEach(
      this._positionPlayer.bind(this)
    );

    this._positionDisplayedCard();
  },

  _positionPlayer: function(user, idx) {
    var coords = this._getCoordsForPlayer(idx);
    var rotationDeg = coords.rotationRad *
                    180 / Math.PI;

    var playerBox = user.dispObjs.playerBox;
    if(!playerBox) {
      playerBox = this._addNewPlayerToStage(user, idx);
    }

    playerBox.setRotation(rotationDeg);

    playerBox.x = coords.x;
    playerBox.y = coords.y;
    playerBox.rotation = rotationDeg;

    if(this.debugMode) this._textAt(user, idx, coords);
  },

  _addNewPlayerToStage: function(user, idx) {
    var playerBox = user.dispObjs.playerBox =
      new PlayerBox(user, idx === 0, this.debugMode);
    stage.addChildAt(playerBox, 1);

    playerBox.on("car-mouseover", this._carMouseOver.bind(this, idx));
    playerBox.on("car-mouseout", this._carMouseOut.bind(this, idx));
    playerBox.on("dc-card-mouseover", this._dcCardMouseOver.bind(this, idx));
    playerBox.on("dc-card-mouseout", this._dcCardMouseOut.bind(this, idx));

    return playerBox;
  },

  _carMouseOver: function(userIdx, carEvent) {
    console.log("over: ", userIdx, carEvent.carIndex);
    this._showCar(this._getPlayer(userIdx).cars[carEvent.carIndex]);
  },

  _carMouseOut: function(userIdx, carEvent) {
    stage.removeChild(displayedCard);
    displayedCard = null;
  },

  _dcCardMouseOver: function(userIdx, cardEvent) {
    console.log("over: ", userIdx, cardEvent.cardIndex);
  },

  _dcCardMouseOut: function(userIdx, cardEvent) {
    console.log("out: ", userIdx, cardEvent.cardIndex);
  },

  // Gets the player object for the specified user
  _getPlayer: function(userIdx) {
    return this.gameState.users[userIdx].player;
  },

  _showCar: function(car) {
    if(displayedCard)
      stage.removeChild(displayedCard);

    displayedCard = new CarDisplay(car, true);
    this._positionDisplayedCard();
    stage.addChild(displayedCard);
  },

  _positionDisplayedCard: function() {
    if(displayedCard) {
      var coords = this._getCenter();
      displayedCard.x = coords.x;
      displayedCard.y = coords.y;
    }
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

  _getCenter: function() {
    return {
      x: this._width() / 2,
      y: this._height() / 2 + 25
    };
  },

  _getCoordsForPlayer: function(playerIndex) {
    var origin = this._getCenter();

    var majorRad = (this._width() * 0.6) / 2;
    var minorRad = (this._height() * 0.6) / 2;

    var anglePerPlayer =
      2 * Math.PI / this.gameState.users.length;

    var angle = (anglePerPlayer * playerIndex) +
      Math.PI / 2; // begin at bottom of screen

    return {
      x: origin.x + Math.cos(angle) * majorRad,
      y: origin.y + Math.sin(angle) * minorRad,

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