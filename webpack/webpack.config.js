"use strict";

const buildDir   = "./build-dev/",
      srcDir     = "./src/",
      bowerDir   = "./bower_components/";

module.exports = [
    require("./static.config")(srcDir, buildDir, bowerDir),
    require("./less.config")(srcDir, buildDir),

    require("./script.config")(
        srcDir + "scripts/dc-shell.js",
        buildDir + "scripts/"
    ),

    require("./script.config")(
        srcDir + "test/canvas/canvas-test.js",
        buildDir + "test/canvas/"
    ),

    require("./script.config")(
        srcDir + "components/dc-canvas-socket-communicator/dc-canvas-socket-communicator.js",
        buildDir + "components/dc-canvas-socket-communicator/"
    ),

    require("./script.config")(
        srcDir + "components/dc-game-canvas/dc-game-canvas.js",
        buildDir + "components/dc-game-canvas/"
    ),

    require("./script.config")(
        srcDir + "components/dc-lobby/dc-lobby.js",
        buildDir + "components/dc-lobby/"
    ),
];