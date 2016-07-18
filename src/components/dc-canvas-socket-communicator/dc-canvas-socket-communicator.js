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
    },
    startedRps: Boolean
  },

  attached: function() {
    socket = DcShell.getSocket();
    canvas = this.$.canvas;
    canvas.callbacks = this._generateCallbacks();

    this._onAction = this._onAction.bind(this);
    socket.on("action", this._onAction);
  },

  detached: function() {
    socket.removeListener("action", this._onAction);
  },

  _generateCallbacks: function() {
    return {
      canPlayDcCard: this._canPlayDcCard.bind(this)
    };
  },

  _canPlayDcCard: function(id) {
    var defer = q.defer();

    socket.emit(
      "action",
      {
        cmd: MessageType.CanPlayDcCard,
        cardId: id
      },
      function(res) { defer.resolve(res); }
    );

    return defer.promise;
  },

  _canvasLoaded: function() {
    socket.emit("action", { cmd: MessageType.ActuallyReady });
  },

  _onAction: function(msg) {
    switch(msg.cmd) {
      case MessageType.DealDcCardToPlayer:
        this._dealDcCardToPlayer(msg);
        break;
      case MessageType.DealCarToPlayer:
        this._dealCarToPlayer(msg);
        break;
      case MessageType.DealInsuranceToPlayer:
        this._dealInsuranceToPlayer(msg);
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
      case MessageType.GetTurnChoice:
        this._handleTurnChoice(msg);
        break;
      default:
        console.log("Unexpected message type: " + msg.cmd);
    }
  },

  _dealDcCardToPlayer: function(msg) {
    var playerIdx = this._getPlayerIdxFromId(msg.playerId);
    canvas.giveDcCardFromDeck(playerIdx, msg.dcCard);
  },

  _dealCarToPlayer: function(msg) {
    var playerIdx = this._getPlayerIdxFromId(msg.playerId);
    canvas.giveCarFromDeck(playerIdx, msg.car);
  },

  _dealInsuranceToPlayer: function(msg) {
    var playerIdx = this._getPlayerIdxFromId(msg.playerId);
    canvas.giveInsuranceFromDeck(playerIdx, msg.insurance);
  },

  _getPlayerIdxFromId: function(playerId) {
    return _.findIndex(this.gameState.users, {
      player: {
        id: playerId
      }
    });
  },

  _doRockPaperScissors: function(msg) {
    if(!this.startedRps) {
      this.startedRps = true;
      var chat = "Let's play Rock, Paper, Scissors to see who goes first.";
      if(this.gameState.users.length === 2)
        chat += " Best two out of three!";
      canvas.addChat(chat);
    }

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
      }.bind(this));
  },

  _beginRpsCountdown: function() {
    canvas.beginRpsCountdown();
  },

  _handleRpsConclusion: function(msg) {
    canvas.supplyRpsAnswers(msg.answers, msg.survivors, msg.conclusion);
  },

  _handleTurnChoice: function(msg) {
    var playerIdx = this._getPlayerIdxFromId(msg.playerId);
    if(playerIdx === 0) {
      canvas.addChat("It's your turn.");
      canvas.getTurnChoice()
        .done(this._sendTurnChoice.bind(this, msg.handlerId));
    } else {
      var playerName = this.gameState.users[playerIdx].name;
      canvas.addChat("It's now " + playerName + "'s turn.");
    }
  },

  _sendTurnChoice: function(handlerId, choiceData) {
    var answer = _.cloneDeep(choiceData);
    choiceData.handlerId = handlerId;

    var msg = {
      cmd: MessageType.Choice,
      answer: answer
    };
    socket.emit("action", msg);
  }
});
