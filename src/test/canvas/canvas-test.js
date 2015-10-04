var $ = window.$ = require("jquery");
require("webcomponents-lite");
require("../../scripts/game-ui");

$(function() {
  "use strict";

  var canvas = document.createElement("dc-game-canvas");
  canvas.gameState = {
    users: [
      {
        player: {
          dcCards: ["","","","",""],
          cars: ["", "", ""],
          insurances: ["", ""],
        }
      },

      {
        player: {
          dcCards: ["","","","",""],
          cars: ["", "", ""],
          insurances: ["", ""],
        }
      },

      {
        player: {
          dcCards: ["","","","",""],
          cars: ["", "", ""],
          insurances: ["", ""],
        }
      }
    ]
  };

  document.getElementById("content").appendChild(canvas);

  $("#cmdBox").keypress(function(event) {
    if(event.which === 13) {
      handleCommand($(this).val());
      $(this).val("");
    }
  });

  function handleCommand(cmd) {
    var args = cmd.split("/");
    if(args[0] === "rp") {
      removePlayer(args[1]);
    } else if(args[0] === "ap") {
      addPlayer();
    } else if(args[0] === "hs") {
      setHandSize(args[1], args[2]);
    } else if(args[0] === "nc") {
      setNumCars(args[1], args[2]);
    } else {
      alert("illegal command: " + args[0]);
      return;
    }

    getCanvas().refresh();
  }

  function setHandSize(playerIdx, n) {
    var dcCards = [];
    for(var i = 0; i < n; ++i)
      dcCards.push("");

    getCanvas().gameState
      .users[playerIdx].player.dcCards = dcCards;
  }

  function setNumCars(playerIdx, n) {
    var cars = [];
    for(var i = 0; i < n; ++i)
      cars.push("");

    getCanvas().gameState
      .users[playerIdx].player.cars = cars;
  }

  function removePlayer(n) {
    getCanvas().gameState.users.splice(n, 1);
  }

  function addPlayer(n) {
    getCanvas().gameState.users.push({
      player: {
        dcCards: ["","","","",""],
        cars: ["", "", ""],
        insurances: ["", ""],
      }
    });
  }

  function getCanvas() {
    return document.getElementsByTagName("dc-game-canvas")[0];
  }
});