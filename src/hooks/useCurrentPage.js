import {useSelector} from 'react-redux';
import {useMemo} from 'react';
import {createPageCheckers} from '../utils/navigationUtils';

/**
 * Hook to get current page information and boolean checkers from Redux store
 * This is safe to use anywhere in the app, including outside navigation context
 *
 * @returns {Object} Current page information and boolean checkers
 *
 * Usage:
 * ```javascript
 * const {
 *   currentPage,
 *   currentStack,
 *   currentTab,
 *   isHome,
 *   isCreate,
 *   isLibrary,
 *   isLogin,
 *   isInAuthFlow,
 *   isInAIFlow,
 *   // ... all other page checkers
 * } = useCurrentPage();
 * ```
 */
const useCurrentPage = () => {
  // Get current page data from Redux store
  const currentPageData = useSelector(state => state.player.currentPage);

  // Extract page information with fallbacks
  const navigationDetails = useMemo(() => {
    if (!currentPageData) {
      return {
        currentPage: null,
        currentStack: null,
        currentTab: null,
        timestamp: null,
      };
    }

    return {
      currentPage: currentPageData.currentPage || null,
      currentStack: currentPageData.currentStack || null,
      currentTab: currentPageData.currentTab || null,
      timestamp: currentPageData.timestamp || null,
    };
  }, [currentPageData]);

  // Create page checkers based on current page
  const pageCheckers = useMemo(() => {
    return createPageCheckers(navigationDetails.currentPage);
  }, [navigationDetails.currentPage]);

  // Combine all information
  return useMemo(
    () => ({
      // Navigation details
      ...navigationDetails,

      // Page checkers
      ...pageCheckers,

      // Helper methods
      isCurrentPage: pageName => navigationDetails.currentPage === pageName,
      isInStack: stackName => navigationDetails.currentStack === stackName,
      isInTab: tabName => navigationDetails.currentTab === tabName,

      // Additional utility
      hasNavigationData: !!currentPageData,
    }),
    [navigationDetails, pageCheckers, currentPageData],
  );
};

export default useCurrentPage;
