'use strict';

module.exports = {
  appName: 'meteor',
  server: {
    host: 'localhost',
    user: 'root',
    env: {
      PORT: 3000,
      ROOT_URL: 'http://localhost',
      MONGO_CONTAINER_NAME: 'mongodb'
    }
  }
};
