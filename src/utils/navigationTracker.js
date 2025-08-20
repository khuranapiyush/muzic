import {store} from '../stores';
import {setCurrentPage} from '../stores/slices/player';
import {getNavigationDetails} from './navigationUtils';

export const handleNavigationStateChange = navigationState => {
  if (!navigationState) return;

  // Get navigation details
  const {currentPage, currentStack, currentTab} =
    getNavigationDetails(navigationState);

  // Only update if the route actually changed
  if (currentPage && currentPage !== previousRouteName) {
    // Dispatch to Redux store
    store.dispatch(
      setCurrentPage({
        currentPage,
        currentStack,
        currentTab,
        timestamp: Date.now(),
      }),
    );

    previousRouteName = currentPage;
  }
};

export const initializeNavigationTracking = () => {
  previousRouteName = null;
};

export const getCurrentPageFromStore = () => {
  const state = store.getState();
  return state.player.currentPage;
};

export default {
  handleNavigationStateChange,
  initializeNavigationTracking,
  getCurrentPageFromStore,
};
