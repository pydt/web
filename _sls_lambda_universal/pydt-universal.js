const serverlessExpress = require('@vendia/serverless-express')
const server = require('./dist/web/server/main');
const app = server.app();

module.exports.handler = serverlessExpress({
  app,
  logSettings: {
    level: 'debug'
  },
  binarySettings: {
    contentTypes: ['*/*']
  }
});
