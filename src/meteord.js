#!/usr/bin/env node

'use strict';

const METEOR_DIR_FILENAME = '.meteor',
      METEOR_ID_FILENAME = '.id',
      BUILD_DIR_FILENAME = '.build',
      BUNDLE_DIR_FILENAME = 'bundle',
      DEPLOY_CONFIG_FILENAME = 'meteord.js',
      APP_SETTINGS_FILENAME = 'settings.json',
      BUNDLE_TARBALL_FILENAME = 'bundle.tar.gz',
      DOCKERFILE_URL = 'http://goo.gl/K3ZqKr';
const LINE_WIDTH = 80,
      LOG_DIVIDER_STRING = '-'.repeat(LINE_WIDTH);

// Core packages.
const path = require('path'),
      fs = require('fs');

// Yargs setup.
const yargs = require('yargs')
      .usage('Usage: $0 <command> [options]')
      .command('help', 'show help')
      .command('init', 'create deploy config files in the Meteor app')
      .command('deploy', 'build and deploy the Meteor app')
      .command('start', 'start the Meteor app on remote')
      .command('stop', 'stop the Meteor app on remote')
      .command('logs', 'fetch logs from the Meteor app on remote')
      .options({}),
      argv = yargs.argv,
      SCRIPT_PATH = argv.$0,
      command = argv._[0],
      commands = {};

// Helpers.

/**
 * Return the absolute path of the root of the meteor app.
 * If the root of the meteor app could not be found, return false.
 * @param {string} cwd - The current working directly to start checking.
 * @return {string|false} - The path to the meteor app root. Or false if failed.
 */
const getMeteorDir = (cwd) => {

  let wd = cwd;

  do {

    try {

      if (fs.statSync(path.join(wd, METEOR_DIR_FILENAME, METEOR_ID_FILENAME)).isFile()) {

        return wd;

      }

    } catch (err) {
      // Hide errors silently.
    }

  } while (wd !== (wd = path.dirname(wd)));

  return false;

};

/**
 * @typedef {Object} CommandRoutineRnvironment
 * @property {function} getDefaultConfigFileData
 * @property {function} getDefaultSettingsFileData
 * @property {function} fileExists
 * @property {function} dirExists
 * @property {function} checkDeployFiles
 * @property {function} loadConfiguration - Load and return the configuration object.
 * @property {function} exec_local - Execute local commands.
 * @property {function} getContainerName - Get the container name for the given app name.
 * @property {function} remoteExecSync - Execute remote commands.
 * @property {function} escq - Escape single quotes.
 * @property {function} checkStatus - Throws an error if the execution result has a non-zero status.
 * @property {function} mullcmd - Wrap multiple lines of commands into one.
 * @property {function} log - Logging function.
 * @property {string} SCRIPT_PATH - Absolute path to this script.
 * @property {string} APP_ROOT_PATH - Absolute path to the meteor app root directory.
 * @property {string} DEPLOY_DIR_PATH - Absolute path to the deployment folder.
 * @property {string} CONFIG_FILE_PATH - Absolute path to the deployment config file.
 * @property {string} APP_SETTINGS_FILE_PATH - Absolute path to the meteor settings file.
 * @property {string} LOG_DIVIDER_STRING
 * @property {string} APP_SETTINGS_FILENAME
 * @property {string} BUILD_DIR_FILENAME
 * @property {string} BUNDLE_DIR_FILENAME
 * @property {string} BUNDLE_TARBALL_FILENAME
 * @property {string} DOCKERFILE_URL
 */

// Load commands.
commands['init'] = require('./commands/initialize.js');
commands['stop'] = require('./commands/stop.js');
commands['start'] = require('./commands/start.js');
commands['deploy'] = require('./commands/deploy.js');
commands['logs'] = require('./commands/logs.js');

// Show usage info if no valid command is provided.
if (!Object.prototype.hasOwnProperty.call(commands, command)) {

  yargs.showHelp('log');
  process.exit();

}

// Find the Meteor app root.
const CWD = process.cwd(),
      APP_ROOT_PATH = getMeteorDir(CWD);

console.log('Current directory:', CWD);

if (!APP_ROOT_PATH) {

  throw new Error("You're not in a Meteor project directory.");

}
console.log('Meteor project directory:', APP_ROOT_PATH);

const DEPLOY_DIR_PATH = CWD,
      CONFIG_FILE_PATH = path.join(DEPLOY_DIR_PATH, DEPLOY_CONFIG_FILENAME),
      APP_SETTINGS_FILE_PATH = path.join(DEPLOY_DIR_PATH, APP_SETTINGS_FILENAME),
      BREAK_LINE = `\n`;

// Pass control to the command handler.
commands[command](yargs.reset(), {
  // Methods.
  getDefaultConfigFileData: () => fs.readFileSync(path.join(__dirname, 'default-config.js'), 'utf8'),
  getDefaultSettingsFileData: () => JSON.stringify(require('./default-settings.js'), null, 2),
  fileExists: (somePath) => {

    try {

      return fs.statSync(somePath).isFile();

    } catch (err) {

      return false;

    }

  },
  dirExists: (somePath) => {

    try {

      return fs.statSync(somePath).isDirectory();

    } catch (err) {

      return false;

    }

  },
  checkDeployFiles: require('./helpers/deployfiles-check.js'),
  loadConfiguration: require('./helpers/config-load.js'),
  exec_local: require('./helpers/exec-local.js'),
  getContainerName: (appName) => `meteorapp_${String(appName).toLowerCase()}`,
  remoteExecSync: require('./helpers/exec-remote.js'),
  escq: require('./helpers/escape.js'),

  /**
   * Checks the status code of an execution result.
   * Throws an error if the status code is not zero.
   * @param {ExecuteResult} resultObj - Execution result from `@xch/node-remote-exec`.
   * @return {void}
   */
  checkStatus: (resultObj) => {

    if (resultObj.status !== 0) {

      console.error(resultObj);
      throw new Error(resultObj.stderr);

    }

  },

  /**
   * Group multiple lines of commands as one.
   * @param {string|Array.<string>} cmd - One command string or multiple command strings in an array.
   * @return {string} - Grouped command string.
   */
  mullcmd: (cmd) => `(${(Array.isArray(cmd) ? Array.prototype.slice.call(cmd) : [cmd]).join(BREAK_LINE)})`,
  log: require('./helpers/log.js'),

  // Constants.
  SCRIPT_PATH,
  APP_ROOT_PATH,
  DEPLOY_DIR_PATH,
  CONFIG_FILE_PATH,
  APP_SETTINGS_FILE_PATH,
  LOG_DIVIDER_STRING,
  APP_SETTINGS_FILENAME,
  BUILD_DIR_FILENAME,
  BUNDLE_DIR_FILENAME,
  BUNDLE_TARBALL_FILENAME,
  DOCKERFILE_URL
});
