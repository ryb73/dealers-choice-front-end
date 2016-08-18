/* jshint strict: global */
/* global Polymer, DcShell, alert */
"use strict";

var dcConstants  = require("dc-constants"),
    MessageType  = dcConstants.MessageType,
    ResponseCode = dcConstants.ResponseCode,
    q            = require("q"),
    _            = require("lodash"),
    loadUser     = require("./load-user");

var socket, me;

Polymer({
  is: "dc-lobby",
  properties: {
    authInfo: {
      type: Object,
      value: null
    },

    _messages: {
      type: Array,
      value: null
    },

    _games: {
      type: Array,
      value: null
    },

    _connected: Boolean,

    _inGame: {
      type: Number,
      value: 0
    }
  },

  attached: function() {
    this._messages = [];
    this._games = [];

    this.$.logout.addEventListener("click", function() {
      DcShell.tryLogOut();
    }.bind(this));

    this._showConnectingIndicator("Connecting...");

    socket = DcShell.getSocket();
    this._onConnect = this._onConnect.bind(this);
    socket.on("connect", this._onConnect);

    this._onGameError = this._onGameError.bind(this);
    socket.on("gameError", this._onGameError);

    loadUser("me")
      .done(function(user) {
        me = user;
      });
  },

  detached: function() {
    socket.removeListener("connect", this._onConnect);
    socket.removeListener("action", this._onAction);
    socket.removeListener("gameError", this._onGameError);
  },

  _onGameError: function(msg) {
    alert("Error: " + msg);
  },

  _showConnectingIndicator: function(label) {
    this.$.connectingIndicator.innerHTML = label;
    this.$.connectingIndicator.style.display = "";
    this._connected = false;
  },

  _hideConnectingIndicator: function() {
    this.$.connectingIndicator.style.display = "none";
    this._connected = true;
  },

  _onConnect: function() {
    console.log("lobby: connected");

    this._onAction = this._onAction.bind(this);
    socket.on("action", this._onAction);

    this._showConnectingIndicator("Entering lobby...");

    this._register();
    this._getGameList();
  },

  _register: function() {
    var msg = {
      cmd: MessageType.RegisterUser,
      userId: this.authInfo.userID,
      accessToken: this.authInfo.accessToken
    };
    socket.emit("action", msg, this._onRegister.bind(this));
  },

  _getGameList: function() {
    var msg = { cmd: MessageType.ListGames };
    socket.emit("action", msg, this._listGames.bind(this));
  },

  _listGames: function(response) {
    console.log("listing games", response);

    q.all(response.map(this._denormalizeGameDescription))
      .done(function(gameDescriptions) {
        this._games = gameDescriptions;
      }.bind(this));
  },

  _denormalizeGameDescription: function(gameDescription) {
    var qUsers = _(gameDescription.users).map('id')
      .map(loadUser);

    return q.all(qUsers.value())
      .then(function(fbUsers) {
        _.merge(gameDescription.users, fbUsers);
        return gameDescription;
      });
  },

  _onRegister: function(userIds) {
    console.log("lobby: registered");

    this._hideConnectingIndicator();
  },

  _onAction: function(msg) {
    console.log("received command: " + msg.cmd);

    switch(msg.cmd) {
      case MessageType.ChatSent:
        this._receivedChat(msg);
        break;
      case MessageType.PendingGameUpdated:
        this._pendingGameUpdated(msg);
        break;
      case MessageType.LobbyUpdated:
        this._listGames(msg.games);
        break;
      case MessageType.GameStarted:
        this._gameStarted();
        break;
      default:
        console.log("Unexpected message type: " + msg.cmd);
    }
  },

  _sendMsg: function(e) {
    var msg = {
      cmd: MessageType.Chat,
      message: e.detail
    };

    var localMessage = {
      user: me,
      message: e.detail,
      pending: true
    };
    this.push("_messages", localMessage);

    socket.emit("action", msg,
      this._chatSent.bind(this, localMessage));
  },

  _chatSent: function(message, ackMsg) {
    console.log("chat acknowledeged");
    console.log(message, ackMsg.result === ResponseCode.ChatSent, ackMsg);

    if(ackMsg.result === ResponseCode.ChatSent) {
      message.pending = false;
      this.$.chat.refresh();
    }
  },

  _newGame: function() {
    var msg = { cmd: MessageType.CreateGame };
    socket.emit("action", msg, this._gameCreated.bind(this));
  },

  _joinGame: function(e) {
    var gameId = e.detail;
    var msg = { cmd: MessageType.JoinGame, id: gameId };
    socket.emit("action", msg, this._joinedGame.bind(this));
  },

  _gameCreated: function(response) {
    console.log("create game result: ", response);
    if(response.result !== ResponseCode.CreateOk) {
      alert("Error creating game:\n\n" + JSON.stringify(response));
      return;
    }

    this._denormalizeGameDescription(response.gameDescription)
      .done(function(gameDescription) {
        this._setupPendingGame(gameDescription);
        this.$$("pending-game").isMyGame = true;
      }.bind(this));
  },

  _joinedGame: function(response) {
    console.log("joined game", response);
    if(response.result !== ResponseCode.JoinOk) {
      alert("Error joining game:\n\n" + JSON.stringify(response));
      return;
    }

    this._denormalizeGameDescription(response.gameDescription)
      .done(function(gameDescription) {
        this._setupPendingGame(gameDescription);
        this.$$("pending-game").isMyGame = false;
      }.bind(this));
  },

  _setupPendingGame: function(gameDescription) {
    this._inGame = 1;
    this.$$("pending-game").game = gameDescription;
    this.$$("pending-game").callbacks = { getPresets: this._getPresets.bind(this) };
  },

  _leaveGame: function() {
    socket.emit("action", { cmd: MessageType.Leave }, function() {
      this._inGame = 0;
      this._getGameList();
    }.bind(this));
  },

  _pendingGameUpdated: function(msg) {
    this._denormalizeGameDescription(msg.gameDescription)
      .done(function(gameDescription) {
        this.$$("pending-game").game = gameDescription;
      }.bind(this));
  },

  _startGame: function(e) {
    var presetId = null;
    if(e.detail)
      presetId = e.detail.presetId;

    socket.emit("action", {
      cmd: MessageType.StartGame,
      presetId: presetId
    }, this._startGameAck.bind(this));
  },

  _startGameAck: function(respCode) {
    if(respCode.result === ResponseCode.StartNotEnoughPlayers) {
      alert("The game must have at least 2 players to begin.");
      return;
    } else if(respCode.result !== ResponseCode.StartOk) {
      alert("Unknown error");
      console.log("error: ", respCode.result);
      return;
    }

    this._gameStarted();
  },

  _gameStarted: function() {
    socket.emit("action", { cmd: MessageType.GetState }, function(gameState) {
      this._denormalizeGameDescription(gameState)
        .then(DcShell.enterGameRoom);
    }.bind(this));
  },

  _getPresets: function() {
    var defer = q.defer();

    socket.emit("action", { cmd: MessageType.GetPresets }, function(presets) {
      defer.resolve(presets);
    });

    return defer.promise;
  }
});
