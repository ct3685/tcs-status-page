const { get } = require('lodash');
const { SafeString } = require('handlebars');

module.exports = (props) => {
  const url = get(props, 'hash.url', '#');
  const text = get(props, 'hash.text', 'Submit');
  return new SafeString(`<a href="${url}">${text}</a>`);
};
