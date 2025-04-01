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

/**
 * A custom hook for managing user credits
 */
export const useCredits = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userState = useSelector(state => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle both object and primitive credit values
  const getCreditsValue = creditsData => {
    if (typeof creditsData === 'object' && creditsData !== null) {
      return creditsData.data.balance || 0;
    }
    return typeof creditsData === 'number' ? creditsData : 0;
  };

  const credits = getCreditsValue(userState.credits);

  /**
   * Fetch the latest credit information from the API
   */
  const refreshCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const creditData = await fetchUserCredits();
      dispatch(updateCredits(creditData));
      return creditData;
    } catch (err) {
      console.error('Failed to refresh credits:', err);
      setError(err.message || 'Failed to refresh credits');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Fetch credits on hook initialization
  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

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
      console.log('Updating credits to:', amount);
      dispatch(updateCredits(amount));
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
      console.log('Adding credits:', amount);
      dispatch(incrementCredits(amount));

      // Refresh credits from the API after a short delay
      setTimeout(() => {
        refreshCredits();
      }, 1000);
    },
    [dispatch, refreshCredits],
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

      // Refresh credits from the API after a short delay
      setTimeout(() => {
        refreshCredits();
      }, 1000);

      return true;
    },
    [credits, dispatch, refreshCredits],
  );

  /**
   * Handles a credit-required action, checking if the user has enough credits
   * @param {Function} action - The action to perform if the user has enough credits
   * @param {number} requiredCredits - The number of credits required (default: 1)
   */
  const handleCreditRequiredAction = useCallback(
    async (action, requiredCredits = 1) => {
      // First refresh credits to ensure we have the latest count
      await refreshCredits();
      const currentCredits = getCreditsValue(userState.credits);

      if (currentCredits >= requiredCredits) {
        // User has enough credits, perform the action
        const result = action();
        if (result !== false) {
          // Decrement credits if action didn't fail
          dispatch(decrementCredits(requiredCredits));

          // Refresh credits from the API after a short delay
          setTimeout(() => {
            refreshCredits();
          }, 1000);
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
