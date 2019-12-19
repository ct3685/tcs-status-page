const path = require('path');

const clientDir = path.join(__dirname, '../../src/client');

// These are the file inputs for the main bundle
const filesBundle = [
  path.join(clientDir, 'styles/main.scss'),
  path.join(clientDir, 'scripts/main.js'),
];

// If it is local environment add the HMR script to the main bundle
// https://github.com/webpack-contrib/webpack-hot-middleware
if (process.env.NODE_ENV === 'local') {
  const hotMiddlewareScript = 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr&timeout=20000';
  filesBundle.unshift(hotMiddlewareScript);
}

const allEntries = {
  bundle: filesBundle,
};


module.exports = allEntries;
