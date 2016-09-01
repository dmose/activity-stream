"use strict";
const webpack = require("webpack");
const webpack_common = require("./webpack.common");
const path = require("path");
const absolute = relPath => path.join(__dirname, relPath);

const srcPath = absolute("./content-src/main.js");
const outputDir = absolute("./data/content");
const outputFilename = "bundle.js";

let env = process.env.NODE_ENV || "development";

function getPreRenderPlugin(isPreRendered) {
  return new webpack.DefinePlugin({"PRERENDER": JSON.stringify(isPreRendered)});
}

function generatePlugins(filename) {
  if (env !== "test") {
    return webpack_common.plugins.concat(
      new webpack.optimize.CommonsChunkPlugin("vendor", filename));
  }

  return webpack_common.plugins;
}

module.exports = [
  {
    name: "browser",
    entry: {
      app: srcPath,
      vendor: [
        "react",
        "react-dom",
        "moment"
      ]
    },
    output: {
      path: outputDir,
      filename: outputFilename
    },
    target: "web",
    module: webpack_common.module,
    devtool: env === "production" ? null : "eval", // This is for Firefox
    plugins: generatePlugins("vendor.bundle.js").concat(
      getPreRenderPlugin(false)),
    resolve: webpack_common.resolve
  },
  {
    name: "prerendered",
    entry: {
      app: "./bin/generate-html.js"
      // vendor: [
      //   "react",
      //   "react-dom",
      //   "moment"
      // ]
    },
    output: {
      path: outputDir,
      filename: "generate-html.js"
    },
    target: "node",
    module: webpack_common.module,
    devtool: env === "production" ? null : "eval", // This is for Firefox
    plugins: webpack_common.plugins.concat(getPreRenderPlugin("true")),
    resolve: webpack_common.resolve
  }
];
