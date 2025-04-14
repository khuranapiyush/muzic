import {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import ROUTE_NAME from '../navigator/config/routeName';
import {
  updateCredits,
  incrementCredits,
  decrementCredits,
} from '../stores/slices/user';
import {selectCreditsPerSong} from '../stores/selector';
import {fetchUserCredits} from '../api/credits';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Helper function to safely get credit value
const getCreditsValue = creditsData => {
  if (creditsData !== null) {
    return creditsData || 0;
  }
  return typeof creditsData === 'number' ? creditsData : 0;
};

/**
 * A custom hook for managing user credits with caching
 */
export const useCredits = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userState = useSelector(state => state.user);
  const creditsPerSong = useSelector(selectCreditsPerSong);

  const credits = getCreditsValue(userState.credits);

  /**
   * Fetch the latest credit information from the API with caching
   */
  const refreshCredits = useCallback(
    async (force = false) => {
      // Only refresh if cache is expired or force refresh is requested
      if (force || Date.now() - lastFetchTime >= CACHE_DURATION) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetchUserCredits();
          dispatch(updateCredits(response?.data?.balance));
          setLastFetchTime(Date.now());
        } catch (err) {
          setError(err.message);
          console.error('Error refreshing credits:', err);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [dispatch, lastFetchTime],
  );

  // Fetch credits on hook initialization if not cached
  useEffect(() => {
    if (Date.now() - lastFetchTime >= CACHE_DURATION) {
      refreshCredits();
    }
  }, [refreshCredits, lastFetchTime]);

  /**
   * Updates the user's credits to a specific amount
   * @param {number} amount - The new total amount of credits
   */
  const updateUserCredits = useCallback(
    amount => {
      if (typeof amount !== 'number') {
        console.error('Invalid credits value:', amount);
        return;
      }
      dispatch(updateCredits(amount));
      setLastFetchTime(Date.now());
    },
    [dispatch],
  );

  /**
   * Adds credits to the user's balance
   * @param {number} amount - The amount of credits to add
   */
  const addCredits = useCallback(
    amount => {
      if (typeof amount !== 'number') {
        console.error('Invalid credits value:', amount);
        return;
      }
      dispatch(incrementCredits(amount));
      setLastFetchTime(Date.now());
    },
    [dispatch],
  );

  /**
   * Decrements credits from the user's balance
   * @param {number} amount - The amount of credits to decrement (default: 1)
   * @returns {boolean} Whether the decrement was successful
   */
  const decrementUserCredits = useCallback(
    (amount = creditsPerSong) => {
      if (credits < amount) {
        return false;
      }
      dispatch(decrementCredits(amount));
      setLastFetchTime(Date.now());
      return true;
    },
    [credits, dispatch, creditsPerSong],
  );

  /**
   * Handles a credit-required action, checking if the user has enough credits
   * @param {Function} action - The action to perform if the user has enough credits
   * @param {number} requiredCredits - The number of credits required (default: 1)
   */
  const handleCreditRequiredAction = useCallback(
    async (action, requiredCredits = creditsPerSong) => {
      // First refresh credits to ensure we have the latest count
      await refreshCredits(true);
      const currentCredits = getCreditsValue(userState.credits);

      if (currentCredits >= requiredCredits) {
        // User has enough credits, perform the action
        const result = action();
        if (result !== false) {
          // Decrement credits if action didn't fail
          dispatch(decrementCredits(requiredCredits));
          setLastFetchTime(Date.now());
        }
        return true;
      } else {
        // User doesn't have enough credits, navigate to subscription screen
        navigation.navigate(ROUTE_NAME.SubscriptionScreen);
        return false;
      }
    },
    [userState.credits, dispatch, navigation, refreshCredits, creditsPerSong],
  );

  return {
    credits,
    updateUserCredits,
    addCredits,
    decrementUserCredits,
    handleCreditRequiredAction,
    refreshCredits,
    isLoading,
    error,
    creditsPerSong,
  };
};

export default useCredits;
