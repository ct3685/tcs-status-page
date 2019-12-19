/* global describe */
/* global test */
/* global expect */
const cta = require('./cta');

describe('./src/handlebars/elements/cta.js', () => {
  test('should be a String', () => {
    expect(cta).toBeInstanceOf(Function);
  });
});
