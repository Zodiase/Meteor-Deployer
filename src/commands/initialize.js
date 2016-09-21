'use strict';

const fs = require('fs');

/**
 * @param {object} yargs -
 * @param {CommandRoutineRnvironment} env -
 * @return {void}
 */
module.exports = (yargs, env) => {

  /*eslint no-console: "off"*/

  if (!env.dirExists(env.DEPLOY_DIR_PATH)) {

    console.log('Creating deployment folder.');
    fs.mkdirSync(env.DEPLOY_DIR_PATH);

  }

  if (!env.fileExists(env.CONFIG_FILE_PATH)) {

    console.log('Creating default config file.');
    fs.writeFileSync(env.CONFIG_FILE_PATH, env.getDefaultConfigFileData(), 'utf8');

  }

  if (!env.fileExists(env.APP_SETTINGS_FILE_PATH)) {

    console.log('Creating default settings file.');
    fs.writeFileSync(env.APP_SETTINGS_FILE_PATH, env.getDefaultSettingsFileData(), 'utf8');

  }

};
