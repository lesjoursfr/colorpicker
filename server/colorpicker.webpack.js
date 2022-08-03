import { resolve } from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
  entry: "./server/index.js",
  devServer: {
    host: "127.0.0.1",
    port: 8084,
    static: [
      {
        directory: resolve("./node_modules/@popperjs/core/dist/umd"),
        publicPath: "/popperjs",
        serveIndex: false,
        watch: false,
      },
      {
        directory: resolve("./server/builds"),
        publicPath: "/builds",
        serveIndex: false,
        watch: false,
      },
      {
        directory: resolve("./server"),
        publicPath: "/",
        serveIndex: true,
        watch: true,
      },
    ],
  },
  output: {
    path: resolve("./build"),
    filename: "colorpicker.js",
    library: "Colorpicker",
    libraryTarget: "umd",
  },
  target: "browserslist",
  externals: {
    "@popperjs/core": {
      root: "Popper",
      commonjs: "Popper",
      commonjs2: "Popper",
      amd: "Popper",
    },
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "colorpicker.css",
    }),
  ],
};
