const services = require('./services');

module.exports = {
  port: process.env.PORT || '3000',
  env: process.env.NODE_ENV || 'local',
  logger: {
    level: process.env.LOGGER_LEVEL || 'info',
    enabled: process.env.LOGGER_ENABLED ? process.env.LOGGER_ENABLED === 'true' : true,
  },
  services,
};
