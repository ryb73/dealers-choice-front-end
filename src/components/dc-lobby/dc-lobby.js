"use strict";

var dcConstants = require("dc-constants"),
    MessageType = dcConstants.MessageType,
    q           = require("q"),
    _           = require("lodash"),
    loadUser    = require("./load-user");

var socket;

Polymer({
  is: "dc-lobby",
  properties: {
    authInfo: {
      type: Object,
      value: null
    },
    users: {
      type: Array,
      value: []
    }
  },

  attached: function() {
    this.$.logout.addEventListener("click", function() {
      DcShell.tryLogOut();
    });

    this._showConnectingIndicator("Connecting...");

    socket = DcShell.getSocket();
    socket.on("connect", this._onConnect.bind(this));
  },

  _showConnectingIndicator: function(label) {
    this.$.connectingIndicator.innerHTML = label;
    this.$.connectingIndicator.style.display = "";
  },

  _hideConnectingIndicator: function() {
    this.$.connectingIndicator.style.display = "none";
  },

  _onConnect: function() {
    console.log("lobby: connected");

    socket.on("action", this._onAction.bind(this));

    this._showConnectingIndicator("Entering lobby...");

    var msg = {
      cmd: MessageType.RegisterUser,
      userId: this.authInfo.userID,
      accessToken: this.authInfo.accessToken
    };
    socket.emit("action", msg, this._onRegister.bind(this));
  },

  _onRegister: function(userIds) {
    console.log("lobby: registered");

    userIds = _.remove(userIds, this.authInfo.userId);
    var qUsers = userIds.map(function(userId) {
      return loadUser(userId);
    });

    q.all(qUsers)
      .done(function(users) {
        console.log("loaded users");
        this.users = users;
      }.bind(this));

    this._hideConnectingIndicator();
  },

  _onAction: function(msg) {
    switch(msg.cmd) {
      case MessageType.UserEnteredLobby:
        this._userEnteredLobby(msg);
        break;
      default:
        console.log("Unexpected message type: " + msg.cmd);
    }
  },

  _userEnteredLobby: function(msg) {
    console.log("user entered lobby: " + msg.userId);

    loadUser(msg.userId)
      .done(function(user) {
        this.push("users", user);
      }.bind(this));
  }
});