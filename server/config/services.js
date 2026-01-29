// ==============================================
// EXTERNAL SERVICES INITIALIZER
// Single Responsibility: Third-party Service Initialization
// PERFORMANCE OPTIMIZATIONS:
// - Lazy initialization - services loaded only when needed
// - Parallel initialization for independent services
// - Timeout protection to prevent hanging startup
// ==============================================

const logger = require('../utils/logger');

class ServicesInitializer {
  /**
   * PERFORMANCE: Initialize thumbnail service with timeout protection
   * Timeout prevents hanging startup if FFmpeg check is slow
   */
  static async initializeThumbnailService(thumbnailService) {
    try {
      // OPTIMIZATION: Timeout after 3 seconds to prevent hanging startup
      // FFmpeg check can hang indefinitely on some systems
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FFmpeg check timeout')), 3000);
      });
      
      await Promise.race([
        thumbnailService.checkFfmpeg(),
        timeoutPromise,
      ]);
      
    } catch (error) {
      logger.warning('Thumbnail service initialization failed: ' + error.message);
      // Non-critical, continue without thumbnail generation
    }
  }

  /**
   * PERFORMANCE: Parallel initialization of independent services
   * Reduces startup time from O(n) sequential to O(1) parallel
   * Example: 3 services @ 1s each: 3s sequential vs 1s parallel
   */
  static async initializeServices(services) {
    const { thumbnailService } = services;

    // OPTIMIZATION: Use Promise.allSettled for parallel initialization
    // allSettled continues even if one service fails (resilient startup)
    const initPromises = [];
    
    if (thumbnailService) {
      initPromises.push(
        this.initializeThumbnailService(thumbnailService)
          .catch((error) => logger.warning('Service init failed:', error))
      );
    }
    
    // PERFORMANCE: Parallel execution instead of sequential await
    if (initPromises.length > 0) {
      await Promise.allSettled(initPromises);
    }
  }

  /**
   * PERFORMANCE: Lazy service getter pattern
   * Services are instantiated only when first accessed
   * Reduces memory footprint for unused services
   */
  static createLazyServiceProxy(serviceFactory) {
    let instance = null;
    
    return new Proxy({}, {
      get(target, prop) {
        // OPTIMIZATION: Lazy instantiation on first property access
        if (!instance) {
          instance = serviceFactory();
        }
        return instance[prop];
      },
    });
  }
}

module.exports = ServicesInitializer;
