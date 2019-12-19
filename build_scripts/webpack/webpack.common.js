const path = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const gitSha = process.env.SOURCE_VERSION || 'local';
const clientDir = path.join(__dirname, '../../src/client');
const publicDir = path.join(__dirname, '../../public');
const jsEntries = require('./webpack.entries');

/**
 * This is the common configuration settings for all webpack processes
 * If you have a configuration that is environment specific place it
 * in one of the following files:
 * webpack.config.dev
 * webpack.config.stage
 * webpack.config.prod
 *
 * If you need to add new files for input please ad them to:
 * webpack.entries.js
 */
module.exports = {
  // This will split the code into seperate files
  // https://webpack.js.org/plugins/split-chunks-plugin/
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '-',
      name: true,
      cacheGroups: {
        // This will take any imports from your JS files
        // And if they are located in node_modules, it will
        // added them to a vendor js file.
        // https://webpack.js.org/plugins/split-chunks-plugin/#splitchunks-cachegroups
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  // This is where you specify the files that will be the input
  // Here we have two types of inputs, one for the original site,
  // One for the redeisgn. If you need to add a new inout location
  // add it to the webpack.entries.js file
  // https://webpack.js.org/configuration/entry-context/
  entry: jsEntries,
  // This specifys where you want the files to be out put to
  // and the name of the source maps, if your environment outputs them.
  // https://webpack.js.org/configuration/output/
  output: {
    filename: 'assets/scripts/[name].js',
    path: publicDir,
    sourceMapFilename: 'assets/scripts/[name].js.map',
  },
  // Tell webpack what directories should be searched when resolving modules.
  // https://webpack.js.org/configuration/resolve/#resolve-modules
  resolve: {
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            // This loader will extract the CSS into seperate files
            // https://github.com/webpack-contrib/mini-css-extract-plugin
            loader: MiniCssExtractPlugin.loader,
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sourceMapContents: false,
            },
          },
        ],
      },
    ],
  },
  // https://webpack.js.org/plugins/
  plugins: [
    // Skip the emitting phase when there are compilation errors
    // https://webpack.js.org/configuration/optimization/#optimization-noemitonerrors
    new webpack.NoEmitOnErrorsPlugin(),
    // Use modules without having to use import/require
    // https://webpack.js.org/plugins/provide-plugin
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      _: 'lodash',
    }),
    // This plugin will copy all files in the ./client/root folder
    // to the public directoy
    new CopyWebpackPlugin([
      { from: `${clientDir}/root`, to: `${publicDir}` },
    ]),
    // This plugin will extract the CSS fromt eh JS files
    // that are output by webpack.
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    new MiniCssExtractPlugin({
      filename: 'assets/styles/[name].css',
      chunkFilename: 'assets/styles/[name].css',
    }),
    // This plugin will then take the files and create minified
    // versions as well as create source maps for CSS
    // https://github.com/NMFR/optimize-css-assets-webpack-plugin
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        map: {
          inline: false,
          annotation: true,
        },
      },
    }),
  ],
};
