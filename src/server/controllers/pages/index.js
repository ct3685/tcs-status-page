const Parser = require('rss-parser');

const parser = new Parser();
const request = require('request');
const _ = require('lodash');
const moment = require('moment-timezone');

const detail = async (req, res, next) => {
  try {
    const getHerokuPromise = async url =>
      new Promise((resolve, reject) => {
        request(
          {
            url,
            json: true,
          },
          (error, response, body) => {
            if (error || response.statusCode !== 200) {
              return reject(error);
            }
            return resolve(body);
          },
        );
      });

    const safePromise = async (promise, serviceName) => {
      try {
        return await promise;
      } catch (error) {
        console.error(`Failed to fetch status for ${serviceName}:`, error);
        return {
          items: [],
          error: true,
        };
      }
    };

    const promiseArray = [
      safePromise(getHerokuPromise('https://status.heroku.com/api/v4/incidents'), 'Heroku'),
      safePromise(parser.parseURL('https://www.netlifystatus.com/history.rss'), 'Netlify'),
      safePromise(parser.parseURL('https://status.circleci.com/history.rss'), 'Circle Ci'),
      safePromise(parser.parseURL('https://status.cloudways.com/history.rss'), 'Cloudways'),
      safePromise(parser.parseURL('https://status.sentry.io/history.rss'), 'Sentry'),
      safePromise(parser.parseURL('https://jira-service-desk.status.atlassian.com/history.rss'), 'Jira Service Desk'),
      safePromise(parser.parseURL('https://status.zoom.us/history.rss'), 'Zoom'),
      safePromise(parser.parseURL('https://www.contentfulstatus.com/history.rss'), 'Contentful'),
      safePromise(parser.parseURL('https://status.formassembly.com/history.rss'), 'Form Assembly'),
      safePromise(parser.parseURL('https://www.githubstatus.com/history.rss'), 'Github'),
      safePromise(parser.parseURL('https://www.cloudflarestatus.com/history.rss'), 'Cloudflare'),
      safePromise(parser.parseURL('https://status.tempo.io/history.rss'), 'Tempo'),
      safePromise(parser.parseURL('https://status.hubspot.com/history.rss'), 'HubSpot'),
      safePromise(parser.parseURL('https://status.slack.com/feed/rss'), 'Slack'),
      safePromise(parser.parseURL('https://www.vercel-status.com/history.rss'), 'Vercel'),
      safePromise(parser.parseURL('https://status.sendgrid.com/history.rss'), 'Sendgrid'),
      safePromise(parser.parseURL('https://status.envkey.com/history.rss'), 'Envkey'),
      safePromise(parser.parseURL('https://status.openai.com/history.rss'), 'OpenAI'),
      safePromise(parser.parseURL('https://status.upstash.com/history.rss'), 'Upstash'),
      safePromise(parser.parseURL('https://status.anthropic.com/history.rss'), 'Anthropic'),
    ];

    const [
      herokuIssues,
      netlify,
      circleCi,
      cloudways,
      sentry,
      jiraServiceDesk,
      zoom,
      contentfulFeed,
      formAssemblyFeed,
      githubFeed,
      cloudflareFeed,
      tempoFeed,
      hubspotFeed,
      slackFeed,
      vercelFeed,
      sendgridFeed,
      envkeyFeed,
      openaiFeed,
      upstashFeed,
      anthropicFeed,
    ] = await Promise.all(promiseArray);

    const normalizeHerokuFeed = (
      feed,
      serviceDisplayName,
      serviceIdName,
      serviceURL,
    ) => {
      if (feed.error) {
        return {
          issueClassColor: 'status-unknown',
          serviceName: serviceDisplayName,
          serviceId: serviceIdName,
          serviceURL,
          serviceLogo: `/images/${serviceIdName}Logo.png`,
          issues: [],
          isServiceDown: true,
        };
      }

      const mostRecentIssues = _.head(feed);
      const mostRecentTime = mostRecentIssues.created_at;

      const statusColor = time => {
        if (moment(time).isAfter(moment())) {
          return 'status-blue';
        }
        if (moment(time).isAfter(moment().subtract(3, 'h'))) {
          return 'status-red';
        }
        if (moment(time).isAfter(moment().subtract(12, 'h'))) {
          return 'status-yellow';
        }
        return 'status-green';
      };

      const herokuNormalized = {
        issueClassColor: statusColor(mostRecentTime),
        serviceName: serviceDisplayName,
        serviceId: serviceIdName,
        serviceURL,
        serviceLogo: `/images/${serviceIdName}Logo.png`,
        issues: [],
      };

      _.each(feed, herokuIssue => {
        const normIssue = {
          isHerokuFeed: true,
          id: herokuIssue.id,
          pubDate: moment(herokuIssue.created_at).format('MMM DD, YYYY'),
          pubTime: moment(herokuIssue.created_at)
            .tz('America/Los_Angeles')
            .format('HH:mm'),
          title: herokuIssue.title,
          state: herokuIssue.state,
          fullUrl: herokuIssue.full_url,
          updates: [],
        };

        _.each(herokuIssue.updates, updates => {
          const updateIssue = {
            pubDate: moment(updates.created_at).format('MMM DD,'),
            pubTime: moment(updates.created_at)
              .tz('America/Los_Angeles')
              .format('HH:mm'),
            title: updates.contents,
            state: updates.update_type,
          };
          normIssue.updates.push(updateIssue);
        });

        herokuNormalized.issues.push(normIssue);
      });

      return herokuNormalized;
    };

    const normalizeRssFeed = (feed, serviceDisplayName, serviceIdName, serviceURL) => {
      if (feed.error) {
        return {
          issueClassColor: 'status-unknown',
          serviceName: serviceDisplayName,
          serviceId: serviceIdName,
          serviceURL,
          serviceLogo: `/images/${serviceIdName}Logo.png`,
          issues: [],
          maintenanceEvents: [],
          hasFutureMaintenance: false,
          isServiceDown: true,
        };
      }

      const currentTime = moment();

      const isMaintenanceEvent = issue => {
        const maintenanceKeywords = [
          'maintenance',
          'scheduled',
          'planned',
          'upgrade',
          'update',
        ];
        return (
          moment(issue.isoDate).isAfter(currentTime) ||
          maintenanceKeywords.some(keyword =>
            issue.title.toLowerCase().includes(keyword) ||
            (issue.description && issue.description.toLowerCase().includes(keyword)),
          )
        );
      };

      const allIssues = feed.items
        ? feed.items.map(issue => {
            const issueMoment = moment(issue.isoDate);
            return {
              isAtlassianFeed: true,
              id: new Date(issue.isoDate).getTime(),
              pubDate: issueMoment.format('MMM DD, YYYY'),
              pubTime: issueMoment.tz('America/Los_Angeles').format('HH:mm'),
              title: issue.title,
              fullUrl: issue.fullUrl,
              content: issue.content,
              isoDate: issue.isoDate,
              isFutureMaintenance: isMaintenanceEvent(issue),
              isVeryRecent: issueMoment.isAfter(moment().subtract(3, 'h')),
              isRecent: issueMoment.isAfter(moment().subtract(24, 'h')),
            };
          })
        : [];

      const currentIssues = allIssues.filter(
        issue => !issue.isFutureMaintenance,
      );
      const maintenanceEvents = allIssues.filter(
        issue => issue.isFutureMaintenance,
      );

      const sortedCurrentIssues = _.orderBy(
        currentIssues,
        ['isoDate'],
        ['desc'],
      ).slice(0, 5);

      const sortedMaintenanceEvents = _.orderBy(
        maintenanceEvents,
        ['isoDate'],
        ['asc'],
      ).slice(0, 2);

      const statusColor = () => {
        if (sortedCurrentIssues.length > 0) {
          const mostRecentIncident = sortedCurrentIssues[0];
          
          if (moment(mostRecentIncident.isoDate).isAfter(moment().subtract(3, 'h'))) {
            return 'status-red';
          }
          if (moment(mostRecentIncident.isoDate).isAfter(moment().subtract(24, 'h'))) {
            return 'status-yellow';
          }
        }

        return 'status-green';
      };

      return {
        issueClassColor: statusColor(),
        serviceName: serviceDisplayName,
        serviceId: serviceIdName,
        serviceURL,
        serviceLogo: `/images/${serviceIdName}Logo.png`,
        issues: sortedCurrentIssues,
        maintenanceEvents: sortedMaintenanceEvents,
        hasFutureMaintenance: sortedMaintenanceEvents.length > 0,
      };
    };

    res.locals.pageData = {
      services: {
        anthropic: normalizeRssFeed(
          anthropicFeed,
          'Anthropic',
          'anthropic',
          'https://status.anthropic.com/',
        ),
        circleCi: normalizeRssFeed(
          circleCi,
          'Circle Ci',
          'circleci',
          'https://status.circleci.com/',
        ),
        cloudflare: normalizeRssFeed(
          cloudflareFeed,
          'Cloudflare',
          'cloudflare',
          'https://www.cloudflarestatus.com/',
        ),
        cloudways: normalizeRssFeed(
          cloudways,
          'Cloudways',
          'cloudways',
          'https://status.cloudways.com/',
        ),
        contentful: normalizeRssFeed(
          contentfulFeed,
          'Contentful',
          'contentful',
          'https://www.contentfulstatus.com/',
        ),
        envkey: normalizeRssFeed(
          envkeyFeed,
          'Envkey',
          'envkey',
          'https://status.envkey.com/',
        ),
        formAssembly: normalizeRssFeed(
          formAssemblyFeed,
          'Form Assembly',
          'formassembly',
          'https://status.formassembly.com/',
        ),
        github: normalizeRssFeed(
          githubFeed,
          'Github',
          'github',
          'https://www.githubstatus.com/',
        ),
        heroku: normalizeHerokuFeed(
          herokuIssues,
          'Heroku',
          'heroku',
          'https://status.heroku.com/',
        ),
        hubspot: normalizeRssFeed(
          hubspotFeed,
          'HubSpot',
          'hubspot',
          'https://status.hubspot.com/',
        ),
        jiraServiceDesk: normalizeRssFeed(
          jiraServiceDesk,
          'Jira Service Desk',
          'jiraservicedesk',
          'https://jira-service-desk.status.atlassian.com/',
        ),
        netlify: normalizeRssFeed(
          netlify,
          'Netlify',
          'netlify',
          'https://www.netlifystatus.com/',
        ),
        openai: normalizeRssFeed(
          openaiFeed,
          'OpenAI',
          'openai',
          'https://status.openai.com/',
        ),
        sendgrid: normalizeRssFeed(
          sendgridFeed,
          'Sendgrid',
          'sendgrid',
          'https://status.sendgrid.com/',
        ),
        sentry: normalizeRssFeed(
          sentry,
          'Sentry',
          'sentry',
          'https://status.sentry.io/',
        ),
        slack: normalizeRssFeed(
          slackFeed,
          'Slack',
          'slack',
          'https://status.slack.com/',
        ),
        tempo: normalizeRssFeed(
          tempoFeed,
          'Tempo',
          'tempo',
          'https://status.tempo.io/',
        ),
        upstash: normalizeRssFeed(
          upstashFeed,
          'Upstash',
          'upstash',
          'https://status.upstash.com/',
        ),
        vercel: normalizeRssFeed(
          vercelFeed,
          'Vercel',
          'vercel',
          'https://www.vercel-status.com/',
        ),
        zoom: normalizeRssFeed(
          zoom,
          'Zoom',
          'zoom',
          'https://status.zoom.us/',
        ),
      },
    };

    res.locals.view = 'index';
    res.locals.config = res.locals.config || {};
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
