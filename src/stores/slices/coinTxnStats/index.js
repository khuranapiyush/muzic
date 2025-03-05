import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  coinStats: {},
  coinEarn: {},
  dailyStreak: {},
  mode: 'max'
}

const coinTxnStats = createSlice({
  name: 'coinTxnStats',
  initialState,

  reducers: {
    setCoinStats: (state, action) => {
      state.coinStats = action.payload
    },
    setCoinEarn: (state, action) => {
      state.coinEarn = action.payload
    },
    setDailyStreak: (state, action) => {
      state.dailyStreak = action.payload
    }
  }
})

export const { setCoinStats, setCoinEarn, setDailyStreak } =
  coinTxnStats.actions

export default coinTxnStats.reducer
