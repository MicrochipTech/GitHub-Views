const path = require("path");

module.exports = {
  context: path.join(__dirname, "frontend"),
  entry: "./main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public")
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  mode: "development"
};
