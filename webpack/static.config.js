"use strict";

const CopyWebpackPlugin  = require("copy-webpack-plugin"),
      CleanWebpackPlugin = require("clean-webpack-plugin");

const imgDir = "images/",
      fontDir = "fonts/";

module.exports = (srcDir, buildDir, bowerDir) => {
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
            }, {
                context: bowerDir,
                from: "polymer/*.html",
                to: "components/",
            }, {
                context: bowerDir,
                from: "neon-animation/**",
                to: "components/",
            }, {
                context: bowerDir,
                from: "iron-resizable-behavior/**",
                to: "components/",
            }, {
                context: bowerDir,
                from: "iron-selector/**",
                to: "components/",
            }, {
                context: bowerDir,
                from: "iron-meta/**",
                to: "components/",
            }, {
                context: bowerDir,
                from: "web-animations-js/**",
                to: "components/",
            }, {
                context: bowerDir,
                from: "EaselJS/lib/**.js",
                to: "scripts/",
            }, {
                context: bowerDir,
                from: "TweenJS/lib/**.js",
                to: "scripts/",
            }, {
                context: bowerDir,
                from: "PreloadJS/lib/**.js",
                to: "scripts/",
            }, {
                context: bowerDir,
                from: "webcomponentsjs/**.js",
                to: "scripts/",
            }]),
        ],
    };
};
