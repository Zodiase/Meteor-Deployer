#!/usr/bin/env node

'use strict';

const meteor_dirname = '.meteor',
      meteorid_filename = '.id',
      default_deploy_dirname = '.deploy',
      build_dirname = '.build',
      bundle_dirname = 'bundle',
      deploy_settings_filename = 'meteord.js',
      meteor_settings_filename = 'settings.json',
      bundle_filename = 'bundle.tar.gz',
      dockerfile_url = 'http://goo.gl/K3ZqKr';
const LINE_WIDTH = 80,
      A_FULL_LINE = '-'.repeat(LINE_WIDTH);

// Core packages.
const path = require('path');

// Yargs setup.
const yargs = require('yargs')
      .usage('Usage: $0 <command> [options]')
      .command('help', 'show help')
      .command('init', 'create deploy config files in the Meteor app')
      .options({
        'deploy-dir': {
          'global': true,
          'type': 'string',
          'nargs': 1,
          'describe': 'Directory used for deploy config files.',
          'default': default_deploy_dirname,
          'normalize': true
        }
      }),
      argv = yargs.argv,
      scriptPath = argv.$0,
      command = argv._[0],
      commands = {};

// Modules.
const log = require('./helpers/log.js');
const loadConfiguration = require('./helpers/config-load.js');
const checkDeployFiles = require('./helpers/deployfiles-check.js');
const remoteExecSync = require('./helpers/exec-remote.js');
const exec_local = require('./helpers/exec-local.js');
const escq = require('./helpers/escape.js');
const dirExists = require('./helpers/dir-exists.js'),
      fileExists = require('./helpers/file-exists.js');

const mullcmd = require('./helpers/group-multiple-cmds.js');

const getContainerName = (appName) => `meteorapp_${String(appName).toLowerCase()}`;

const checkStatus = (resultObj) => {

  if (resultObj.status !== 0) {

    console.error(resultObj);
    throw new Error(resultObj.stderr);

  }

};

const getMeteorDir = (cwd) => {

  let wd = cwd;

  do {

    const meteor_idfile = path.join(wd, meteor_dirname, meteorid_filename);

    if (fileExists(meteor_idfile)) {

      return wd;

    }

  } while (wd !== (wd = path.dirname(wd)));

  return false;

};

/**
 * @typedef {Object} CommandRoutineRnvironment
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
 * @property {string} scriptPath - Absolute path to this script.
 * @property {string} cwd - Absolute path to the current working directory.
 * @property {string} meteor_dir - Absolute path to the meteor app root directory.
 * @property {string} deploy_dir - Absolute path to the deployment folder.
 * @property {string} config_file - Absolute path to the deployment config file.
 * @property {string} settings_file - Absolute path to the meteor settings file.
 */

commands['init'] = require('./commands/initialize.js');
commands['stop'] = require('./commands/stop.js');
commands['start'] = require('./commands/start.js');
commands['deploy'] = require('./commands/deploy.js');

if (Object.prototype.hasOwnProperty.call(commands, command)) {

  const cwd = process.cwd(),
        meteor_dir = getMeteorDir(cwd);

  if (!meteor_dir) {

    throw new Error("You're not in a Meteor project directory.");

  }

  const deploy_dir = path.join(meteor_dir, argv.deployDir),
        config_file = path.join(deploy_dir, deploy_settings_filename),
        settings_file = path.join(deploy_dir, meteor_settings_filename);

  commands[command](yargs.reset(), {
    getDefaultConfigFileData: () => {

      return JSON.stringify(require('./default-config.js'), null, 2);

    },
    getDefaultSettingsFileData: () => {

      return JSON.stringify(require('./default-settings.js'), null, 2);

    },
    fileExists,
    dirExists,
    checkDeployFiles,
    loadConfiguration,
    exec_local,
    getContainerName,
    meteor_settings_filename,
    dockerfile_url,
    remoteExecSync,
    escq,
    checkStatus,
    mullcmd,
    log,
    LOG_DIVIDER: A_FULL_LINE,
    scriptPath,
    cwd,
    meteor_dir,
    deploy_dir,
    build_dirname,
    bundle_dirname,
    bundle_filename,
    config_file,
    settings_file
  });

} else {

  yargs.showHelp('log');

}
