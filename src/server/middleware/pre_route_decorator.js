const _ = require('lodash');
const config = require('../config');

/**
 * Middleware that is ran before all routes in app.js
 * add functions here you want to run before the routes middleware are ran
 */

const setClientConfig = (res) => {
  res.locals.config = _.assign(res.locals.config, _.omit(config, [
    'services.contentful.managementToken',
  ]));
};

/**
 * Adding the configuration items that should be present in the client
 */
const addCanonicalUrl = (res) => {
  res.locals.config = res.locals.config || {};
  const fullUrl = `https://${res.req.get('host')}${res.req.originalUrl}`;
  let canonicalUrl = fullUrl;
  if (canonicalUrl.indexOf('?') > -1) {
    canonicalUrl = canonicalUrl.substring(0, canonicalUrl.indexOf('?'));
  }
  res.locals.config.canonicalUrl = canonicalUrl;
  res.locals.config.url = fullUrl;
};


module.exports = (req, res, next) => {
  // Omit server secrets from the client config
  setClientConfig(res);
  addCanonicalUrl(res);
  next();
};
