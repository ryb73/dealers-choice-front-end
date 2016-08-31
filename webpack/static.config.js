"use strict";

const CopyWebpackPlugin = require("copy-webpack-plugin");

const imgDir = "/images",
      fontDir = "/fonts";

module.exports = (context, buildDir, srcDir) => {
    return {
        context: context,

        plugins: [
            new CopyWebpackPlugin([{
                from: buildDir + "/**.html",
                to: srcDir
            }, {
                from: buildDir + imgDir + "/**",
                to: srcDir + imgDir
            }, {
                from: buildDir + fontDir + "/**",
                to: srcDir + fontDir
            }])
        ],
    };
};
