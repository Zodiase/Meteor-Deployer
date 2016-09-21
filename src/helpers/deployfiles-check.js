'use strict';

module.exports = function checkDeployFiles (env) {

  if (typeof env === 'undefined') {

    return checkDeployFiles(this);

  }

  if (!env.dirExists(env.DEPLOY_DIR_PATH)) {

    throw new Error('Deployment folder not found.');

  }

  if (!env.fileExists(env.CONFIG_FILE_PATH)) {

    throw new Error('Config file not found.');

  }

  if (!env.fileExists(env.APP_SETTINGS_FILE_PATH)) {

    throw new Error('Settings file not found.');

  }

  return true;

};
