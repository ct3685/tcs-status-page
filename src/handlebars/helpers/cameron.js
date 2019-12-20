const { get } = require('lodash');
const { SafeString } = require('handlebars');

module.exports = (props) => {
  const name = get(props, 'hash.name');
  const length = get(props, 'hash.length');
  return new SafeString(`Name: ${name} Lenght: ${length}`);
};
