'use strict';

const DEFAULT_APP_PORT = 3000;

module.exports = (filename) => {

  // Read config file.
  const config = require(filename);

  // Check required fields.
  if (!(typeof config.appName === 'string' && config.appName.length > 0)) {

    throw new Error('Expect `appName` to be a non-empty string.');

  }

  if (typeof config.server !== 'object') {

    throw new Error('Expect `server` to be an object.');

  }

  if (!(typeof config.server.host === 'string' && config.server.host.length > 0)) {

    throw new Error('Expect `server.host` to be a non-empty string.');

  }

  if (!(typeof config.server.user === 'string' && config.server.user.length > 0)) {

    throw new Error('Expect `server.user` to be a non-empty string.');

  }

  if (typeof config.server.env !== 'object') {

    throw new Error('Expect `server.env` to be an object.');

  }

  if (!(typeof config.server.env.ROOT_URL === 'string' && config.server.env.ROOT_URL.length > 0)) {

    throw new Error('Expect `server.env.ROOT_URL` to be a non-empty string.');

  }

  if (!(
    (typeof config.server.env.MONGO_CONTAINER_NAME === 'string' && config.server.env.MONGO_CONTAINER_NAME.length > 0) ||
    (typeof config.server.env.MONGO_URL === 'string' && config.server.env.MONGO_URL.length > 0)
  )) {

    throw new Error('Expect either `server.env.MONGO_CONTAINER_NAME` or `server.env.MONGO_URL` to be a non-empty string.');

  }

  // Assign default values.
  config.server.env.PORT = config.server.env.PORT ? parseInt(config.server.env.PORT, 10) : DEFAULT_APP_PORT;

  return config;

};
