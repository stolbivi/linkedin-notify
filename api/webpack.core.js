const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const BABEL_OPTIONS = {
  cacheDirectory: true,
  cacheCompression: false,
  envName: "development",
};

const initEntry = (dist, input, output) => {
  return {
    entry: input,
    output: {
      path: path.resolve(__dirname, dist),
      filename: output,
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: BABEL_OPTIONS,
            },
            {
              loader: "ts-loader",
            },
          ],
        },
        {
          test: /\.js(x?)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: BABEL_OPTIONS,
          },
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      fallback: {
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        "process": {
          env: {DEBUG: undefined},
        }
      })
    ],
    devtool: "cheap-module-source-map"
  };
};

const addCSSModules = (object, outputCss) => {
  object.module.rules.push({
    test: /\.(s[ac]ss|css)$/i,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          importLoaders: 1,
        },
      },
      "sass-loader",
    ],
  });
  object.plugins = object.plugins.concat([
    new MiniCssExtractPlugin({
      filename: outputCss,
    }),
  ].filter(Boolean));
  return object;
};

const addHTMLModules = (object, template, outputHtml, outputCss) => {
  object.module.rules.push({
    test: /\.(s[ac]ss|css)$/i,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          importLoaders: 1,
        },
      },
      "sass-loader",
    ],
  });
  object.plugins = object.plugins.concat([
    new MiniCssExtractPlugin({
      filename: outputCss,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, template),
      inject: true,
      filename: outputHtml,
    }),
  ].filter(Boolean));
  return object;
};

module.exports = {
  initEntry,
  addCSSModules,
  addHTMLModules,
};
