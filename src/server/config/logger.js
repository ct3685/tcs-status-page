/* eslint-disable no-param-reassign */
const path = require('path');
const winston = require('winston');
const flat = require('flat');
const expressWinston = require('express-winston');
const _ = require('lodash');
const sentry = require('@sentry/node');
const config = require('../config');

const { combine, timestamp, printf, colorize } = winston.format;

const winstonLogger = winston.createLogger({
  level: _.get(config, 'logger.level', 'info'),
  format: combine(
    timestamp(),
    colorize(),
    printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

if (!config.logger.enabled || config.env === 'test') {
  winstonLogger.remove(winston.transports.Console);
}

module.exports = (fileName, category) => {
  return {
  /**
   * Used for logging all actions. We can build out more complex logging as we go.
   * @param  {String} level Options are ['error', 'warn', 'info', 'verbose', 'debug']
   * @param  {Object} msg   Can be a string, or an object to write to the log
   * @param  {Object} request Express Request Object
   */
    log: (level, msg, additionalData) => {
      fileName = _.replace(fileName, path.join(__dirname, '../../../'), './');
      const cat = category || 'general';

      if (msg instanceof Error) {
        sentry.withScope((scope) => {
          scope.setTag('fileName', fileName);
          if (_.isObject(additionalData)) {
            _.forOwn(flat(additionalData), (value, key) => {
              scope.setExtra(key, value);
            });
          }
          sentry.captureException(msg);
        });
        winstonLogger.log('error', msg.stack);
      } else if (_.isObject(msg)) {
        // Log the data passed in
        sentry.addBreadcrumb({
          data: msg,
          level,
          category,
        });
        winstonLogger.log(level, JSON.stringify(msg, null, 2));
      } else {
        // Simple string message log
        const message = `[${cat}]: ${_.get(msg, 'message', msg)} (${fileName})`;
        sentry.addBreadcrumb({
          message,
          level: 'info',
          category,
        });
        winstonLogger.log(level, message);
      }

      if (additionalData) {
        winstonLogger.log(level, JSON.stringify(additionalData, null, 2));
      }
    },
    sentryInit: (sentryObj) => {
      sentryObj.init({
        dsn: config.services.sentry.dsn_backend,
        environment: config.env,
        release: `${config.gitSha}`,
        // TODO: Need to create a beforeCapture and beforeBreadcrumbs to prune any sensitive data
        beforeBreadcrumb(breadcrumb) {
          // breadcrumb.message = scrubMessage(breadcrumb.message);
          return breadcrumb;
        },
        beforeSend(event) {
          // event.exception.values.forEach((v) => {
          //   v.value = scrubMessage(v.value);
          // });

          return event;
        },
      });
    },
    expressLogger: expressWinston.logger({
      format: combine(
        timestamp(),
        colorize(),
        printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: [route] ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
      ],
      // expressFormat: true,
      msg: '{{req.method}} {{res.statusCode}} {{res.responseTime}}ms {{req.url}}',
      colorize: true,
      ignoreRoute: (req) => {
        if (_.startsWith(req.originalUrl, '/assets')) {
          return false;
        }
      },
    }),
  };
};
