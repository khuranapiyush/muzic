import {useNavigationState, useRoute} from '@react-navigation/native';
import ROUTE_NAME from '../navigator/config/routeName';

/**
 * Navigation utility to track current page and provide boolean helpers
 * for checking which page the user is currently on
 */

/**
 * Get the current active route name from navigation state
 * @returns {string|null} Current route name or null if not available
 */
export const getCurrentPageName = () => {
  try {
    // This function should be used within navigation context
    // For direct usage outside components, use the hook instead
    return null;
  } catch (error) {
    console.warn('getCurrentPageName called outside navigation context');
    return null;
  }
};

/**
 * Get detailed navigation information including current page, stack, and tab
 * @param {Object} navigationState - Navigation state from useNavigationState
 * @returns {Object} Navigation details
 */
export const getNavigationDetails = navigationState => {
  if (!navigationState || !navigationState.routes) {
    return {
      currentPage: null,
      currentStack: null,
      currentTab: null,
      isInHomeStack: false,
      isInAuthStack: false,
      isInMainStack: false,
    };
  }

  const routes = navigationState.routes;
  const currentRouteIndex = navigationState.index;
  const currentRoute = routes[currentRouteIndex];

  let currentPage = currentRoute?.name || null;
  let currentStack = null;
  let currentTab = null;
  let isInHomeStack = false;
  let isInAuthStack = false;
  let isInMainStack = false;

  // Check if we're in a stack navigator
  if (currentRoute?.state) {
    const nestedRoutes = currentRoute.state.routes;
    const nestedIndex = currentRoute.state.index;
    const nestedRoute = nestedRoutes?.[nestedIndex];

    currentStack = currentRoute.name;

    // If there's a nested route (like in tab navigator)
    if (nestedRoute) {
      currentPage = nestedRoute.name;
      currentTab = nestedRoute.name;
    }
  }

  // Determine which stack we're in
  switch (currentStack || currentPage) {
    case ROUTE_NAME.HomeStack:
      isInHomeStack = true;
      isInMainStack = true;
      break;
    case ROUTE_NAME.AuthStack:
      isInAuthStack = true;
      break;
    case ROUTE_NAME.MainStack:
      isInMainStack = true;
      break;
    default:
      // Check if the current page is a main app route
      const mainAppPages = [
        ROUTE_NAME.AIGenerator,
        ROUTE_NAME.VoiceRecord,
        ROUTE_NAME.SubscriptionScreen,
        ROUTE_NAME.PrivacyPolicy,
        ROUTE_NAME.TermsAndConditions,
        ROUTE_NAME.TrendingSongs,
        ROUTE_NAME.AllRecordings,
        ROUTE_NAME.RecurringSubscriptionScreen,
      ];
      if (mainAppPages.includes(currentPage)) {
        isInMainStack = true;
      }
      break;
  }

  return {
    currentPage,
    currentStack,
    currentTab,
    isInHomeStack,
    isInAuthStack,
    isInMainStack,
  };
};

/**
 * Create page checker functions for all routes
 * @param {string} currentPage - Current active page name
 * @returns {Object} Object with boolean functions for each page
 */
export const createPageCheckers = currentPage => {
  const checkers = {};

  // Create a boolean checker for each route
  Object.values(ROUTE_NAME).forEach(routeName => {
    const checkerName = `is${routeName}`;
    checkers[checkerName] = currentPage === routeName;
  });

  // Add some convenient aliases and combined checks
  checkers.isHome = currentPage === 'Discover'; // Home tab is called 'Discover'
  checkers.isCreate = currentPage === 'Create';
  checkers.isCoverSong = currentPage === 'Cover Song';
  checkers.isLibrary = currentPage === 'Library';

  // Tab-specific checks
  checkers.isInHomeTabs = [
    'Create',
    'Cover Song',
    'Discover',
    'Library',
  ].includes(currentPage);

  // Auth flow checks
  checkers.isInAuthFlow = [
    ROUTE_NAME.Login,
    ROUTE_NAME.SignUp,
    ROUTE_NAME.PhoneInput,
    ROUTE_NAME.VerifyOtp,
    ROUTE_NAME.ForgotPassword,
  ].includes(currentPage);

  // AI/Creation flow checks
  checkers.isInAIFlow = [
    ROUTE_NAME.AIGenerator,
    ROUTE_NAME.AIAgent,
    ROUTE_NAME.VoiceRecord,
    'Create',
    'Cover Song',
  ].includes(currentPage);

  // Profile/Settings flow checks
  checkers.isInProfileFlow = [
    ROUTE_NAME.Profile,
    ROUTE_NAME.Settings,
    ROUTE_NAME.EditProfile,
    ROUTE_NAME.MyContent,
  ].includes(currentPage);

  // Monetization flow checks
  checkers.isInMonetizationFlow = [
    ROUTE_NAME.SubscriptionScreen,
    ROUTE_NAME.Wallet,
    ROUTE_NAME.AddFund,
    ROUTE_NAME.WithdrawMoney,
    ROUTE_NAME.Trade,
    ROUTE_NAME.MarketPlace,
    ROUTE_NAME.MarketPlaceBuy,
    ROUTE_NAME.MarketPlaceSell,
  ].includes(currentPage);

  return checkers;
};

/**
 * Navigation utilities object with helper methods
 */
export const navigationUtils = {
  getCurrentPageName,
  getNavigationDetails,
  createPageCheckers,

  // Route name constants for easy access
  ROUTES: ROUTE_NAME,

  // Common route groups
  HOME_TABS: ['Create', 'Cover Song', 'Discover', 'Library'],
  AUTH_ROUTES: [
    ROUTE_NAME.Login,
    ROUTE_NAME.SignUp,
    ROUTE_NAME.PhoneInput,
    ROUTE_NAME.VerifyOtp,
    ROUTE_NAME.ForgotPassword,
  ],
  AI_ROUTES: [
    ROUTE_NAME.AIGenerator,
    ROUTE_NAME.AIAgent,
    ROUTE_NAME.VoiceRecord,
    'Create',
    'Cover Song',
  ],
  PROFILE_ROUTES: [
    ROUTE_NAME.Profile,
    ROUTE_NAME.Settings,
    ROUTE_NAME.EditProfile,
    ROUTE_NAME.MyContent,
  ],
  MONETIZATION_ROUTES: [
    ROUTE_NAME.SubscriptionScreen,
    ROUTE_NAME.Wallet,
    ROUTE_NAME.AddFund,
    ROUTE_NAME.WithdrawMoney,
    ROUTE_NAME.Trade,
    ROUTE_NAME.MarketPlace,
    ROUTE_NAME.MarketPlaceBuy,
    ROUTE_NAME.MarketPlaceSell,
  ],
};

export default navigationUtils;
