const _ = require('lodash');
const qs = require('querystring');

const redirects = {
  '/testredirect': '/redirected',
};

const appendQueryString = (query, redirectPath) => {
  let fullPathWithQuery = redirectPath;
  if (_.isObject(query) && !_.isEmpty(query)) {
    fullPathWithQuery += `?${qs.stringify(query)}`;
  }
  return fullPathWithQuery;
};

const redirect = (req, res, next) => {
  const path = _.endsWith(req.path, '/') ? req.path.slice(0, -1) : req.path; // Remove any training slashes
  let redirectPath = _.get(redirects, path);
  if (_.isUndefined(req.path) || !redirectPath) {
    next();
  } else {
    // apend the query string ot the end of the redirect
    redirectPath = appendQueryString(req.query, _.get(redirects, path));

    // Check for localization
    res.redirect(301, `${_.get(res, 'locals.config.rootPath', '/')}${redirectPath}`);
    res.end();
  }
};

module.exports = {
  redirect,
};
