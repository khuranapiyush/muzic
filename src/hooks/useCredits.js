import {useCallback, useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import ROUTE_NAME from '../navigator/config/routeName';
import {
  updateCredits,
  incrementCredits,
  decrementCredits,
} from '../stores/slices/user';
import {fetchUserCredits} from '../api/credits';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * A custom hook for managing user credits with caching
 */
export const useCredits = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userState = useSelector(state => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Handle both object and primitive credit values
  const getCreditsValue = creditsData => {
    if (typeof creditsData === 'object' && creditsData !== null) {
      return creditsData?.data?.balance || 0;
    }
    return typeof creditsData === 'number' ? creditsData : 0;
  };

  const credits = getCreditsValue(userState.credits);

  /**
   * Fetch the latest credit information from the API with caching
   */
  const refreshCredits = useCallback(
    async (force = false) => {
      const now = Date.now();

      // Check if we should use cached data
      if (!force && now - lastFetchTime < CACHE_DURATION) {
        return userState.credits;
      }

      try {
        setIsLoading(true);
        setError(null);
        const creditData = await fetchUserCredits();
        dispatch(updateCredits(creditData));
        setLastFetchTime(now);
        return creditData;
      } catch (err) {
        console.error('Failed to refresh credits:', err);
        setError(err.message || 'Failed to refresh credits');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, lastFetchTime, userState.credits],
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
    (amount = 1) => {
      if (credits < amount) {
        return false;
      }
      dispatch(decrementCredits(amount));
      setLastFetchTime(Date.now());
      return true;
    },
    [credits, dispatch],
  );

  /**
   * Handles a credit-required action, checking if the user has enough credits
   * @param {Function} action - The action to perform if the user has enough credits
   * @param {number} requiredCredits - The number of credits required (default: 1)
   */
  const handleCreditRequiredAction = useCallback(
    async (action, requiredCredits = 1) => {
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
    [userState.credits, dispatch, navigation, refreshCredits],
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
  };
};

export default useCredits;
