import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  userId: '',
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
  },
});

export const {setUser, resetUser, setUserData, updateUserData} = user.actions;

export default user.reducer;
