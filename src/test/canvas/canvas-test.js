var $ = window.$ = require("jquery"),
    _ = require("lodash");
require("webcomponents-lite");

$(function() {
  "use strict";

  var availCars = [];
  shuffleCars();

  var availDcCards = [];
  shuffleDcCards();

  var availInsurances = [];
  shuffleInsurances();

  var canvas = document.createElement("dc-game-canvas");
  // canvas.debugMode = true;
  canvas.gameState = {
    users: [
      {
        name: "player1",
        player: {
          dcCards: [],
          cars: [], //[availCars.pop(), availCars.pop(), availCars.pop()],
          insurances: [],
        }
      },

      {
        name: "player2",
        player: {
          dcCards: [],
          cars: [], //[availCars.pop(), availCars.pop()],
          insurances: [],
        }
      },

      // {
      //   name: "player3",
      //   player: {
      //     dcCards: [],
      //     cars: [],
      //     insurances: [],
      //   },
      //   dispObjs: {}
      // }
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
      removePlayer(+args[1]);
    } else if(args[0] === "ap") {
      addPlayer();
    } else if(args[0] === "hs") {
      setHandSize(+args[1], +args[2]);
    } else if(args[0] === "nc") {
      setNumCars(+args[1], +args[2]);
    } else if(args[0] === "gc") {
      giveCar(+args[1]);
    } else if(args[0] === "nd") {
      newDeal();
    } else if(args[0] === "gdc") {
      giveDcCard(+args[1]);
    } else if(args[0] === "gi") {
      giveInsurance(+args[1]);
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
      canvas.giveDcCardFromDeck(i % numPlayers, availDcCards.pop());
    }

    for(i = 0; i < numPlayers * 4; ++i) {
      if(availCars.length === 0) shuffleCars();
      canvas.giveCarFromDeck(i % numPlayers, availCars.pop());
    }

    for(i = 0; i < numPlayers; ++i) {
      if(availInsurances.length === 0) shuffleInsurances();
      canvas.giveInsuranceFromDeck(i % numPlayers, availInsurances.pop());
    }
  }

  function shuffleCars() {
    for(var i = 1; i <= 24; ++i) {
      availCars.push({
        image: "car" + i,
        imageSm: "car" + i + "s"
      });
    }

    availCars = _.shuffle(availCars);
  }

  function shuffleDcCards() {
    availDcCards.push({
      title: "Forced Sale",
      description: "Force another dealer to buy one of your cars of his choice."
    });
    availDcCards.push({
      title: "List+3",
      description: "Sell a car for List Price."
    });
    availDcCards.push({
      title: "Collision",
      description: "Force another dealer to return one of his cars of your choice to Auto Exchange or he may pay repair bill of 1/2 List Price to bank and keep car."
    });
    availDcCards.push({
      title: "Rancid Popcorn",
      description: "Attack another car with rancid popcorn."
    });

    for(var i = 0; i < 36; ++i) {
      availDcCards.push(availDcCards[Math.floor(Math.random() * 4)]);
    }
  }

  function shuffleInsurances() {
    availInsurances.push({
      title: "COMPREHENSIVE",
      protection: "FIRE, THEFT, COLLISION",
      value: "Collect List Price"
    });
    availInsurances.push({
      title: "FIRE",
      value: "Collect List Price"
    });
    availInsurances.push({
      title: "COLLISION",
      value: "Collect List Price"
    });
    availInsurances.push({
      title: "FLY BY NIGHT",
      protection: "RANCID POPCORN",
      value: "Collect List Price"
    });
    availInsurances.push({
      title: "FLY BY NIGHT",
      protection: "LEAKY GALOSHES",
      value: "No Value"
    });
    availInsurances.push({
      title: "Theft",
      value: "Collect List Price"
    });
    availInsurances.push({
      title: "FLY BY NIGHT",
      protection: "Roving Bands of Chickens",
      value: "No Value"
    });

    for(var i = 0; i < 36; ++i) {
      availInsurances.push(availInsurances[Math.floor(Math.random() * 7)]);
    }
  }

  function giveCar(playerIdx) {
    getCanvas().giveCarFromDeck(playerIdx, availCars.pop());
  }

  function giveDcCard(playerIdx) {
    getCanvas().giveDcCardFromDeck(playerIdx, availDcCards.pop());
  }

  function giveInsurance(playerIdx) {
    getCanvas().giveInsuranceFromDeck(playerIdx, availInsurances.pop());
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

  function addPlayer() {
    getCanvas().addPlayer({
      name: "player" + (getCanvas().gameState.users.length+1),
      player: {
        dcCards: [availDcCards.pop(), availDcCards.pop(), availDcCards.pop(), availDcCards.pop(), availDcCards.pop()],
        cars: [availCars.pop(), availCars.pop(), availCars.pop()],
        insurances: ["", ""],
      }
    });
  }

  function getCanvas() {
    return document.getElementsByTagName("dc-game-canvas")[0];
  }
});