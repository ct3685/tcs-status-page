## GetSava

To begin clone this repo

Download Dependencies
```
npm install
```

Start Application

```
npm start
```

Go to [http://localhost:3000](http://localhost:3000)

### Key Files
`./build_scripts/www` Startup Script

`./src/app.js` This is the main application file that loads all the middleware

`./src/client/root` All static files that need to be copied to the public folder

`./src/client/scripts/main.js` Clientside Javascript entry point

`./src/client/styles/main.scss` The main scss entrypoint

`./src/handlebars/helpers` Place all your custom handlebars helpers here

`./src/handlebars/helpers/index` The main entry point for the handlebars helpers. When you create and new one add it here as well to register it

`./src/handlebars/layouts/www_layout.hbs` The main HTML wrapper for the site

`./src/handlebars/pages` Individual main page templates should go here

`./src/handlebars/partials/` all partials will go here. We will create sub directories for different types of components

`./src/server/config` Sets all of the site configuraton like logger setup and enviroment variables for different services

`./src/server/controllers` This is where a majority of the buisness logic will go and different controllers for communicating with vendors and displaying content on pages

`./src/server/middleware` All of the custom middleware for express routes

`./src/server/routes/api` All internal API routes that will be used for client side requests from the server. Will return data as JSON

`./src/server/routes/web` All the web page routes

## Dependencies
<!-- AUTO-GENERATED-CONTENT:START (depTable:dev=true&production=true) -->
| **Dependency** | **Description** | **Version** | **License** | **Type** |
| -------------- | --------------- | ----------- | ----------- | -------- |
 | [@sentry/node@^5.5.0](https://github.com/getsentry/sentry-javascript/tree/master/packages/node) | Offical Sentry SDK for Node.js | 5.5.0 | BSD-3-Clause | production | 
 | [body-parser@^1.19.0](https://github.com/expressjs/body-parser#readme) | Node.js body parsing middleware | 1.19.0 | MIT | production | 
 | [bootstrap@^4.3.1](https://getbootstrap.com/) | The most popular front-end framework for developing responsive, mobile first projects on the web. | 4.3.1 | MIT | production | 
 | [cookie-parser@^1.4.4](https://github.com/expressjs/cookie-parser#readme) | Parse HTTP request cookies | 1.4.4 | MIT | production | 
 | [express@^4.17.1](http://expressjs.com/) | Fast, unopinionated, minimalist web framework | 4.17.1 | MIT | production | 
 | [express-handlebars@^3.1.0](https://github.com/ericf/express-handlebars) | A Handlebars view engine for Express which doesn't suck. | 3.1.0 | BSD-3-Clause | production | 
 | [handlebars@^4.1.2](http://www.handlebarsjs.com/) | Handlebars provides the power necessary to let you build semantic templates effectively with no frustration | 4.1.2 | MIT | production | 
 | [handlebars-helpers@^0.10.0](https://github.com/helpers/handlebars-helpers) | More than 130 Handlebars helpers in ~20 categories. Helpers can be used with Assemble, Generate, Verb, Ghost, gulp-handlebars, grunt-handlebars, consolidate, or any node.js/Handlebars project. | 0.10.0 | MIT | production | 
 | [helmet@^3.19.0](https://helmetjs.github.io/) | help secure Express/Connect apps with various HTTP headers | 3.19.0 | MIT | production | 
 | [jquery@^3.4.1](https://jquery.com) | JavaScript library for DOM operations | 3.4.1 | MIT | production | 
 | [lodash@^4.17.1...](https://lodash.com/) | Lodash modular utilities. | 4.17.15 | MIT | production | 
 | [morgan@^1.9.1](https://github.com/expressjs/morgan#readme) | HTTP request logger middleware for node.js | 1.9.1 | MIT | production | 
 | [popper.js@^1.15.0](https://popper.js.org) | A kickass library to manage your poppers | 1.15.0 | MIT | production | 
 | [winston@^3.2.1](https://github.com/winstonjs/winston#readme) | A logger for just about everything. | 3.2.1 | MIT | production | 
 | [@babel/preset-env@^7.5.5](https://babeljs.io/) | A Babel preset for each environment. | 7.5.5 | MIT | dev | 
 | [@sentry/webpack-plugin@^1.7.0](https://github.com/getsentry/sentry-webpack-plugin) | Official webpack plugin for Sentry | 1.7.0 | MIT | dev | 
 | [babel-jest@^24.8.0](https://github.com/facebook/jest#readme) | Jest plugin to use babel for transformation. | 24.8.0 | MIT | dev | 
 | [concurrently@^4.1.1](https://github.com/kimmobrunfeldt/concurrently#readme) | Run commands concurrently | 4.1.1 | MIT | dev | 
 | [copy-webpack-plugin@^5.0.3](https://github.com/webpack-contrib/copy-webpack-plugin) | Copy files && directories with webpack | 5.0.3 | MIT | dev | 
 | [css-loader@^3.1.0](https://github.com/webpack-contrib/css-loader) | css loader module for webpack | 3.1.0 | MIT | dev | 
 | [dotenv@^8.0.0](https://github.com/motdotla/dotenv#readme) | Loads environment variables from .env file | 8.0.0 | BSD-2-Clause | dev | 
 | [eslint@^6.0.1](https://eslint.org) | An AST-based pattern checker for JavaScript. | 6.0.1 | MIT | dev | 
 | [eslint-config-airbnb-base@^13.2.0](https://github.com/airbnb/javascript) | Airbnb's base JS ESLint config, following our styleguide | 13.2.0 | MIT | dev | 
 | [eslint-loader@^2.2.1](https://github.com/webpack-contrib/eslint-loader#readme) | eslint loader (for webpack) | 2.2.1 | MIT | dev | 
 | [eslint-plugin-import@^2.18.2](https://github.com/benmosher/eslint-plugin-import) | Import with sanity. | 2.18.2 | MIT | dev | 
 | [jest@^24.8.0](https://jestjs.io/) | Delightful JavaScript Testing. | 24.8.0 | MIT | dev | 
 | [markdown-magic@^0.1.25](https://github.com/DavidWells/markdown-magic#readme) | Automatically update markdown files with content from external sources | 0.1.25 | MIT | dev | 
 | [markdown-magic-dependency-table@^1.3.2](https://github.com/camacho/markdown-magic-dependency-table#readme) | Generate table of information about dependencies automatically in markdown | 1.3.2 | MIT | dev | 
 | [markdown-magic-jsdoc@^1.0.1](https://github.com/bradtaylorsf/markdown-magic-jsdoc#readme) | A plugin for markdown-magic that parses jsdoc style comments as a transform | 1.0.1 | MIT | dev | 
 | [mini-css-extract-plugin@^0.8.0](https://github.com/webpack-contrib/mini-css-extract-plugin) | extracts CSS into separate files | 0.8.0 | MIT | dev | 
 | [node-sass@^4.12.0](https://github.com/sass/node-sass) | Wrapper around libsass | 4.12.0 | MIT | dev | 
 | [nodemon@^1.19.1](http://nodemon.io) | Simple monitor script for use during development of a node.js app. | 1.19.1 | MIT | dev | 
 | [optimize-css-assets-webpack-plugin@^5.0.3](http://github.com/NMFR/optimize-css-assets-webpack-plugin) | A Webpack plugin to optimize \ minimize CSS assets. | 5.0.3 | MIT | dev | 
 | [sass-loader@^7.1.0](https://github.com/webpack-contrib/sass-loader) | Sass loader for webpack | 7.1.0 | MIT | dev | 
 | [uglifyjs-webpack-plugin@^2.1.3](https://github.com/webpack-contrib/uglifyjs-webpack-plugin) | UglifyJS plugin for webpack | 2.1.3 | MIT | dev | 
 | [webpack@^4.36.1](https://github.com/webpack/webpack) | Packs CommonJs/AMD modules for the browser. Allows to split your codebase into multiple bundles, which can be loaded on demand. Support loaders to preprocess files, i.e. json, jsx, es7, css, less, ... and your custom stuff. | 4.36.1 | MIT | dev | 
 | [webpack-cli@^3.3.6](https://github.com/webpack/webpack-cli#readme) | CLI for webpack & friends | 3.3.6 | MIT | dev | 
 | [webpack-dev-middleware@^3.7.0](https://github.com/webpack/webpack-dev-middleware) | A development middleware for webpack | 3.7.0 | MIT | dev | 
 | [webpack-hot-middleware@^2.25.0](https://github.com/webpack-contrib/webpack-hot-middleware#readme) | Webpack hot reloading you can attach to your own server | 2.25.0 | MIT | dev | 
 | [webpack-merge@^4.2.1](https://github.com/survivejs/webpack-merge) | Variant of merge that's useful for webpack configuration | 4.2.1 | MIT | dev | 
<!-- AUTO-GENERATED-CONTENT:END -->