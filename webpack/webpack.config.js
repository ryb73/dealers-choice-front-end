"use strict";

const buildDir = "./build-dev/",
      srcDir   = "./src/";

module.exports = [
    require("./less.config")(srcDir, buildDir),
    require("./static.config")(srcDir, buildDir),
];