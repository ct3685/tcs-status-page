const Parser = require('rss-parser');
const parser = new Parser();
const request = require('request');

const detail = async (req, res, next) => {
  // Full example for index.hbs
  try {
    // Normally will come from Contentful as global settings
    // res.locals.global = {
    //   something: 'settings',
    // };

    // Normally will be the content coming from Contentful
    // res.locals.pageData = {
    //   hello: 'world',
    // };

    // Get data from the services
    const herokuStatusFeed = await request('https://status.heroku.com/api/v4/current-status');
    const herokuIssuesFeed = await request('https://status.heroku.com/api/v4/incidents?since=2019-11-01&per_page=1');
    const bigCommerceFeed = await parser.parseURL('https://status.bigcommerce.com/history.rss');
    const netlifyFeed = await parser.parseURL('https://www.netlifystatus.com/history.rss');
    const circleCiFeed = await parser.parseURL('https://status.circleci.com/history.rss');
    const cloudwaysFeed = await parser.parseURL('http://status.cloudways.com/history.rss');
    const sentryFeed = await parser.parseURL('https://status.sentry.io/history.rss');
    const jiraServiceDeskFeed = await parser.parseURL('https://jira-service-desk.status.atlassian.com/history.rss');
    const googleAppsFeed = await parser.parseURL('https://www.google.com/appsstatus/rss/en');
    const zoomFeed = await parser.parseURL('https://www.google.com/appsstatus/rss/en');
    const contentfulFeed = await parser.parseURL('https://www.contentfulstatus.com/history.rss');
      
    // Parse that data and put into an object
    res.locals.pageData = {
      services: {
        herokuStatus: herokuStatusFeed,
        herokuIssues: herokuIssuesFeed,
        bigCommerce: bigCommerceFeed,
        netlify: netlifyFeed,
        circleCi: circleCiFeed,
        cloudways: cloudwaysFeed,
        sentry: sentryFeed,
        jiraServiceDesk: jiraServiceDeskFeed,
        googleApps: googleAppsFeed,
        zoom: zoomFeed,
        contentful: contentfulFeed
      }
    }

    // The .hbs file to use in the folder ./handlebars/pages
    res.locals.view = 'index';

    // Wil be a combination of configurations from Contentful and controller level config
    res.locals.config = res.locals.config || {};
    // All page custoomer styles shoudl be added to this namespace
    res.locals.config.styles = {
      bodyClass: 'custom-body-class',
      headerClass: 'custom-header-class',
    };
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  detail,
};
