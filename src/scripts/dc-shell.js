/* global FB */

var io          = require("socket.io-client"),
    dcConstants = require("dc-constants"),
    MessageType = dcConstants.MessageType;

var $ = window.$ = require("jquery");
require("webcomponents-lite");

function DcShell() {
  "use strict";

  var socket;

  function setLoggedIn(authInfo) {
    console.log("logged in");

    var lobby = document.createElement("dc-lobby");
    lobby.authInfo = authInfo;

    $("#content").empty().append(lobby);
  }

  function setLoggedOut() {
    console.log("logged out");

    var login = document.createElement("dc-login");
    $("#content").empty().append(login);
  }

  function tryLogIn() {
    FB.login();
  }
  this.tryLogIn = tryLogIn;

  function tryLogOut() {
    FB.logout(function(response) {
      if(socket) {
        var msg = { cmd: MessageType.Disconnect };
        socket.emit("action", msg);
        socket = null;
      }

      setLoggedOut();
    });
  }
  this.tryLogOut = tryLogOut;

  function statusChange(resp) {
    if(resp.status === "connected") {
      setLoggedIn(resp.authResponse);
    } else {
      tryLogIn();
    }
  }

  function getSocket() {
    if(socket) return socket;

    console.log("connecting socket");
    socket = io.connect("http://localhost:3000", { forceNew: true });
    registerSocketEvents();

    return socket;
  }
  this.getSocket = getSocket;

  function registerSocketEvents() {
    socket.on("error", function(err) {
      console.log("connect error", err);
    });

    socket.on("reconnecting", function() {
      console.log("reconnecting");
    });

    socket.on("reconnect_error", function(err) {
      console.log("reconnect error", err);
    });

    socket.on("reconnect_failed", function() {
      console.log("reconnect failed");
    });
  }

  function afterFbInit() {
    setLoggedOut();

    FB.getLoginStatus(function(response) {
      statusChange(response);
      FB.Event.subscribe("auth.statusChange", statusChange);
    });
  }
  this.afterFbInit = afterFbInit;

  function enterGameRoom(initialGameState) {
    console.log("entering game room");

    var canvas = document.createElement("dc-canvas-socket-communicator");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.gameState = initialGameState;

    $("#content").empty().append(canvas);
  }
  this.enterGameRoom = enterGameRoom;
}

window.DcShell = window.DcShell || new DcShell();