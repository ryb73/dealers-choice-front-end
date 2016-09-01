"use strict";

const path = require("path");

const scriptsDir    = "scripts/",
      componentsDir = "components/";

module.exports = (srcFile, buildDir) => {
    let filename = path.basename(srcFile, ".js");

    return {
        entry:  {
            [filename]: srcFile,
        },

        output: {
            path: buildDir,
            filename: "[name].js",
        },

        module: {
            loaders: [{
                test: /\.js$/,
                loader: "babel-loader"
            },{
                test: /\.json$/,
                loader: "json",
            }],
        },

        resolve: {
            extensions: ["", ".js", ".json"]
        },

        devtool: "source-map",
    };
};
