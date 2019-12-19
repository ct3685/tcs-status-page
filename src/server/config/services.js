module.exports = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  contentful: {
    accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
    managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    host: process.env.CONTENTFUL_API_HOST,
    space: process.env.CONTENTFUL_SPACE_ID,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  },
  google: {
    tagmanager: process.env.GOOGLE_TAG_MANAGER || '',
    analytics: process.env.GOOGLE_ANALYTICS || '',
  },
};
