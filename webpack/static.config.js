"use strict";

const CopyWebpackPlugin  = require("copy-webpack-plugin"),
      CleanWebpackPlugin = require("clean-webpack-plugin");

const imgDir = "images/",
      fontDir = "fonts/";

module.exports = (srcDir, buildDir) => {
    return {
        output: {
            path: buildDir,
            filename: "[name]",
        },

        plugins: [
            new CleanWebpackPlugin([ buildDir ], { root: __dirname + "/.." }),

            new CopyWebpackPlugin([{
                context: srcDir,
                from: "**/*.html",
            }, {
                context: srcDir,
                from: imgDir + "**",
            }, {
                context: srcDir,
                from: fontDir + "**",
            }]),
        ],
    };
};
