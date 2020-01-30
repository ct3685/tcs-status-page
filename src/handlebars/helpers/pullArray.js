const { get } = require('lodash');
const { SafeString } = require('handlebars');

module.exports = (props) => {
    const array = get(props, 'hash.array');
    const amount = get(props, 'hash.amount');
    const newArray = []

    if(!array) {
        return '';
    }

    for (let i = 0; i < amount; i++) {
        newArray.push(array[i]);
    }
    return newArray;
};
