const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const SentryCliPlugin = require('@sentry/webpack-plugin');
const common = require('./webpack.common.js');

// REMOVE ONCE HASH IS READY
const gitSha = process.env.SOURCE_VERSION || 'local';

/**
 * PRODUCTION ONLY
 * This is the webpack configuration settings development only
 * If you have a configuration that will be shared by all webpack process
 * please add thos configurations to the file:
 * webpack.common.js
 */

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map', // TYPE OF SOURCE MAPS TO OUTPUT https://webpack.js.org/configuration/devtool/
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
      }),
    ],
  },
  module: {
    rules: [
      {
        // This loader transpiles the Javascript files
        // https://github.com/babel/babel-loader
        // TODO: Investigate es6
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    ],
  },
  plugins: [
    // This plugin will take the files that are output and
    // upload them to Sentry for mapping
    // https://github.com/getsentry/sentry-webpack-plugin
    // new SentryCliPlugin({
    //   include: '.',
    //   ignoreFile: '.sentrycliignore',
    //   ignore: ['node_modules', 'webpack'],
    //   release: gitSha,
    // }),
  ],
});
