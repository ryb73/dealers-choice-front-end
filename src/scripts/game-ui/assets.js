/* global createjs */
/* jshint globalstrict: true */
"use strict";

var Evemit = require("evemit");

var assetTable = {
  "/images/dc-cards/back.png" : "dcCardBack",

  "/images/cars/back.png" : "carBack",
  "/images/cars/1.png" : "car1",
  "/images/cars/1s.png" : "car1s",
  "/images/cars/2.png" : "car2",
  "/images/cars/2s.png" : "car2s",
  "/images/cars/3.png" : "car3",
  "/images/cars/3s.png" : "car3s",
  "/images/cars/4.png" : "car4",
  "/images/cars/4s.png" : "car4s",
  "/images/cars/5.png" : "car5",
  "/images/cars/5s.png" : "car5s",
  "/images/cars/6.png" : "car6",
  "/images/cars/6s.png" : "car6s",
  "/images/cars/7.png" : "car7",
  "/images/cars/7s.png" : "car7s",
  "/images/cars/8.png" : "car8",
  "/images/cars/8s.png" : "car8s",
  "/images/cars/9.png" : "car9",
  "/images/cars/9s.png" : "car9s",
  "/images/cars/10.png" : "car10",
  "/images/cars/10s.png" : "car10s",
  "/images/cars/11.png" : "car11",
  "/images/cars/11s.png" : "car11s",
  "/images/cars/12.png" : "car12",
  "/images/cars/12s.png" : "car12s",
  "/images/cars/13.png" : "car13",
  "/images/cars/13s.png" : "car13s",
  "/images/cars/14.png" : "car14",
  "/images/cars/14s.png" : "car14s",
  "/images/cars/15.png" : "car15",
  "/images/cars/15s.png" : "car15s",
  "/images/cars/16.png" : "car16",
  "/images/cars/16s.png" : "car16s",
  "/images/cars/17.png" : "car17",
  "/images/cars/17s.png" : "car17s",
  "/images/cars/18.png" : "car18",
  "/images/cars/18s.png" : "car18s",
  "/images/cars/19.png" : "car19",
  "/images/cars/19s.png" : "car19s",
  "/images/cars/20.png" : "car20",
  "/images/cars/20s.png" : "car20s",
  "/images/cars/21.png" : "car21",
  "/images/cars/21s.png" : "car21s",
  "/images/cars/22.png" : "car22",
  "/images/cars/22s.png" : "car22s",
  "/images/cars/23.png" : "car23",
  "/images/cars/23s.png" : "car23s",
  "/images/cars/24.png" : "car24",
  "/images/cars/24s.png" : "car24s"
};

function Assets() {
  var self = this;
  var emitter = new Evemit();
  var queue;
  var totalFiles = 0;
  var filesLoaded = 0;

  function load() {
    queue = new createjs.LoadQueue();
    queue.on("fileload", fileLoaded);
    queue.on("complete", loadComplete);
    queue.on("error", loadError);

    for(var url in assetTable) {
      if(!assetTable.hasOwnProperty(url)) continue;

      ++totalFiles;
      queue.loadFile(url);
    }
  }
  this.load = load;

  function isLoading() {
    return totalFiles > 0;
  }

  function fileLoaded(event) {
    if(!isLoading()) return;

    var id = assetTable[event.item.src];
    self[id] = event.result;
    ++filesLoaded;

    emitter.emit("progress");
  }

  function loadComplete() {
    if(isLoading()) {
      emitter.emit("progress");
      emitter.emit("complete");
    }
  }

  function loadError(event) {
    queue.removeAll();
    totalFiles = 0;
    filesLoaded = 0;
    emitter.emit("error", event);
  }

  this.on = emitter.on.bind(emitter);
  this.off = emitter.off.bind(emitter);
  this.once = emitter.once.bind(emitter);

  Object.defineProperties(this, {
    progress: {
      get: function() {
        return filesLoaded / totalFiles;
      }
    }
  });
}

module.exports = new Assets(); // treat as singleton