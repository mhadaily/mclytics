/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'mobelytic',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      // preloader: {
      //       removeDelay: false, // 'disapread'
      //       loadedClass: 250
      //      }
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  ENV.resizeServiceDefaults = {
    debounceTimeout    : 200,
    heightSensitive    : true,
    widthSensitive     : true,
    injectionFactories : [ 'view', 'component']
  }

  ENV.apiHost = process.env.API_HOST || 'mobecentral.herokuapp.com'
  ENV.apiPort = process.env.API_PORT ? ':' + process.env.API_PORT : ''
  ENV.apiProtocol = process.env.API_PROTOCOL ? `${process.env.API_PROTOCOL}://` : (environment == 'production' ? 'https://' : 'http://')
  ENV.apiUrl = process.env.API_URL || `${ENV.apiProtocol}${ENV.apiHost}${ENV.apiPort}`;

  return ENV;
};
