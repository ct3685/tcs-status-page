/**
 * This is a middleware module that is ran after all routes and controllers have ran
 * If you need to do any data cleanup before it is sent back to the browser
 * add that here. It should only decorate the res.locals param
 */

module.exports = (req, res, next) => {
  next();
};
