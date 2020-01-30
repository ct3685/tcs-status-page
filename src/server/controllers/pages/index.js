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
    
    const getHerokuPromise = async (url) => {
      return new Promise((resolve, reject) => {
        request({
          url: url,
          json: true,
        }, function (error, response, body) {
          if(error || response.statusCode !== 200) {
            return reject(error);
          }
          return resolve(body);
        })
      })
    }
    
    const promiseArray = []

    promiseArray.push(getHerokuPromise('https://status.heroku.com/api/v4/incidents'));
    promiseArray.push(parser.parseURL('https://status.bigcommerce.com/history.rss'));
    promiseArray.push(parser.parseURL('https://www.netlifystatus.com/history.rss'));
    promiseArray.push(parser.parseURL('https://status.circleci.com/history.rss'));
    promiseArray.push(parser.parseURL('http://status.cloudways.com/history.rss'));
    promiseArray.push(parser.parseURL('https://status.sentry.io/history.rss'));
    promiseArray.push(parser.parseURL('https://jira-service-desk.status.atlassian.com/history.rss'));
    promiseArray.push(parser.parseURL('https://www.google.com/appsstatus/rss/en'));
    promiseArray.push(parser.parseURL('https://status.zoom.us/history.rss'));
    promiseArray.push(parser.parseURL('https://www.contentfulstatus.com/history.rss'));

    const [herokuIssues, bigCommerce, netlify, circleCi, cloudways, sentry, jiraServiceDesk, googleApps, zoom, contentful] = await Promise.all(promiseArray);
debugger

    // Parse that data and put into an object
    res.locals.pageData = {
      services: {
        herokuIssues,
        bigCommerce,
        netlify,
        circleCi,
        cloudways,
        sentry,
        jiraServiceDesk,
        // googleApps,
        zoom,
        contentful
      }
    }

    const herokuNormalized = {
      name: 'Test'
    }


    console.log(herokuNormalized)

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
