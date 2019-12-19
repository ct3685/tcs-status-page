# Webpack Configuration
We use Webpack to build our front end assets like JS, CSS and static files.

## Configurations
We seperate out the different configuration options between two types of files, common settings and environmet settings. We use [webpack-merge](https://www.npmjs.com/package/webpack-merge) to combine the two files.

### Entries
> webpack.entries.js\
This is a configration file that defines the files that will be used in the webpack process. If you need to add a new file sources, you will add them here.

### Common
> webpack.common.js\
This file contains all of the common configuration setting that are common across all environments.

| Config     | Description     | Documentation     |
| ---------- | ---------- | ---------- |
| optimization.splitchunks       | This will split the code into seperate files       | [Docs](https://webpack.js.org/plugins/split-chunks-plugin/)       |
| optimization.splitchunks.cacheGroups       | This will take any imports from your JS files and if they are located in node_modules, it will added them to a vendor js file.       | [Docs]()       |
| entry       | These are the files that will be the input.       | [Docs](https://webpack.js.org/configuration/entry-context/)       |
| output       | his specifys where you want the files to be out put to and the name of the source maps, if your environment outputs them.       | [Docs](https://webpack.js.org/configuration/output/)       |
| resolve       | Tell webpack what directories should be searched when resolving modules.       | [Docs](https://webpack.js.org/configuration/resolve/#resolve-modules)       |
| NoEmitOnErrorsPlugin       | Skip the emitting phase when there are compilation errors       | [Docs](https://webpack.js.org/configuration/optimization/#optimization-noemitonerrors)       |
| ProvidePlugin       | Use modules without having to use import/require       | [Docs](https://webpack.js.org/plugins/provide-plugin)       |

### Development
> webpack.config.dev.js\
This is the configuration that will be used for local development only. It includes unminifed JS, CSS and local source maps. It also includes a hot module replacement for faster local development. HMR only works with CSS changes currently. JS changes will still require a page refresh

| Config     | Description     | Documentation     |
| ---------- | ---------- | ---------- |
| mode       | Providing the mode configuration option tells webpack to use its built-in optimizations accordingly.       | [Docs](https://webpack.js.org/concepts/mode/)       |
| devtool       | This option controls if and how source maps are generated.       | [Docs](https://webpack.js.org/configuration/devtool/)       |
| style-loader       | Adds CSS to the DOM by injecting a style tag. Used for local development only       | [Docs](https://github.com/webpack-contrib/style-loader)       |
| css-loader       | The css-loader interprets @import and url() like import/require() and will resolve them.       | [Docs](https://github.com/webpack-contrib/css-loader)       |
| sass-loader       | Chain the sass-loader with the css-loader and the style-loader to immediately apply all styles to the DOM.       | [Docs](https://github.com/webpack-contrib/sass-loader)       |
| HotModuleReplacementPlugin       | Enables Hot Module Replacement, otherwise known as HMR. HMR should NEVER be used in production       | [Docs](https://webpack.js.org/plugins/hot-module-replacement-plugin/)       |

### Production
> webpack.prod.js\
This is the config for production. It is currently used only on the production instance of Heroku. It will minfy the code, create and upload sourcemaps to Sentry, our bug tracking software, and extract the CSS into a master file.


| Config     | Description     | Documentation     |
| ---------- | ---------- | ---------- |
| mode       | Providing the mode configuration option tells webpack to use its built-in optimizations accordingly.       | [Docs](https://webpack.js.org/concepts/mode/)       |
| devtool       | This option controls if and how source maps are generated.       | [Docs](https://webpack.js.org/configuration/devtool/)       |
| UglifyJsPlugin       | Minimizes the JS and CSS files       | [Docs](https://webpack.js.org/plugins/uglifyjs-webpack-plugin/)       |
| MiniCssExtractPlugin       | Extracts the CSS and source maps into seperate files from the Javascript       | [Docs](https://github.com/webpack-contrib/mini-css-extract-plugin)       |
| css-loader       | The css-loader interprets @import and url() like import/require() and will resolve them.       | [Docs](https://github.com/webpack-contrib/css-loader)       |
| sass-loader       | Chain the sass-loader with the css-loader and the style-loader to immediately apply all styles to the DOM.       | [Docs](https://github.com/webpack-contrib/sass-loader)       |
| babel-loader       | This package allows transpiling JavaScript files using Babel and webpack.       | [Docs](https://github.com/babel/babel-loader)       |
| CopyWebpackPlugin       | Copies individual files or entire directories to the build directory       | [Docs](https://github.com/webpack-contrib/copy-webpack-plugin)       |
| OptimizeCssAssetsPlugin       | A Webpack plugin to optimize \ minimize CSS assets.       | [Docs](https://github.com/NMFR/optimize-css-assets-webpack-plugin)       |
| SentryCliPlugin       | A webpack plugin acting as an interface to Sentry CLI. Uploads our sourcemaps for easy debugging       | [Docs](https://github.com/getsentry/sentry-webpack-plugin)       |


