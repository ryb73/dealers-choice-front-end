"use strict";

const buildDir = "./build-dev/",
      srcDir   = "./src/";

module.exports = [
    require("./static.config")(srcDir, buildDir),
    require("./less.config")(srcDir, buildDir),
];