var $ = window.$ = require("jquery"),
    _ = require("lodash");
require("webcomponents-lite");
require("../../scripts/game-ui");

$(function() {
  "use strict";

  var availCars = [];
  shuffleCars();

  var canvas = document.createElement("dc-game-canvas");
  // canvas.debugMode = true;
  canvas.gameState = {
    users: [
      {
        name: "player1",
        player: {
          dcCards: [],
          cars: [availCars.pop(), availCars.pop(), availCars.pop()],
          insurances: [],
        },
        dispObjs: {}
      },

      {
        name: "player2",
        player: {
          dcCards: [],
          cars: [availCars.pop(), availCars.pop()],
          insurances: [],
        },
        dispObjs: {}
      },

      {
        name: "player3",
        player: {
          dcCards: [],
          cars: [],
          insurances: [],
        },
        dispObjs: {}
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
    /* jshint maxcomplexity: 10 */
    var args = cmd.split("/");
    if(args[0] === "rp") {
      removePlayer(args[1]);
    } else if(args[0] === "ap") {
      addPlayer();
    } else if(args[0] === "hs") {
      setHandSize(args[1], args[2]);
    } else if(args[0] === "nc") {
      setNumCars(args[1], args[2]);
    } else if(args[0] === "gc") {
      giveCar(args[1]);
    } else if(args[0] === "nd") {
      newDeal();
    } else if(args[0] === "gdc") {
      giveDcCard(args[1]);
    } else {
      alert("illegal command: " + args[0]);
      return;
    }
  }

  function newDeal() {
    var canvas = getCanvas();
    var numPlayers = canvas.gameState.users.length;

    var i;
    for(i = 0; i < numPlayers * 5; ++i) {
      canvas.giveDcCardFromDeck(i % numPlayers, "");
    }

    for(i = 0; i < numPlayers * 4; ++i) {
      if(availCars.length === 0) shuffleCars();
      canvas.giveCarFromDeck(i % numPlayers, availCars.pop());
    }
  }

  function shuffleCars() {
    for(var i = 1; i <= 24; ++i) {
      availCars.push({ image: "car" + i + "s" });
    }

    availCars = _.shuffle(availCars);
  }

  function giveCar(playerIdx) {
    getCanvas().giveCarFromDeck(playerIdx, availCars.pop());
  }

  function giveDcCard(playerIdx) {
    getCanvas().giveDcCardFromDeck(playerIdx, "");
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
    getCanvas().removePlayerAtIndex(n);
  }

  function addPlayer(n) {
    getCanvas().addPlayer({
      name: "player" + (getCanvas().gameState.users.length+1),
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