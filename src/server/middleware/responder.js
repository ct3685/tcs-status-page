const _ = require('lodash');
const path = require('path');
const config = require('../config');
const logger = require('../config/logger')(__filename, 'responder');

/**
 * Used the respond the the browser in JSON format
 * @param  {Object} res The express response object: https://expressjs.com/en/api.html#req
 * @return {Response}     Sends the JSON to the browser
 */
const json = (res) => {
  if (!_.isUndefined(res.locals.error)) {
    logger.log('error', 'responded in json with errors');
    logger.log('error', res.locals.error);
  }
  debugger;
  res.json(res.locals);
};

/**
 * Used to respond to the browser in HTML format
 * @param  {Object} res https://expressjs.com/en/api.html#req
 * @return {response}     Sends the compiles handlebars template to the browser
 */
const html = (res) => {
  // status(res);
  logger.log('debug', `TEMPLATE: ${res.locals.view}`);
  res.render(res.locals.view, res.locals);
};

/**
 * Used to determine if the response should be in JSON
 * @param  {Object}  req https://expressjs.com/en/api.html#req
 * @return {Boolean}     Will return true if the route starts with /api or if query debug=true
 */
const isJson = (req) => {
  /* Check if the path starts with /api
  * Will also return JSON if the user adds ?debug=true
  * in the development environment
  */
  if (_.startsWith(req.originalUrl, '/api/')
  || (config.env !== 'production' && req.query.debug)) {
    return true;
  }
  return false;
};

/**
 * Express Middleware Used by the routes.js files to respond to the browser
 * https://expressjs.com/en/guide/using-middleware.html
 * @param  {Object}   req  https://expressjs.com/en/api.html#req
 * @param  {Object}   res  https://expressjs.com/en/api.html#res
 * @param  {Function} next Will send the request and response to the next middleware
 * @return {response}     Respondes to the browser
 */
const respond = (req, res, next) => {
  logger.log('debug', `Environment: ${config.env}`);

  if (req.user && req.isAuthenticated()) res.locals.user = req.user;
  if (_.isUndefined(res.locals)) {
    next();
  } else if (isJson(req)) {
    json(res);
  } else if (!_.isEmpty(res.locals.view)) {
    html(res);
  }
};

/**
 * Express middleware used for handling errors
 * https://expressjs.com/en/guide/using-middleware.html
 *
 * @param  {Object}   err  Error message
 * @param  {Object}   req  https://expressjs.com/en/api.html#req
 * @param  {Object}   res  https://expressjs.com/en/api.html#res
 * @param  {Function} next Will send the request and response to the next middleware
 * @return {response}     Respondes to the browser
 */
const error = (err, req, res) => {
  if (err) {
    res.locals.error = err;
  } else {
    logger.log('error', `UNKNOWN ERROR OCCURED: ${err}`);
    res.locals.error = {
      code: 500,
      msg: 'Unknown error occured',
    };
  }

  logger.log('error', err);
  if (isJson(req)) {
    json(res);
  } else {
    html(res);
  }
};

/**
 * Last middleware to be called if no response is made to the browser
 * @param  {Object} req https://expressjs.com/en/api.html#req
 * @param  {Object} res https://expressjs.com/en/api.html#res
 * @return {response}     Respondes to the browser
 */
const notFound = async (req, res, next) => {
  const options = {
    root: path.join(__dirname, '../../../public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
    },
  };

  res.status(404).sendFile('404.html', options, (err) => {
    if (err) {
      next(err);
    }
  });
};


module.exports = {
  notFound,
  error,
  respond,
};
