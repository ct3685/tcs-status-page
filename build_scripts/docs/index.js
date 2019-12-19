/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const path = require('path');
const markdownMagic = require('markdown-magic'); // 'markdown-magic'
const jsdoc = require('markdown-magic-jsdoc');
const depTable = require('markdown-magic-dependency-table');

const mmdConfig = {
  transforms: {
    jsdoc,
    depTable,
  },
};

const mainReadMePath = path.join(__dirname, '../../', 'README.md');
const serverReadMePath = path.join(__dirname, '../../src/server', 'README.md');
const clientReadMePath = path.join(__dirname, '../../src/client', 'README.md');
markdownMagic(mainReadMePath, mmdConfig);
markdownMagic(clientReadMePath, mmdConfig);
markdownMagic(serverReadMePath, mmdConfig);
