/* jshint strict: global */
/* global Polymer, DcShell, $ */
"use strict";

var dcConstants  = require("dc-constants"),
    MessageType  = dcConstants.MessageType,
    ResponseCode = dcConstants.ResponseCode,
    q            = require("q"),
    _            = require("lodash");

var canvas, socket;

let proto = {
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
      case MessageType.ChooseOwnCar:
        this._chooseOwnCar(msg);
        break;
      case MessageType.CarSoldToBank:
        this._carSoldToBank(msg);
        break;
      case MessageType.CardPlayed:
        this._cardPlayed(msg);
        break;
      case MessageType.AllowSecondDcCard:
        this._allowSecondDcCard(msg);
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

  _getCarIdxFromId: function(player, carId) {
    return _.findIndex(player.cars, { id: carId });
  },

  _getDcCardIdxFromId: function(player, cardId) {
    return _.findIndex(player.dcCards, { id: cardId });
  },

  _getUserByIdx: function(idx) {
    return this.gameState.users[idx];
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
    if(this._isMe(playerIdx)) {
      canvas.addChat("It's your turn.");
      canvas.getTurnChoice()
        .done(this._sendTurnChoice.bind(this, msg.handlerId));
    } else {
      var playerName = this._getUserByIdx(playerIdx).name;
      canvas.addChat("It's now " + playerName + "'s turn.");
    }
  },

  _sendTurnChoice: function(handlerId, choiceData) {
    var answer = _.cloneDeep(choiceData);
    answer.handlerId = handlerId;

    var msg = {
      cmd: MessageType.Choice,
      answer: answer
    };
    socket.emit("action", msg);
  },

  _allowSecondDcCard: function(msg) {
    canvas.allowSecondDcCard()
      .done(this._sendSecondDcCardChoice.bind(this, msg.handlerId));
  },

  _sendSecondDcCardChoice: function(handlerId, cardId) {
    let msg = {
      cmd: MessageType.Choice,
      answer: {
        handlerId,
        cardId,
        skip: !cardId
      }
    };
    socket.emit("action", msg);
  },

  _chooseOwnCar: function(msg) {
    var playerIdx = this._getPlayerIdxFromId(msg.playerId);
    if(playerIdx !== 0) return;

    canvas.addChat("Select one of your cars.");
    canvas.chooseOwnCar()
      .done(this._sendCarChoice.bind(this, msg.handlerId));
  },

  _sendCarChoice: function(handlerId, carId) {
    var msg = {
      cmd: MessageType.Choice,
      answer: {
        handlerId: handlerId,
        carId: carId
      }
    };

    socket.emit("action", msg);
  },

  _carSoldToBank: function(msg) {
    let playerIdx = this._getPlayerIdxFromId(msg.playerId);
    let user = this._getUserByIdx(playerIdx);

    let name = this._getDisplayableName(playerIdx);
    canvas.addChat(name + " sold #" + msg.carId + " for $" + msg.amount + ".");

    let carIdx = this._getCarIdxFromId(user.player, msg.carId);
    canvas.discardCar(playerIdx, carIdx);
    canvas.giveMoneyFromBank(playerIdx, msg.amount);
  },

  _cardPlayed(msg) {
    let playerIdx = this._getPlayerIdxFromId(msg.playerId);
    let user = this._getUserByIdx(playerIdx);

    let name = this._getDisplayableName(playerIdx);
    canvas.addChat(name + " played " + msg.cardTitle + ".");

    if(this._isMe(playerIdx)) {
      let cardIdx = this._getDcCardIdxFromId(msg.cardId);
      canvas.discardDcCard(playerIdx, cardIdx);
    } else {
      canvas.discardDcCard(playerIdx);
    }
  },

  _getDisplayableName(userIdx) {
    if(userIdx === 0)
      return "You";
    else
      return this._getUserByIdx(userIdx).name;
  },

  _isMe(playerIdx) {
    return playerIdx === 0;
  }
};

Polymer(proto);
