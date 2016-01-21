/* global Set */
/* jshint globalstrict: true */
"use strict";

var q = require("q");

var DELAY = 200;

// Manges a queue of pending animates so that, if many
// are requested, not all of them run at once. An example
// of a situation where many animations would be requested
// at once is at the beginning of the game when cards are
// being dealt.
function AnimationThrottler(delay) {
  if(!delay) delay = DELAY;

  // Anim is considered active if it's running or queued
  var currentDelay = 0;

  // func: Function that takes no params and returns a promise
  function requestAnim(func) {
    var result = q.delay(currentDelay)
      .thenResolve(func)
      .then(start);
    currentDelay += delay;
    return result;
  }
  this.requestAnim = requestAnim;

  function start(func) {
    return func()
      .catch(animFailed)
      .tap(animFinished);
  }

  function animFailed(error) {
    animFinished();
    throw error;
  }

  function animFinished() {
    currentDelay -= delay;
  }
}

module.exports = AnimationThrottler;