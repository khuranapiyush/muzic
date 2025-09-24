/**
 * Production Configuration
 * This file contains production-specific settings and feature flags
 */

export const PRODUCTION_CONFIG = {
  // Debug and testing features
  ENABLE_DEBUG_SCREENS: false,
  ENABLE_TEST_UTILITIES: false,
  ENABLE_ANALYTICS_DEBUG: false,
  ENABLE_BRANCH_DEBUG: false,
  ENABLE_MOENGAGE_DEBUG: false,

  // Logging settings
  ENABLE_CONSOLE_LOGS: false,
  ENABLE_ANALYTICS_LOGS: false,
  ENABLE_NETWORK_LOGS: false,

  // Development features
  ENABLE_HOT_RELOAD: false,
  ENABLE_FLIPPER: false,
  ENABLE_REACTOTRON: false,

  // Testing features
  ENABLE_MOCK_DATA: false,
  ENABLE_TEST_EVENTS: false,
  ENABLE_DEBUG_ALERTS: false,

  // Performance settings
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_ANALYTICS_TRACKING: true,

  // Security settings
  ENABLE_SSL_PINNING: true,
  ENABLE_CERTIFICATE_VALIDATION: true,

  // App version
  VERSION: '3.2.0',
  BUILD_NUMBER: '16',

  // Environment
  ENVIRONMENT: 'production',
  NODE_ENV: 'production',
};

export const isProduction = () => {
  return PRODUCTION_CONFIG.ENVIRONMENT === 'production';
};

export const isDebugEnabled = () => {
  return __DEV__ && !isProduction();
};

export const shouldEnableFeature = featureName => {
  return PRODUCTION_CONFIG[featureName] === true;
};

export default PRODUCTION_CONFIG;
