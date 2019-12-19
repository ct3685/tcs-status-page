const detail = async (req, res, next) => {
  // Full example for index.hbs
  try {
    // Normally will come from Contentful as global settings
    res.locals.global = {
      global: 'settings',
    };

    // Normally will be the content coming from Contentful
    res.locals.pageData = {
      hello: 'world',
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
