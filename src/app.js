const express = require('express');
const exphbs = require('express-handlebars');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
// const sentry = require('@sentry/node');
const hbsHelpers = require('handlebars-helpers')();


// Configuration
const config = require('./server/config');
const preRouteDecorator = require('./server/middleware/pre_route_decorator');
const postRouteDecorator = require('./server/middleware/post_route_decorator');
const redirectsMiddleware = require('./server/middleware/redirects');
const responder = require('./server/middleware/responder');

const webRoutes = require('./server/routes/web');
const apiRoutes = require('./server/routes/api');

const app = express();
// Setup Logging with Sentry
// sentry.init({
//   dsn: config.services.sentry.server_dsn,
//   environment: config.env,
//   release: config.gitSha,
// });
// app.use(sentry.Handlers.requestHandler());

// Setup Security and Cross Script Protection
app.use(helmet());
//app.use(require('./server/middleware/csp'));

app.use(
  morgan('dev', {
    skip: (req, res) => req.path.indexOf('/assets') > -1,
  }),
);

// Handlebars view engine setup
const customHbsHelpers = require('./handlebars/helpers');

const allHbsHelpers = Object.assign(hbsHelpers, customHbsHelpers);
const hbs = exphbs.create({
  defaultLayout: 'www_layout',
  layoutsDir: path.join(__dirname, './handlebars/layouts'),
  partialsDir: path.join(__dirname, './handlebars/partials'),
  extname: 'hbs',
  helpers: allHbsHelpers,
});
app.set('views', path.join(__dirname, './handlebars/pages'));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Body & Cookie Parsing helpers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Caching
// Cache all public folder assets for a week on fastly and in the browser
app.use(
  express.static(path.join(__dirname, '../public'), {
    setHeaders: (res) => {
      res.set('Surrogate-Control', 'max-age=604800');
      res.set('Cache-Control', 'public, max-age=604800');
    },
  }),
);

// Set the Fastly Cache for 15 minutes on all responses
app.use((req, res, next) => {
  res.set('Surrogate-Control', 'max-age=900');
  next();
});

// Routing
// Pre Route Decorator for global config object
app.use(preRouteDecorator);

// Check if any routes are part of the redirect middleware
app.get('*', redirectsMiddleware.redirect);

// API Routes
app.use('/api', apiRoutes);


// Web Routes
app.use('/', webRoutes);


// Post route decorator for the global config object
app.use(postRouteDecorator);


// Responding to Requests
app.use(responder.respond);
// app.use(sentry.Handlers.errorHandler());
app.use(responder.notFound);
app.use((err, req, res, next) => {
  // sentry.captureException(err.msg);
  responder.error(err, req, res, next);
});

module.exports = app;
