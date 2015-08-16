"use strict";

require("webcomponents-lite");
var $  = require("jquery"),
    io = require("socket.io-client");

function DcShell() {
  var socket;

  function setLoggedIn(authInfo) {
    console.log("logged in");
    console.log(authInfo);

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

    socket = io.connect("http://localhost:3000");
    return socket;
  }
  this.getSocket = getSocket;

  function afterFbInit() {
    setLoggedOut();

    FB.getLoginStatus(function(response) {
      statusChange(response);
      FB.Event.subscribe("auth.statusChange", statusChange);
    });
  }
  this.afterFbInit = afterFbInit;
}

window.DcShell = window.DcShell || new DcShell();