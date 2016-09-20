'use strict';

const dirExists = require('./dir-exists.js'),
      fileExists = require('./file-exists.js');

module.exports = function checkDeployFiles (env) {

  if (typeof env === 'undefined') {

    return checkDeployFiles(this);

  }

  if (!dirExists(env.deploy_dir)) {

    throw new Error('Deployment folder not found.');

  }

  if (!fileExists(env.config_file)) {

    throw new Error('Config file not found.');

  }

  if (!fileExists(env.settings_file)) {

    throw new Error('Settings file not found.');

  }

  return true;

};
