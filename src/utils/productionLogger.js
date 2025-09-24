/**
 * Production-Ready Logging Utility
 * Conditionally enables/disables logging based on environment
 */

import {isDebugEnabled} from '../constants/productionConfig';

class ProductionLogger {
  constructor() {
    this.isDebugMode = isDebugEnabled();
  }

  log(...args) {
    if (this.isDebugMode) {
      console.log(...args);
    }
  }

  warn(...args) {
    if (this.isDebugMode) {
      console.warn(...args);
    }
  }

  error(...args) {
    // Always log errors, even in production
    console.error(...args);
  }

  info(...args) {
    if (this.isDebugMode) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (this.isDebugMode) {
      console.debug(...args);
    }
  }

  // Analytics-specific logging
  analytics(eventName, params) {
    if (this.isDebugMode) {
      console.log(`📊 ANALYTICS: ${eventName}`, params);
    }
  }

  // Branch-specific logging
  branch(message, data) {
    if (this.isDebugMode) {
      console.log(`🌿 BRANCH: ${message}`, data);
    }
  }

  // MoEngage-specific logging
  moengage(message, data) {
    if (this.isDebugMode) {
      console.log(`📧 MOENGAGE: ${message}`, data);
    }
  }

  // Push notification logging
  push(message, data) {
    if (this.isDebugMode) {
      console.log(`🔔 PUSH: ${message}`, data);
    }
  }

  // Network logging
  network(message, data) {
    if (this.isDebugMode) {
      console.log(`🌐 NETWORK: ${message}`, data);
    }
  }
}

// Create singleton instance
const logger = new ProductionLogger();

export default logger;

// Export individual methods for convenience
export const {
  log,
  warn,
  error,
  info,
  debug,
  analytics,
  branch,
  moengage,
  push,
  network,
} = logger;
