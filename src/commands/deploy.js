'use strict';

const path = require('path');

/**
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
  env.log(`New deployment ${Date.now()}`, localLogFile);

  const buildDir = path.join(env.deploy_dir, env.build_dirname),
        bundleDir = path.join(buildDir, env.bundle_dirname),
        bundleFile = path.join(buildDir, env.bundle_filename);
  const remoteHome = `/home/${config.server.user}`,
        // Deploy Directory is app specific.
        remoteDeployDir = path.join(remoteHome, 'meteor', appName),
        remoteSettingsFile = path.join(remoteDeployDir, env.meteor_settings_filename),
        remoteLogFile = path.join(remoteDeployDir, 'deploy.log'),
        remoteBuildDir = path.join(remoteDeployDir, env.build_dirname),
        remoteBundleFile = path.join(remoteBuildDir, env.bundle_filename),
        remoteBundleDir = path.join(remoteBuildDir, env.bundle_dirname),
        remoteDockerFile = path.join(remoteDeployDir, 'Dockerfile');

  if (env.dirExists(buildDir)) {

    env.log('Deleting previous build...', localLogFile, true);
    env.exec_local([
      `rm -rf ${env.escq(buildDir)}`
    ], {
      log: localLogFile,
      cwd: env.meteor_dir
    });

  }

  env.log('Building the app locally...', localLogFile, true);
  env.exec_local([
    'npm install --production',
    `meteor build --directory --architecture os.linux.x86_64 ${env.escq(buildDir)}`,
    `cd ${env.escq(path.dirname(bundleDir))} && tar --create --gzip --file ${env.escq(bundleFile)} ${env.escq(path.basename(bundleDir))} 2>&1`,
    `rm -rf ${env.escq(bundleDir)}`
  ], {
    log: localLogFile,
    cwd: env.meteor_dir
  });

  env.log('Uploading app bundle to remote...', localLogFile, true);
  env.checkStatus(env.remoteExecSync(config.server, [
    `mkdir -p ${env.escq(remoteBundleDir)}`
  ], {
    log: localLogFile,
    cwd: env.meteor_dir
  }));
  env.exec_local([
    // Copy bundle over.
    `scp ${env.escq(bundleFile)} '${config.server.user}@${config.server.host}:${remoteBundleFile}'`,
    // Copy settings file over.
    `scp ${env.escq(env.settings_file)} '${config.server.user}@${config.server.host}:${remoteSettingsFile}'`
  ], {
    log: localLogFile,
    cwd: env.meteor_dir
  });

  env.log('Remotely building Docker image...', localLogFile, true);
  env.checkStatus(env.remoteExecSync(config.server, [
    // Clean up dangling images. May potentially throw errors for un-deletable images.
    `((docker rmi $(docker images --all --filter "dangling=true" --quiet --no-trunc) 2>/dev/null) || :)`,
    // Unpack app bundle.
    `((tar --extract --gzip -m --file ${env.escq(remoteBundleFile)} -C ${env.escq(remoteBundleDir)} --strip-components 1 2>&1 | grep -v "Ignoring unknown extended header keyword") || :)`,
    // Download Dockerfile.
    `wget --quiet --output-document ${env.escq(remoteDockerFile)} ${env.escq(env.dockerfile_url)}`,
    // Build app image.
    `docker build -t ${env.escq(appContainerName)} .`
  ], {
    log: localLogFile,
    remoteLog: remoteLogFile,
    cwd: env.meteor_dir,
    remoteCwd: remoteDeployDir
  }));

  env.log(`Starting app container '${appContainerName}'...`, localLogFile, true);
  env.checkStatus(env.remoteExecSync(config.server, [
    // Kill and remove existing app container if possible.
    `$(docker rm -f ${env.escq(appContainerName)} >/dev/null 2>&1) || :`,
    // Run the new container.
    `docker run -d --name ${env.escq(appContainerName)} --env METEOR_SETTINGS="$(<${env.escq(remoteSettingsFile)})" --env MONGO_URL=${env.escq(config.server.env.MONGO_URL)} --env ROOT_URL=${env.escq(config.server.env.ROOT_URL)} --env PORT=3000 -p ${env.escq(config.server.env.PORT)}:3000 --link mongodb:mongodb ${env.escq(appContainerName)}`
  ], {
    log: localLogFile,
    remoteLog: remoteLogFile,
    cwd: env.meteor_dir,
    remoteCwd: remoteDeployDir
  }));

//   env.log('Verifying app deployment...', localLogFile, true);
//   const deployResult = env.remoteExecSync(config.server, [
//     `DEPLOY_CHECK_WAIT_TIME=5`,
//     `elaspsed=0`,
//     env.mullcmd([
//       'while [[ true ]]; do',
//       '    sleep 1',
//       '    elaspsed=$((elaspsed+1))',
//       `    (curl localhost:${env.escq(config.server.env.PORT)} >/dev/null 2>&1) && exit 0`,
//       '    if [ "$elaspsed" == "$DEPLOY_CHECK_WAIT_TIME" ]; then',
//       '        exit 1',
//       '    fi',
//       'done'
//     ]),
//     'echo "foo"',
//     'exit 1'
//     //'if [ $? -eq 1 ]; then (printf "Deployment failed.") else (printf "Deployment succeeded.") fi'
//   ], {
//     log: localLogFile,
//     remoteLog: remoteLogFile,
//     cwd: env.meteor_dir,
//     remoteCwd: remoteDeployDir
//   });
//   console.log(deployResult);

};