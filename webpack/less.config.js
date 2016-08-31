"use strict";

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const styleDir = "/style";

module.exports = (buildDir, srcDir) => {
    return {
        entry:  {
            base: srcDir + styleDir + "/base.less",
        },

        output: {
            path: buildDir + styleDir,
            filename: "[name].css",
        },

        module: {
            loaders: [{
                test: /\.less?$/,
                loader: ExtractTextPlugin.extract("css?sourceMap!less?sourceMap"),
            }],
        },

        plugins: [
            new ExtractTextPlugin("[name].css")
        ],

        devtool: "source-map",
    };
};
