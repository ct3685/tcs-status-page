/* eslint arrow-body-style: ["error", "as-needed"] */
/* eslint-env es6 */
const _ = require('lodash');
const contentful = require('contentful');
const config = require('../../config');
const logger = require('../../config/logger')(__filename, 'contentful');


class ContentfulError extends Error {
  constructor(message) {
    super(message);
    this.status = _.get(message, 'response.status');
    this.message = _.get(message, 'response.data.message', 'Error message not found.');
    this.extra = _.pick(_.get(message, 'request'), [
      'path',
      'method',
    ]);
  }
}

/**
 * Helper function that will create the client based on the
 * main configuration settings.
 */
const client = contentful.createClient({
  space: config.services.contentful.space,
  environment: config.services.contentful.readEnvironment,
  accessToken: config.services.contentful.accessToken,
  host: config.services.contentful.host,
});

/**
 * Helper function that will take in a Contentful Entity and flatten it for use
 * in handlebars templates
 * @param  {object} entity Contentful Entry https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/entries
 * @return {object}        Clean Object
 */
const flattenCmsEntity = (entity) => {
  try {
    const entityType = _.get(entity, 'sys.type');
    let contentType;

    if (entityType === 'Entry') contentType = entity.sys.contentType.sys.id;
    else if (entityType === 'Asset') contentType = 'asset';
    else return entity;

    const tidyEntity = _.get(entity, 'fields', {});

    tidyEntity.sys = {
      id: entity.sys.id,
      contentType,
      locale: entity.sys.locale,
      revision: entity.sys.revision,
      createdAt: entity.sys.createdAt,
      updatedAt: entity.sys.updatedAt,
    };

    return tidyEntity;
  } catch (error) {
    logger.log('error', error);
    throw error;
  }
};


/**
 * Given a content item object from contentful,
 * It will return only the fields and will retrive the
 * fields of related items as well
 * @param  {object} obj Contentful Content Object https://www.contentful.com/developers/docs/concepts/data-model/
 * @return {Object}     An object with only the fields of the content item
 */
const tidyCmsEntity = (entities) => {
  try {
    if (_.isArray(entities)) {
      if (_.some(entities, 'sys.type')) {
        return _.map(entities, entity => tidyCmsEntity(entity));
      }
      return entities;
    }

    let entity = entities;
    const entityType = _.get(entity, 'sys.type');

    if (entityType === 'Entry' || entityType === 'Asset') {
      entity = flattenCmsEntity(entity);
    }

    return _.mapValues(entity, (fieldValue) => {
      if (_.isArray(fieldValue)) {
        if (_.some(fieldValue, 'sys.type')) {
          return _.map(fieldValue, refEntity => tidyCmsEntity(refEntity));
        }
        return fieldValue;
      } else if (_.has(fieldValue, 'sys')) {
        return tidyCmsEntity(fieldValue);
      }
      return fieldValue;
    });
  } catch (error) {
    logger.log('error', error);
    throw error;
  }
};

/**
 * Get Raw Entries items
 * @param  {Object} query Contentful Object
 * @return {Promise}       a promise with all the search results
 */
const getRawEntries = (query) => {
  if (_.isUndefined(query)) {
    return Promise.reject(new Error('contenful.getEntry - "query" undefined'));
  }

  return client.getEntries(query)
    .catch(error => Promise.reject(new ContentfulError(error)));
};

/**
 * It will communicate with contentful and receive a response
 * used to get a list of items
 * @param  {object}   query Contentful Query Object:
 * https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
 * @return {Promise}         Promise used by the controller to send the data to the next middleware
 */
const getEntries = (query, preFn) => {
  logger.log('debug', 'Query sent to Contentful', query);
  try {
    if (_.isUndefined(query)) {
      const message = 'contenful.getEntry - "query" undefined';
      return Promise.reject(new Error(message));
    }
  
    return client.getEntries(query)
      .then((results) => {
        let entities = results.items;
  
        if (preFn && typeof preFn === 'function') {
          entities = _.map(entities, e => preFn(e));
        }
        return tidyCmsEntity(entities);
      })
      .catch(error => Promise.reject(new ContentfulError(error)));
  } catch (error) {
    logger.log('error', error);
    throw error;
  }
};

/**
 * Helper function that will return one item
 * It will communicate with contentful and receive a response
 * @param  {object}   query Contentful Query Object:
 * https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
 * @return {Promise}         Promise used by the controller to send the data to the next middleware
 */
const getEntry = (query, preFn) => {
  logger.log('debug', 'Query sent to Contentful', query);
  try {
    if (_.isUndefined(query)) {
      return Promise.reject(new Error('contenful.getEntry - "query" not defined'));
    }
    query.limit = 1; // Always return one item
    return client.getEntries(query)
      .then((results) => {
        // If no entries found, return false
        if (!results.total) return false;
  
        let entity = _.head(results.items);
        if (preFn && typeof preFn === 'function') entity = preFn(entity);
        return tidyCmsEntity(entity);
      })
      .catch(error => Promise.reject(new ContentfulError(error)));
  } catch (error) {
    logger.log('error', error);
    throw error;
  }
};

module.exports = {
  client,
  getRawEntries,
  getEntries,
  getEntry,
  tidyCmsEntity,
};
