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
  const config = env.loadConfiguration(env.CONFIG_FILE_PATH);
  const appName = config.appName,
        appContainerName = env.getContainerName(appName);

  const localLogFile = path.join(env.DEPLOY_DIR_PATH, 'deploy.log');

  env.log(env.LOG_DIVIDER_STRING, localLogFile);
  env.log(`Stopping app container '${appContainerName}'...`, localLogFile);

  env.remoteExecSync(config.server, [
    `docker stop ${env.escq(appContainerName)}`
  ], {
    cwd: env.APP_ROOT_PATH,
    log: localLogFile
  });

};
