// ==============================================
// LOTUS VIDEO STREAMING PLATFORM - Entry Point
// THREE-TIER ARCHITECTURE
// ==============================================
// Architecture: Modular Design with Dependency Injection
// Pattern: Bootstrap Pattern for Application Initialization
// ==============================================

const ApplicationBootstrap = require('./bootstrap');

// Create application instance with dependency injection
const application = new ApplicationBootstrap();

// Setup global error handlers
application.setupGlobalErrorHandlers();

// Start the application
application.start();
