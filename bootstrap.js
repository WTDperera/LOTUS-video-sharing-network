// ==============================================
// APPLICATION BOOTSTRAP
// Single Responsibility: Application Initialization Orchestration
// Implements: Dependency Injection Pattern
// ==============================================

require('dotenv').config();
const DatabaseConnection = require('./config/database');
const ApplicationFactory = require('./config/app');
const HttpServer = require('./server');
const ServicesInitializer = require('./config/services');
const SecurityConfig = require('./config/security');
const logger = require('./utils/logger');
const thumbnailService = require('./services/thumbnailService');
const {
  DEFAULT_PORT,
  DEFAULT_MONGODB_URI,
} = require('./config/constants');

class ApplicationBootstrap {
  constructor() {
    // SECURITY: Validate security configuration before proceeding
    try {
      new SecurityConfig();
    } catch (error) {
      logger.error('Security configuration validation failed', error);
      process.exit(1);
    }

    this.serverPort = process.env.PORT || DEFAULT_PORT;
    this.mongoDbUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    this.environmentMode = process.env.NODE_ENV || 'development';
    
    // SECURITY: Warn if running in development mode
    if (this.environmentMode !== 'production') {
      logger.warning('Running in non-production mode. Enable security features for production.');
    }
    
    // Dependency injection
    this.databaseConnection = new DatabaseConnection(this.mongoDbUri);
    this.httpServer = null;
    this.app = null;
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    await this.databaseConnection.connect();
  }

  /**
   * Initialize external services
   * @returns {Promise<void>}
   */
  async initializeServices() {
    await ServicesInitializer.initializeServices({ thumbnailService });
  }

  /**
   * Create Express application
   */
  createApplication() {
    this.app = ApplicationFactory.createApplication({
      port: this.serverPort,
      environmentMode: this.environmentMode,
      getDbStatus: () => this.databaseConnection.getConnectionStatus(),
    });
  }

  /**
   * Start HTTP server
   * @returns {Promise<void>}
   */
  async startHttpServer() {
    this.httpServer = new HttpServer(
      this.app,
      this.serverPort,
      this.environmentMode
    );
    await this.httpServer.start();
  }

  /**
   * Bootstrap the entire application
   * @returns {Promise<void>}
   */
  async start() {
    try {
      await this.initializeDatabase();
      await this.initializeServices();
      this.createApplication();
      await this.startHttpServer();
    } catch (error) {
      logger.error('Application Bootstrap Failed', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  /**
   * Gracefully shutdown application
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      if (this.httpServer) {
        await this.httpServer.stop();
      }
      if (this.databaseConnection) {
        await this.databaseConnection.disconnect();
      }
    } catch (error) {
      logger.error('Shutdown error', error);
    }
  }

  /**
   * PERFORMANCE: Setup global error handlers with memory leak prevention
   * MEMORY LEAK FIX: Store handler references to allow proper cleanup
   */
  setupGlobalErrorHandlers() {
    // OPTIMIZATION: Store handler references for cleanup (prevents memory leaks)
    this.unhandledRejectionHandler = (error) => {
      logger.error('Unhandled Promise Rejection', error);
      this.shutdown().then(() => process.exit(1));
    };

    this.sigtermHandler = () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown().then(() => process.exit(0));
    };

    this.sigintHandler = () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown().then(() => process.exit(0));
    };

    // PERFORMANCE: Use 'once' for signals to prevent duplicate handlers
    process.on('unhandledRejection', this.unhandledRejectionHandler);
    process.once('SIGTERM', this.sigtermHandler);
    process.once('SIGINT', this.sigintHandler);
  }

  /**
   * PERFORMANCE: Remove event listeners to prevent memory leaks
   * Critical for hot-reloading and testing scenarios
   */
  removeGlobalErrorHandlers() {
    if (this.unhandledRejectionHandler) {
      process.removeListener('unhandledRejection', this.unhandledRejectionHandler);
    }
    // Note: SIGTERM/SIGINT use 'once' so they auto-remove after first trigger
  }

  /**
   * PERFORMANCE: Enhanced shutdown with listener cleanup
   */
  async shutdown() {
    try {
      // OPTIMIZATION: Cleanup logger buffers to prevent memory leaks
      logger.cleanup();
      
      // OPTIMIZATION: Remove event listeners before shutdown
      this.removeGlobalErrorHandlers();
      
      if (this.httpServer) {
        await this.httpServer.stop();
      }
      if (this.databaseConnection) {
        await this.databaseConnection.disconnect();
      }
    } catch (error) {
      logger.error('Shutdown error', error);
    }
  }
}

module.exports = ApplicationBootstrap;
