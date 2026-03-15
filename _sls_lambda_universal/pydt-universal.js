const serverlessExpress = require('@vendia/serverless-express');

let cachedHandler;

module.exports.handler = async (event, context) => {
  if (!cachedHandler) {
    const { reqHandler } = await import('./dist/web/server/server.mjs');
    cachedHandler = serverlessExpress({
      app: reqHandler,
      binarySettings: {
        contentTypes: ['*/*']
      }
    });
  }

  return cachedHandler(event, context);
};
