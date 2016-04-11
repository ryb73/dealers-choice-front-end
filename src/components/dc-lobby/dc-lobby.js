/* jshint strict: global */
/* global Polymer, DcShell */
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

    _users: {
      type: Array,
      value: null,
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
    this._users = [];
    this._messages = [];
    this._games = [];

    this.$.logout.addEventListener("click", function() {
      DcShell.tryLogOut();
    }.bind(this));

    this._showConnectingIndicator("Connecting...");

    socket = DcShell.getSocket();
    socket.on("connect", this._onConnect.bind(this));

    loadUser("me")
      .done(function(user) {
        me = user;
      });
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

    socket.on("action", this._onAction.bind(this));

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

    userIds = _.without(userIds, this.authInfo.userID);
    var qUsers = userIds.map(function(userId) {
      return loadUser(userId);
    });

    q.all(qUsers)
      .done(function(users) {
        console.log("loaded users");
        this._users = users;
      }.bind(this));

    this._hideConnectingIndicator();
  },

  _onAction: function(msg) {
    console.log("received command: " + msg.cmd);

    switch(msg.cmd) {
      case MessageType.UserEnteredLobby:
        this._userEnteredLobby(msg);
        break;
      case MessageType.UserLeftLobby:
        this._userLeftLobby(msg);
        break;
      case MessageType.ChatSent:
        this._receivedChat(msg);
        break;
      default:
        console.log("Unexpected message type: " + msg.cmd);
    }
  },

  _userEnteredLobby: function(msg) {
    console.log("user entered lobby: " + msg.userId);

    loadUser(msg.userId)
      .done(function(user) {
        this.push("_users", user);
      }.bind(this));
  },

  _userLeftLobby: function(msg) {
    console.log("user left lobby: " + msg.userId);

    var idx = this._userIdxById(msg.userId);
    this.splice("_users", idx, 1);
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

  _receivedChat: function(msg) {
    var fromUser = this._getUserById(msg.userId);
    this.push("_messages", {
      user: fromUser,
      message: msg.message
    });
  },

  _userIdxById: function(id) {
    return _.findIndex(this._users, function(user) {
      return user.id === id;
    });
  },

  _getUserById: function(id) {
    return this._users[this._userIdxById(id)];
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
        this._inGame = 1;
        this.$$("pending-game").game = gameDescription;
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
        this._inGame = 1;
        this.$$("pending-game").game = gameDescription;
      }.bind(this));
  },

  _showPendingGame: function() {

  }
});