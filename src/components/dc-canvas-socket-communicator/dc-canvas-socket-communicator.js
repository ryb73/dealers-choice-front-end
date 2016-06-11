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
      default:
        console.log("Unexpected message type: " + msg.cmd);
    }
  },

  _dealDcCardToPlayer: function(msg) {
    var playerIdx = this._getPlayerIdxFromId(msg.playerId);
    canvas.giveDcCardFromDeck(playerIdx, msg.dcCard);
  }
});
