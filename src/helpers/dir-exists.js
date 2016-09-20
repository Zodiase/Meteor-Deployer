'use strict';

const fs = require('fs');

module.exports = (path) => {

  try {

    return fs.statSync(path).isDirectory();

  } catch (err) {

    return false;

  }

};
