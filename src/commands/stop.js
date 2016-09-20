'use strict';

const path = require('path');

/**
 * Stops the app container.
 * @param {object} yargs -
 * @param {CommandRoutineRnvironment} env -
 * @return {void}
 */
module.exports = (yargs, env) => {

  env.checkDeployFiles();

  // Read config file.
  const config = env.loadConfiguration(env.config_file);
  const appName = config.appName,
        appContainerName = env.getContainerName(appName);

  const localLogFile = path.join(env.deploy_dir, 'deploy.log');

  env.log(env.LOG_DIVIDER, localLogFile);
  env.log(`Stopping app container '${appContainerName}'...`, localLogFile);

  env.remoteExecSync(config.server, [
    `docker stop ${env.escq(appContainerName)}`
  ], {
    cwd: env.meteor_dir,
    log: localLogFile
  });

};
