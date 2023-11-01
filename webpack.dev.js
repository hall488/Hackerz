const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  entry: {
    // Runtime code for hot module replacement
    hot: "webpack/hot/dev-server.js",
    // Dev server client for web socket transport, hot and live reload logic
    //client: "webpack-dev-server/client/index.js?hot=true&live-reload=true",
  },
  devtool: "inline-source-map",
  devServer: {
    port: 3000,
    // proxy: {
    //   "/": {
    //     target: "http://localhost:8080",
    //     secure: false,
    //     changeOrigin: true,
    //   },
    //   "/socket.io": {
    //     target: "http://localhost:8080",
    //     ws: true,
    //   },
    // },
    devMiddleware: {
      writeToDisk: true,
    },
    watchFiles: ["src/client/*.html", "src/client/*.css"],
    static: "./dist",
    // Dev server client for web socket transport, hot and live reload logic
    hot: true,
    client: false,
  },
});
