import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

// Centralized Mixpanel configuration with environment-aware defaults
// Prefer setting MIXPANEL_PROJECT_TOKEN via env; fallback uses the provided token
const BASE_CONFIG = {
  PROJECT_TOKEN:
    Config?.MIXPANEL_PROJECT_TOKEN || 'a8f0adae05015e02354ed9a4d604f46b',
  DEBUG: __DEV__ === true,
  TRACK_AUTOMATIC_EVENTS: true,
  USE_NATIVE: true,
  BATCH_SIZE: 50,
  FLUSH_INTERVAL_MS: 10000,
};

export const getMixpanelConfig = () => {
  const environment = (Config?.ENVIRONMENT || Config?.NODE_ENV || 'production')
    .toString()
    .toLowerCase();

  const isProduction = environment === 'production';

  const superProperties = {
    platform: Platform.OS,
    app_version: DeviceInfo.getVersion?.() || 'unknown',
    build_number: DeviceInfo.getBuildNumber?.() || '0',
    device_model: DeviceInfo.getModel?.() || 'unknown',
    // device_manufacturer: DeviceInfo.getManufacturerSync?.?.() || undefined,
    // environment,
  };

  return {
    ...BASE_CONFIG,
    DEBUG: !isProduction && BASE_CONFIG.DEBUG,
    SUPER_PROPERTIES: superProperties,
  };
};

export default {
  getMixpanelConfig,
};
