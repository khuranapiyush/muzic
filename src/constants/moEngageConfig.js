import config from 'react-native-config';

export const MOENGAGE_CONFIG = {
  // Platform-specific App IDs (prefer setting via env for production)
  APP_ID_ANDROID: config.MOENGAGE_APP_ID_ANDROID || 'BUP4RKUJZXQL8R2J9N61ZKEL',
  APP_ID_IOS: config.MOENGAGE_APP_ID_IOS || 'BUP4RKUJZXQL8R2J9N61ZKEL',
  // Backward-compat default App ID (kept for legacy usage)
  APP_ID: 'BUP4RKUJZXQL8R2J9N61ZKEL',

  // Environment settings
  ENVIRONMENT: config.MOENGAGE_ENVIRONMENT || 'production',
  ENABLE_LOGS: false, // Disabled for production
  DEBUG_MODE: false, // Disabled for production
  DATA_CENTER: 'DATA_CENTER_4',

  // Event names constants - Muzic app specific
  EVENTS: {
    // Core app events
    APP_OPEN: 'App_Open',
    USER_LOGIN: 'User_Login',
    USER_LOGOUT: 'User_Logout',
    USER_REGISTRATION: 'User_Registration',

    // Music and content events
    SONG_PLAYED: 'Song_Played',
    SONG_LIKED: 'Song_Liked',
    SONG_SHARED: 'Song_Shared',
    PLAYLIST_CREATED: 'Playlist_Created',
    CONTENT_UPLOADED: 'Content_Uploaded',
    VOICE_RECORDING_CREATED: 'Voice_Recording_Created',

    // Trading and NFT events
    NFT_VIEWED: 'NFT_Viewed',
    NFT_PURCHASED: 'NFT_Purchased',
    TRADE_EXECUTED: 'Trade_Executed',
    WALLET_TRANSACTION: 'Wallet_Transaction',
    CREDITS_PURCHASED: 'Credits_Purchased',
    CREDITS_SPENT: 'Credits_Spent',

    // Social and community events
    CREATOR_FOLLOWED: 'Creator_Followed',
    CREATOR_UNFOLLOWED: 'Creator_Unfollowed',
    COMMENT_POSTED: 'Comment_Posted',
    CONTENT_SHARED: 'Content_Shared',
    LIVE_STREAM_JOINED: 'Live_Stream_Joined',

    // Engagement events
    SEARCH_PERFORMED: 'Search_Performed',
    FILTER_APPLIED: 'Filter_Applied',
    NOTIFICATION_CLICKED: 'Notification_Clicked',
    FEATURE_DISCOVERED: 'Feature_Discovered',
    ONBOARDING_COMPLETED: 'Onboarding_Completed',

    // Gaming events
    GAME_PLAYED: 'Game_Played',
    GAME_WON: 'Game_Won',
    COINS_EARNED: 'Coins_Earned',

    // Subscription events
    SUBSCRIPTION_VIEWED: 'Subscription_Viewed',
    SUBSCRIPTION_PURCHASED: 'Subscription_Purchase',
    PREMIUM_FEATURE_ACCESSED: 'Premium_Feature_Accessed',

    // Referral events
    REFERRAL_SENT: 'Referral_Sent',
    REFERRAL_COMPLETED: 'Referral_Completed',

    // AI and generation events
    AI_CONTENT_GENERATED: 'AI_Content_Generated',
    AI_COVER_CREATED: 'AI_Cover_Created',
    VOICE_CLONING_USED: 'Voice_Cloning_Used',
  },

  // User attribute keys
  USER_ATTRIBUTES: {
    // Basic info
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    EMAIL: 'email',
    PHONE_NUMBER: 'phoneNumber',
    USER_ID: 'userId',

    // Profile info
    GENDER: 'gender',
    BIRTH_DATE: 'birthDate',
    LOCATION: 'location',
    COUNTRY: 'country',
    LANGUAGE: 'preferredLanguage',

    // App-specific attributes
    USER_TYPE: 'userType', // 'creator', 'listener', 'trader'
    SIGNUP_METHOD: 'signupMethod', // 'google', 'apple', 'phone', 'email'
    SUBSCRIPTION_STATUS: 'subscriptionStatus',
    SIGNUP_DATE: 'signupDate',
    LAST_LOGIN: 'lastLogin',

    // Engagement metrics
    TOTAL_SONGS_PLAYED: 'totalSongsPlayed',
    TOTAL_CONTENT_UPLOADED: 'totalContentUploaded',
    TOTAL_TRADES: 'totalTrades',
    TOTAL_SPENT: 'totalSpent',
    CREDIT_BALANCE: 'creditBalance',

    // Social metrics
    FOLLOWERS_COUNT: 'followersCount',
    FOLLOWING_COUNT: 'followingCount',
    REFERRAL_COUNT: 'referralCount',

    // Technical attributes
    DEVICE_TYPE: 'deviceType',
    APP_VERSION: 'appVersion',
    PLATFORM: 'platform',
    PUSH_ENABLED: 'pushEnabled',
    GOOGLE_ID: 'googleId',
  },

  // Campaign trigger events for targeted messaging
  CAMPAIGN_TRIGGERS: {
    ON_APP_OPEN: 'onAppOpen',
    ON_LOGIN: 'onLogin',
    ON_FIRST_SONG_PLAY: 'onFirstSongPlay',
    ON_CONTENT_UPLOAD: 'onContentUpload',
    ON_TRADE_COMPLETE: 'onTradeComplete',
    ON_SUBSCRIPTION_VIEW: 'onSubscriptionView',
    ON_CREDITS_LOW: 'onCreditsLow',
    ON_PROFILE_INCOMPLETE: 'onProfileIncomplete',
    ON_IDLE_USER: 'onIdleUser',
    ON_FEATURE_DISCOVERY: 'onFeatureDiscovery',
    ON_HIGH_ENGAGEMENT: 'onHighEngagement',
    ON_REFERRAL_ELIGIBLE: 'onReferralEligible',
  },

  // Predefined user segments for easier targeting
  USER_SEGMENTS: {
    NEW_USERS: 'new_users',
    ACTIVE_CREATORS: 'active_creators',
    FREQUENT_TRADERS: 'frequent_traders',
    PREMIUM_SUBSCRIBERS: 'premium_subscribers',
    HIGH_SPENDERS: 'high_spenders',
    DORMANT_USERS: 'dormant_users',
    SOCIAL_INFLUENCERS: 'social_influencers',
    AI_ENTHUSIASTS: 'ai_enthusiasts',
  },
};

// Helper functions
export const getMoEngageAppId = () => {
  const platform = require('react-native').Platform.OS;
  if (platform === 'ios') {
    // Do NOT fallback to Android App ID on iOS; force explicit iOS App ID
    return MOENGAGE_CONFIG.APP_ID_IOS || '';
  }
  return (
    MOENGAGE_CONFIG.APP_ID_ANDROID || MOENGAGE_CONFIG.APP_ID // fallback to legacy if not set
  );
};

export const isMoEngageLoggingEnabled = () => {
  return MOENGAGE_CONFIG.ENABLE_LOGS;
};

export const getMoEngageDataCenter = () => {
  return MOENGAGE_CONFIG.DATA_CENTER;
};

// Event builder helpers
export const buildTrackingEvent = (eventName, properties = {}) => {
  return {
    name: eventName,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      app_version: '3.2.0',
      platform: require('react-native').Platform.OS,
    },
  };
};

export const buildUserAttributes = (userAttributes = {}) => {
  return {
    ...userAttributes,
    last_updated: new Date().toISOString(),
    app_version: '3.2.0',
  };
};

export default MOENGAGE_CONFIG;
