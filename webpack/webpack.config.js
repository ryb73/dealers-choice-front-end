"use strict";

const buildDir = "./build-dev",
      srcDir   = "./src";

module.exports = [
    require("./less.config")(buildDir, srcDir),
    require("./static.config")(__dirname, buildDir, srcDir),
];