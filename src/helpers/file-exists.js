'use strict';

const fs = require('fs');

module.exports = (path) => {

  try {

    return fs.statSync(path).isFile();

  } catch (err) {

    return false;

  }

};
