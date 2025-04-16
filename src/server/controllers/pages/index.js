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
            timeout: 10000,
          },
          (error, response, body) => {
            if (error) {
              console.error(`Heroku API request failed: ${error.message}`);
              return reject(error);
            }
            if (!response || response.statusCode !== 200) {
              const statusError = new Error(`Invalid status code: ${response?.statusCode}`);
              console.error(`Heroku API request failed: ${statusError.message}`);
              return reject(statusError);
            }
            if (!body) {
              const bodyError = new Error('Empty response body');
              console.error(`Heroku API request failed: ${bodyError.message}`);
              return reject(bodyError);
            }
            return resolve(body);
          },
        );
      });

    const safePromise = async (promise, serviceName) => {
      try {
        return await promise;
      } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        console.error(`Failed to fetch status for ${serviceName}:`, {
          service: serviceName,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          stack: error.stack,
        });
        return {
          items: [],
          error: true,
          errorMessage: errorMessage,
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
      safePromise(parser.parseURL('https://status.openai.com/history.rss'), 'OpenAI'),
      safePromise(parser.parseURL('https://status.upstash.com/history.rss'), 'Upstash'),
      safePromise(parser.parseURL('https://status.anthropic.com/history.rss'), 'Anthropic'),
      safePromise(parser.parseURL('https://status.bitwarden.com/state_feed/feed'), 'Bitwarden'),
      safePromise(parser.parseURL('https://status.lastpass.com/history.rss'), 'LastPass'),
      safePromise(parser.parseURL('https://status.smartling.com/history.rss'), 'Smartling'),
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
      openaiFeed,
      upstashFeed,
      anthropicFeed,
      bitwardenFeed,
      lastpassFeed,
      smartlingFeed,
    ] = await Promise.all(promiseArray);

    const normalizeHerokuFeed = (feed, serviceDisplayName, serviceIdName, serviceURL) => {
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
          pubTime: moment(herokuIssue.created_at).tz('America/Los_Angeles').format('HH:mm'),
          title: herokuIssue.title,
          state: herokuIssue.state,
          fullUrl: herokuIssue.full_url,
          updates: [],
        };

        _.each(herokuIssue.updates, updates => {
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
        try {
          const maintenanceKeywords = [
            'scheduled maintenance',
            'planned maintenance',
            'maintenance window',
            'service maintenance',
            'emergency maintenance',
            'this is a scheduled event',
          ];

          // Check for maintenanceEndDate which is directly from the RSS feed
          if (issue.maintenanceEndDate) {
            return true;
          }

          const content = issue.content?.text || issue.content || issue.description;
          const title = issue.title?.toLowerCase() || '';

          // Check if the title contains maintenance keywords
          if (title.includes('maintenance') || title.includes('on 2025-04-22') || title.includes('on 2025-04-')) {
            return true;
          }

          // If it's explicitly a maintenance event
          return maintenanceKeywords.some(
            keyword => title.includes(keyword) || (content && content.toLowerCase().includes(keyword)),
          );
        } catch (error) {
          console.error('Error in isMaintenanceEvent:', error);
          return false;
        }
      };

      const isNoIncidentMessage = (title, content) => {
        // Only check the title for these phrases
        const noIncidentTitlePhrases = [
          'no incidents reported',
          'all systems operational',
          'operating normally',
          'no known issues',
        ];

        // Don't filter out issues just because they're resolved
        const title_lower = title.toLowerCase();
        if (noIncidentTitlePhrases.some(phrase => title_lower.includes(phrase))) {
          return true;
        }

        // If it's an update to a maintenance event, filter it out
        if (title_lower.startsWith('update') && content?.toLowerCase().includes('maintenance')) {
          return true;
        }

        return false;
      };

      const safeParseDate = dateString => {
        try {
          const parsed = moment(dateString);
          if (!parsed.isValid()) {
            console.error(`Invalid date format for ${serviceDisplayName}: ${dateString}`);
            return moment(); // fallback to current time
          }
          return parsed;
        } catch (error) {
          console.error(`Date parsing error for ${serviceDisplayName}:`, error);
          return moment(); // fallback to current time
        }
      };

      const allIssues = feed.items
        ? feed.items
            .filter(issue => {
              try {
                const content = issue.content?.text || issue.content || issue.description;

                // Filter out maintenance events AND no incident messages
                if (isNoIncidentMessage(issue.title, content) || isMaintenanceEvent(issue)) {
                  if (isMaintenanceEvent(issue)) {
                    console.log(`Filtering out maintenance event: ${issue.title}`);
                  }
                  return false;
                }

                return true;
              } catch (error) {
                console.error(`Filter error for ${serviceDisplayName}:`, error);
                return false; // Skip problematic items
              }
            })
            .map(issue => {
              try {
                const date = issue.published || issue.isoDate;
                const issueMoment = safeParseDate(date);
                const content = issue.content?.text || issue.content || issue.description;

                return {
                  isAtlassianFeed: true,
                  id: new Date(date).getTime(),
                  pubDate: issueMoment.format('MMM DD, YYYY'),
                  pubTime: issueMoment.tz('America/Los_Angeles').format('HH:mm'),
                  title: issue.title || 'Untitled Issue',
                  fullUrl: issue.link || issue.url || issue.fullUrl || serviceURL,
                  content: content || '',
                  isoDate: date,
                  isVeryRecent: issueMoment.isAfter(moment().subtract(3, 'h')) && issueMoment.isBefore(moment()),
                  isRecent: issueMoment.isAfter(moment().subtract(24, 'h')) && issueMoment.isBefore(moment()),
                };
              } catch (error) {
                console.error(`Mapping error for ${serviceDisplayName}:`, error);
                return null;
              }
            })
            .filter(Boolean) // Remove any null entries from mapping errors
        : [];

      // Add error handling for sorting
      const sortedCurrentIssues = (() => {
        try {
          return _.orderBy(allIssues, ['isoDate'], ['desc']).slice(0, 5);
        } catch (error) {
          console.error(`Sorting error for ${serviceDisplayName}:`, error);
          return allIssues.slice(0, 5); // Fallback to unsorted
        }
      })();

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
      };
    };

    const servicesObject = {
      anthropic: normalizeRssFeed(anthropicFeed, 'Anthropic', 'anthropic', 'https://status.anthropic.com/'),
      circleCi: normalizeRssFeed(circleCi, 'Circle Ci', 'circleci', 'https://status.circleci.com/'),
      cloudflare: normalizeRssFeed(cloudflareFeed, 'Cloudflare', 'cloudflare', 'https://www.cloudflarestatus.com/'),
      cloudways: normalizeRssFeed(cloudways, 'Cloudways', 'cloudways', 'https://status.cloudways.com/'),
      contentful: normalizeRssFeed(contentfulFeed, 'Contentful', 'contentful', 'https://www.contentfulstatus.com/'),
      formAssembly: normalizeRssFeed(
        formAssemblyFeed,
        'Form Assembly',
        'formassembly',
        'https://status.formassembly.com/',
      ),
      github: normalizeRssFeed(githubFeed, 'Github', 'github', 'https://www.githubstatus.com/'),
      heroku: normalizeHerokuFeed(herokuIssues, 'Heroku', 'heroku', 'https://status.heroku.com/'),
      hubspot: normalizeRssFeed(hubspotFeed, 'HubSpot', 'hubspot', 'https://status.hubspot.com/'),
      jiraServiceDesk: normalizeRssFeed(
        jiraServiceDesk,
        'Jira Service Desk',
        'jiraservicedesk',
        'https://jira-service-desk.status.atlassian.com/',
      ),
      netlify: normalizeRssFeed(netlify, 'Netlify', 'netlify', 'https://www.netlifystatus.com/'),
      openai: normalizeRssFeed(openaiFeed, 'OpenAI', 'openai', 'https://status.openai.com/'),
      sendgrid: normalizeRssFeed(sendgridFeed, 'Sendgrid', 'sendgrid', 'https://status.sendgrid.com/'),
      sentry: normalizeRssFeed(sentry, 'Sentry', 'sentry', 'https://status.sentry.io/'),
      slack: normalizeRssFeed(slackFeed, 'Slack', 'slack', 'https://status.slack.com/'),
      tempo: normalizeRssFeed(tempoFeed, 'Tempo', 'tempo', 'https://status.tempo.io/'),
      upstash: normalizeRssFeed(upstashFeed, 'Upstash', 'upstash', 'https://status.upstash.com/'),
      vercel: normalizeRssFeed(vercelFeed, 'Vercel', 'vercel', 'https://www.vercel-status.com/'),
      zoom: normalizeRssFeed(zoom, 'Zoom', 'zoom', 'https://status.zoom.us/'),
      bitwarden: normalizeRssFeed(bitwardenFeed, 'Bitwarden', 'bitwarden', 'https://status.bitwarden.com/'),
      lastpass: normalizeRssFeed(lastpassFeed, 'LastPass', 'lastpass', 'https://status.lastpass.com/'),
      smartling: normalizeRssFeed(smartlingFeed, 'Smartling', 'smartling', 'https://status.smartling.com/'),
    };

    const sortedServices = (() => {
      try {
        return Object.keys(servicesObject)
          .sort()
          .reduce((obj, key) => {
            obj[key] = servicesObject[key];
            return obj;
          }, {});
      } catch (error) {
        console.error('Error sorting services:', error);
        return servicesObject; // Fallback to unsorted
      }
    })();

    res.locals.pageData = {
      services: sortedServices,
    };

    res.locals.view = 'index';
    res.locals.config = res.locals.config || {};
    res.locals.config.styles = {
      bodyClass: 'custom-body-class',
      headerClass: 'custom-header-class',
    };
    next();
  } catch (error) {
    console.error('Fatal error in detail controller:', error);
    next(error);
  }
};

module.exports = {
  detail,
};
