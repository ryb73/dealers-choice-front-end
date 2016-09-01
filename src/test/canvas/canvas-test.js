var $ = window.$ = require("jquery"),
    _ = require("lodash"),
    q = require("q");

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
          id: "p1",
          dcCards: [availDcCards.pop(), availDcCards.pop(), availDcCards.pop()],
          cars: [availCars.pop(), availCars.pop(), availCars.pop()],
          insurances: [availInsurances.pop(), availInsurances.pop()],
        }
      },

      {
        name: "player2",
        imgSrc: "https://scontent.xx.fbcdn.net/v/t1.0-1/c29.0.100.100/p100x100/10354686_10150004552801856_220367501106153455_n.jpg?oh=c4be024899b0adea5d272cd52ea56e93&oe=58009F77",
        player: {
          id: "p2",
          dcCards: [availDcCards.pop(), availDcCards.pop(), availDcCards.pop()],
          cars: [availCars.pop(), availCars.pop()],
          insurances: [availInsurances.pop()],
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

  canvas.callbacks = {
    canPlayDcCard: function() { return q(true); }
  };

  document.getElementById("content").appendChild(canvas);

  $("#cmdBox").keypress(function(event) {
    if(event.which === 13) {
      handleCommand($(this).val());
      $(this).val("");
    }
  });

  function handleCommand(cmd) {
    /* jshint maxcomplexity: false */
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
    } else if(args[0] === "rpsp") {
      getRpsChoice();
    } else if(args[0] === "rpsc") {
      doRpsCountdown();
    } else if(args[0] === "chat") {
      doChat(args[1]);
    } else if(args[0] === "hdc") {
      highlightDcCards();
    } else if(args[0] === "dc") {
      discardCar(+args[1], +args[2]);
    } else {
      alert("illegal command: " + args[0]);
      return;
    }
  }

  function discardCar(playerIdx, carIdx) {
    getCanvas().discardCar(playerIdx, carIdx);
  }

  function highlightDcCards() {
    getCanvas().highlightDcCards();
  }

  function doChat(s) {
    getCanvas().addChat(s);
  }

  function doRpsCountdown() {
    getCanvas().beginRpsCountdown();

    var answers = generateRpsAnswers();
    q.delay(3000)
      .done(function() {
        getCanvas().supplyRpsAnswers(answers, makeRandomSurvivors());
      });
  }

  function generateRpsAnswers() {
    return getCanvas().gameState.users.map(function(user) {
      return {
        playerId: user.player.id,
        move: Math.floor(Math.random() * 3) + 1
      };
    });
  }

  function makeRandomSurvivors() {
    var survivors = [];
    getCanvas().gameState.users.forEach(function(user) {
      if(Math.random() > 0.5)
        survivors.push(user.player.id);
    });

    return survivors;
  }

  function getRpsChoice() {
    getCanvas().getRockPaperScissorsChoice().done();
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
    var pnum = (getCanvas().gameState.users.length+1);
    getCanvas().addPlayer({
      name: "player" + pnum,
      player: {
        id: "p" + pnum,
        dcCards: [],
        cars: [],
        insurances: ["", ""],
      }
    });
  }

  function getCanvas() {
    return document.getElementsByTagName("dc-game-canvas")[0];
  }
});