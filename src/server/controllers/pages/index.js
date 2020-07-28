const Parser = require('rss-parser');

const parser = new Parser();
const request = require('request');
const _ = require('lodash');
const moment = require('moment-timezone');

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

    const getHerokuPromise = async url => new Promise((resolve, reject) => {
      request({
        url,
        json: true,
      }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          return reject(error);
        }
        return resolve(body);
      });
    });

    const promiseArray = [];

    promiseArray.push(getHerokuPromise('https://status.heroku.com/api/v4/incidents'));
    promiseArray.push(parser.parseURL('https://status.bigcommerce.com/history.rss'));
    promiseArray.push(parser.parseURL('https://www.netlifystatus.com/history.rss'));
    promiseArray.push(parser.parseURL('https://status.circleci.com/history.rss'));
    promiseArray.push(parser.parseURL('http://status.cloudways.com/history.rss'));
    promiseArray.push(parser.parseURL('https://status.sentry.io/history.rss'));
    promiseArray.push(parser.parseURL('https://jira-service-desk.status.atlassian.com/history.rss'));
    promiseArray.push(parser.parseURL('https://status.zoom.us/history.rss'));
    promiseArray.push(parser.parseURL('https://www.contentfulstatus.com/history.rss'));
    promiseArray.push(parser.parseURL('http://status.formassembly.com/history.rss'));
    promiseArray.push(parser.parseURL('https://www.githubstatus.com/history.rss'));
    promiseArray.push(parser.parseURL('https://www.cloudflarestatus.com/history.rss'));

    const [herokuIssues, bigCommerce, netlify, circleCi, cloudways, sentry, jiraServiceDesk, zoom, contentfulFeed, formAssemblyFeed, githubFeed, cloudflareFeed] = await Promise.all(promiseArray);

    // Normalizing Heroku Status Page Feed
    const normalizeHerokuFeed = (feed, serviceDisplayName, serviceIdName, serviceURL) => {
      const mostRecentIssues = _.head(feed);
      const mostRecentIssue = mostRecentIssues.created_at;

      const statusColor = (mostRecentIssue) => {
        if (moment(mostRecentIssue).isAfter(moment())) {
          return 'status-blue';
        } if (moment(mostRecentIssue).isAfter(moment().subtract(3, 'h'))) {
          return 'status-red';
        } if (moment(mostRecentIssue).isAfter(moment().subtract(12, 'h'))) {
          return 'status-yellow';
        }
        return 'status-green';
      };

      const herokuNormalized = {
        issueClassColor: statusColor(mostRecentIssue),
        serviceName: serviceDisplayName,
        serviceId: serviceIdName,
        serviceURL,
        serviceLogo: `/images/${serviceIdName}Logo.png`,
        issues: [],
      };

      _.each(feed, (herokuIssue) => {
        const normIssue = {
          isHerokuFeed: true,
          id: herokuIssue.id,
          pubDate: moment(herokuIssue.created_at).format('MMM DD, YYYY'),
          pubTime: moment(herokuIssue.created_at).tz('America/Los_Angeles').format('HH:mm'),
          title: herokuIssue.title,
          state: herokuIssue.state,
          fullUrl: herokuIssue.full_url,
          updates: [],
        };

        _.each(herokuIssue.updates, (updates) => {
          const updateIssue = {
            pubDate: moment(updates.created_at).format('MMM DD,'),
            pubTime: moment(updates.created_at).tz('America/Los_Angeles').format('HH:mm'),
            title: updates.contents,
            state: updates.update_type,
          };
          normIssue.updates.push(updateIssue);
        });

        herokuNormalized.issues.push(normIssue);
      });

      return herokuNormalized;
    };

    // Normalizing All Current RSS Feeds coming from Atlassian Status Page
    const normalizeRssFeed = (feed, serviceDisplayName, serviceIdName, serviceURL) => {
      const mostRecentIssue = _.head(feed.items);

      const statusColor = (mostRecentIssue) => {
        if (moment(mostRecentIssue.isoDate).isAfter(moment())) {
          return 'status-blue';
        } if (moment(mostRecentIssue.isoDate).isAfter(moment().subtract(3, 'h'))) {
          return 'status-red';
        } if (moment(mostRecentIssue.isoDate).isAfter(moment().subtract(12, 'h'))) {
          return 'status-yellow';
        }
        return 'status-green';
      };

      const rssNormalized = {
        issueClassColor: statusColor(mostRecentIssue),
        serviceName: serviceDisplayName,
        serviceId: serviceIdName,
        serviceURL,
        serviceLogo: `/images/${serviceIdName}Logo.png`,
        issues: [],
      };

      _.each(feed.items, (issue) => {
        const normIssue = {
          isAtlassianFeed: true,
          id: new Date(issue.isoDate).getTime(),
          pubDate: moment(issue.isoDate).format('MMM DD, YYYY'),
          pubTime: moment(issue.isoDate).tz('America/Los_Angeles').format('HH:mm'),
          title: issue.title,
          fullUrl: issue.fullUrl,
          content: issue.content,
        };
        rssNormalized.issues.push(normIssue);
      });

      return rssNormalized;
    };

    // Parse that data and put into an object
    res.locals.pageData = {
      // // original data if needing to troubleshoot
      // originalData: {
      //   bigCommerce,
      //   circleCi,
      //   cloudways,
      //   contentfulFeed,
      //   formAssemblyFeed,
      //   github,
      //   herokuIssues,
      //   jiraServiceDesk,
      //   netlify,
      //   sentry,
      //   zoom
      // },
      services: {
        // use alphabetical order please
        // feedName: normailzeFunc(feedNameAgain, 'DisplayName', 'idForClassesandIDsNoDashesAllLowercase', 'serviceStatusPageNonRssOrJsonFeedUrl' )
        bigCommerce: normalizeRssFeed(bigCommerce, 'BigCommerce', 'bigcommerce', 'https://status.bigcommerce.com/'),
        circleCi: normalizeRssFeed(circleCi, 'Circle Ci', 'circleci', 'https://status.circleci.com/'),
        cloudflare: normalizeRssFeed(cloudflareFeed, 'Cloudflare', 'cloudflare', 'https://www.cloudflarestatus.com/'),
        cloudways: normalizeRssFeed(cloudways, 'Cloudways', 'cloudways', 'http://status.cloudways.com/'),
        contentfulFeed: normalizeRssFeed(contentfulFeed, 'Contentful', 'contentful', 'https://www.contentfulstatus.com/'),
        formAssemblyFeed: normalizeRssFeed(formAssemblyFeed, 'Form Assembly', 'formassembly', 'http://status.formassembly.com/'),
        githubFeed: normalizeRssFeed(githubFeed, 'Github', 'github', 'https://www.githubstatus.com/'),
        herokuIssues: normalizeHerokuFeed(herokuIssues, 'Heroku', 'heroku', 'https://status.heroku.com/'),
        jiraServiceDesk: normalizeRssFeed(jiraServiceDesk, 'Jira Service Desk', 'jiraservicedesk', 'https://jira-service-desk.status.atlassian.com/'),
        netlify: normalizeRssFeed(netlify, 'Netlify', 'netlify', 'https://www.netlifystatus.com/'),
        sentry: normalizeRssFeed(sentry, 'Sentry', 'sentry', 'https://status.sentry.io/'),
        zoom: normalizeRssFeed(zoom, 'Zoom', 'zoom', 'https://status.zoom.us/'),
      },
    };

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
