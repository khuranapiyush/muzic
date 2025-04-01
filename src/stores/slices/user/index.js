import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  userId: '',
  credits: 0,
  creditHistory: [],
};

// Helper function to safely get credit value
const getCreditValue = creditData => {
  if (typeof creditData === 'object' && creditData !== null) {
    return creditData.balance || 0;
  }
  return typeof creditData === 'number' ? creditData : 0;
};

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const {_id, id} = action?.payload?.user || {};
      return {...action?.payload?.user, userId: _id || id};
    },
    resetUser: (state, action) => {
      return initialState;
    },
    setUserData: (state, action) => {
      const {_id, id} = action?.payload || {};
      return {...action?.payload, userId: _id || id};
    },
    updateUserData: (state, action) => {
      return {...state, ...action?.payload};
    },
    updateCredits: (state, action) => {
      // If the payload is a full credit object from the API
      if (typeof action.payload === 'object' && action.payload !== null) {
        // Store the entire object as received from the API
        return {
          ...state,
          credits: action.payload,
          // If there's credit history in the API response, use it
          creditHistory: action.payload.creditHistory || state.creditHistory,
        };
      }

      // Handle different types of credit input for backward compatibility
      const newCredits = getCreditValue(action.payload);

      return {
        ...state,
        credits: newCredits,
      };
    },
    incrementCredits: (state, action) => {
      const creditsToAdd = action.payload;
      // Get current credit value safely
      const currentCredits = getCreditValue(state.credits);

      // Add to credit history
      const newHistoryEntry = {
        amount: creditsToAdd,
        type: 'increment',
        timestamp: new Date().toISOString(),
      };

      // If credits is an object, update just the balance
      if (typeof state.credits === 'object' && state.credits !== null) {
        return {
          ...state,
          credits: {
            ...state.credits,
            balance: (state.credits.balance || 0) + creditsToAdd,
          },
          creditHistory: [...state.creditHistory, newHistoryEntry],
        };
      }

      // Otherwise update the number
      return {
        ...state,
        credits: currentCredits + creditsToAdd,
        creditHistory: [...state.creditHistory, newHistoryEntry],
      };
    },
    decrementCredits: (state, action) => {
      const creditsToRemove = action.payload || 1;
      // Get current credit value safely
      const currentCredits = getCreditValue(state.credits);

      // Only decrement if we have enough credits
      if (currentCredits >= creditsToRemove) {
        // Add to credit history
        const newHistoryEntry = {
          amount: creditsToRemove,
          type: 'decrement',
          timestamp: new Date().toISOString(),
        };

        // If credits is an object, update just the balance
        if (typeof state.credits === 'object' && state.credits !== null) {
          return {
            ...state,
            credits: {
              ...state.credits,
              balance: (state.credits.balance || 0) - creditsToRemove,
            },
            creditHistory: [...state.creditHistory, newHistoryEntry],
          };
        }

        // Otherwise update the number
        return {
          ...state,
          credits: currentCredits - creditsToRemove,
          creditHistory: [...state.creditHistory, newHistoryEntry],
        };
      }
      return state;
    },
  },
});

export const {
  setUser,
  resetUser,
  setUserData,
  updateUserData,
  updateCredits,
  incrementCredits,
  decrementCredits,
} = user.actions;

export default user.reducer;
