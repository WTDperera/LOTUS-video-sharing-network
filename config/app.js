// ==============================================
// APPLICATION FACTORY
// Single Responsibility: Express App Creation & Configuration
// ==============================================

const express = require('express');
const MiddlewareConfigurator = require('./middleware');
const RouteConfigurator = require('./routes');

class ApplicationFactory {
  /**
   * Create and configure Express application
   * @param {Object} config - Configuration object
   * @param {number} config.port - Server port
   * @param {string} config.environmentMode - Environment mode
   * @param {Function} config.getDbStatus - Function to get database status
   * @returns {Express.Application} Configured Express app
   */
  static createApplication(config) {
    const { port, environmentMode, getDbStatus } = config;

    const app = express();
    
    // Store port for controllers
    app.set('port', port);

    // Configure middleware
    MiddlewareConfigurator.configureMiddleware(app, environmentMode);

    // Configure health check
    RouteConfigurator.configureHealthCheck(app, getDbStatus);

    // Configure routes
    RouteConfigurator.configureRoutes(app);

    return app;
  }
}

module.exports = ApplicationFactory;
