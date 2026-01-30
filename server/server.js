// ==============================================
// HTTP SERVER MODULE
// Single Responsibility: HTTP Server Management
// PERFORMANCE OPTIMIZATIONS:
// - Connection timeout configuration
// - Keep-alive connection pooling
// - Proper listener cleanup to prevent memory leaks
// ==============================================

const logger = require('./utils/logger');
const { API_ENDPOINTS } = require('./config/constants');

class HttpServer {
  constructor(app, port, environmentMode) {
    this.app = app;
    this.port = port;
    this.environmentMode = environmentMode;
    this.server = null;
    this.errorHandler = null;
  }

  /**
   * PERFORMANCE: Start HTTP server with optimized settings
   * Keep-alive connections reduce latency by ~50ms per request
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        // DOCKER FIX: Bind to 0.0.0.0 to accept external connections
        this.server = this.app.listen(this.port, '0.0.0.0', () => {
          logger.logServerBanner(this.port, this.environmentMode, API_ENDPOINTS);
          
          // PERFORMANCE: Configure server timeouts to prevent hanging connections
          // Prevents memory leaks from stuck connections
          this.server.keepAliveTimeout = 65000; // 65 seconds (longer than LB timeout)
          this.server.headersTimeout = 66000;   // 66 seconds (must be > keepAliveTimeout)
          this.server.timeout = 120000;         // 2 minutes max request time
          
          // OPTIMIZATION: Set max connections to prevent resource exhaustion
          this.server.maxConnections = 1000;
          
          resolve();
        });

        // MEMORY LEAK FIX: Store error handler reference for cleanup
        this.errorHandler = (error) => {
          logger.error('Server startup failed', error);
          reject(error);
        };
        
        this.server.once('error', this.errorHandler);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * PERFORMANCE: Graceful shutdown with connection draining
   * Allows in-flight requests to complete (max 10 seconds)
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      // OPTIMIZATION: Stop accepting new connections immediately
      this.server.close((error) => {
        if (error) {
          logger.error('Server shutdown failed', error);
          reject(error);
        } else {
          logger.info('Server stopped gracefully');
          resolve();
        }
      });
      
      // PERFORMANCE: Force close after 10 seconds to prevent hanging
      // Prevents graceful shutdown from blocking indefinitely
      setTimeout(() => {
        if (this.server.listening) {
          logger.warning('Forcing server shutdown after timeout');
          this.server.closeAllConnections();
        }
      }, 10000);
      
      // MEMORY LEAK FIX: Remove error handler listener
      if (this.errorHandler) {
        this.server.removeListener('error', this.errorHandler);
        this.errorHandler = null;
      }
    });
  }
}

module.exports = HttpServer;
