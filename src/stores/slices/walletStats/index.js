import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  balance: 0,
  currency: 'USD',
  fantigerCoin: 0,
  fantigerCoinRedeemPercentage: 0,
  lifetimeWithdraw: 0,
  maxWithdrawalAmountPerTxn: 0,
  maxWithdrawalAmountPerUser: 0,
  redeemableFantigerCoin: 0,
  redeemedFantigerCoin: 0,
  withdrawableAmount: 0,
  ioutoken: 0,
  ioutokenUnlocked: 0
}

const walletStats = createSlice({
  name: 'walletStats',
  initialState,

  reducers: {
    setWalletStats: (_, action) => {
      return { ...action.payload }
    },
    updateWalletStats: (state, action) => {
      const {
        fantigerCoin,
        balance,
        currency,
        redeemableFantigerCoin,
        ioutoken,
        ioutokenUnlocked
      } = action.payload

      return {
        ...state,
        fantigerCoin,
        balance,
        currency,
        redeemableFantigerCoin,
        ioutokenUnlocked,
        ioutoken
      }
    }
  }
})

export const { setWalletStats, updateWalletStats } = walletStats.actions

export default walletStats.reducer
