'use strict';

const path = require('path');

/**
 * Gets the logs of the app container.
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

  const localLogFile = path.join(env.DEPLOY_DIR_PATH, 'container.log');

  env.log(env.LOG_DIVIDER_STRING, localLogFile);
  env.log(`Reading logs from app container '${appContainerName}'...`, localLogFile);

  const result = env.remoteExecSync(config.server, [
    `docker logs ${env.escq(appContainerName)}`
  ], {
    cwd: env.APP_ROOT_PATH,
    log: localLogFile
  });

  env.checkStatus(result);
  env.log(result.stdout, null);

};
