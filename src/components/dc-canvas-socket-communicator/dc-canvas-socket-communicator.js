/* jshint strict: global */
/* global Polymer, DcShell, $ */
"use strict";

var dcConstants  = require("dc-constants"),
    MessageType  = dcConstants.MessageType,
    ResponseCode = dcConstants.ResponseCode,
    q            = require("q"),
    _            = require("lodash");

var canvas, socket;

Polymer({
  is: "dc-canvas-socket-communicator",
  properties: {
    gameState: {
      type: Object,
      value: null
    }
  },

  attached: function() {
    socket = DcShell.getSocket();
    canvas = this.$.canvas;

    this._onAction = this._onAction.bind(this);
    socket.on("action", this._onAction);
  },

  detached: function() {
    socket.removeListener("action", this._onAction);
  },

  _canvasLoaded: function() {
    socket.emit("action", { cmd: MessageType.ActuallyReady });
  },

  _onAction: function(msg) {
    switch(msg.cmd) {
      case MessageType.DealCardToPlayer:
        this._dealDcCardToPlayer(msg);
        break;
      case MessageType.RockPaperScissors:
        this._doRockPaperScissors(msg);
        break;
      case MessageType.RpsCountdown:
        this._beginRpsCountdown();
        break;
      case MessageType.RpsConclusion:
        this._handleRpsConclusion(msg);
        break;
      default:
        console.log("Unexpected message type: " + msg.cmd);
    }
  },

  _dealDcCardToPlayer: function(msg) {
    var playerIdx = this._getPlayerIdxFromId(msg.playerId);
    canvas.giveDcCardFromDeck(playerIdx, msg.dcCard);
  },

  _doRockPaperScissors: function(msg) {
    canvas.getRockPaperScissorsChoice()
      .done(function(move) {
        var newMsg = {
          cmd: MessageType.Choice,
          answer: {
            handlerId: msg.handlerId,
            move: move
          }
        };

        socket.emit("action", newMsg);

        this.currentRpsMove = move; // because ughhhhh
      }.bind(this));
  },

  _beginRpsCountdown: function() {
    canvas.beginRpsCountdown();
  },

  _handleRpsConclusion: function(msg) {
    canvas.supplyRpsAnswers(msg.answers, msg.survivors, msg.conclusion);
  }
});
