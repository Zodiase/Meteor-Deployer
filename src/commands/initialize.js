'use strict';

const fs = require('fs');

/**
 * @param {object} yargs -
 * @param {CommandRoutineRnvironment} env -
 * @return {void}
 */
module.exports = (yargs, env) => {

  /*eslint no-console: "off"*/

  if (!env.dirExists(env.deploy_dir)) {

    console.log('Creating deployment folder.');
    fs.mkdirSync(env.deploy_dir);

  }

  if (!env.fileExists(env.config_file)) {

    console.log('Creating default config file.');
    fs.writeFileSync(env.config_file, env.getDefaultConfigFileData(), 'utf8');

  }

  if (!env.fileExists(env.settings_file)) {

    console.log('Creating default settings file.');
    fs.writeFileSync(env.settings_file, env.getDefaultSettingsFileData(), 'utf8');

  }

};
