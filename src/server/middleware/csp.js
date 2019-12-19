/*
 * Middleware for generating a Content Security Policy header
 * Learn more about directives:
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
 * Evaluate CSP policy for compliance (our goal is v3):
 * https://csp-evaluator.withgoogle.com/
 */

const config = ('../config');
const _ = require('lodash');
const crypto = require('crypto');

const makeCsp = (hash) => {
  const directives = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'script-src': ["'self'", 'http:', 'https:', "'unsafe-inline'", "'unsafe-eval'", "'report-sample'", "'strict-dynamic'"],
    'style-src': ["'self'", 'https:', "'unsafe-inline'"],
    'connect-src': ["'self'", 'https:'],
    'media-src': ["'self'", 'http:', 'https:', 'blob:'],
    'frame-src': [
      'facebook.com',
    ],
    'font-src': ["'self'", 'data:', 'https:'],
    'img-src': ['data:', 'http:', 'https:', 'images.ctfassets.net'],
    'plugin-types': ['application/pdf'],
    'object-src': ["'none'"],
  };
  const policy = [];
  _.each(directives, (rule, directive) => {
    if (rule.length > 0) {
      let str = rule.join(' ');
      if (directive === 'script-src') {
        str += ` 'nonce-${hash}'`;
      }
      policy.push(`${directive} ${str}`);
    }
  });
  return policy.join('; ');
};

module.exports = async (req, res, next) => {
  res.locals.config = res.locals.config || {};
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.config.nonce = nonce;
  /**
   * Don't set header locally to keep console clean for development
   */
  if (config.env !== 'local') {
    res.set('Content-Security-Policy-Report-Only', makeCsp(nonce));
  }
  next();
};
