import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  communities: [],
  selectedCommunity: {},
  showJoiningBonus: { status: false, data: {} }
}

const community = createSlice({
  name: 'community',
  initialState,

  reducers: {
    setCommunities: (state, action) => {
      state.communities = [...action.payload]
    },
    setSelectedCommunity: (state, action) => {
      state.selectedCommunity = action.payload
    },
    showJoiningBonus: (state, action) => {
      state.showJoiningBonus = action.payload
    },
    claimJoiningBonus: (state, action) => {
      state.showJoiningBonus = { status: false, data: {} }
    }
  }
})

export const {
  setCommunities,
  setSelectedCommunity,
  showJoiningBonus,
  claimJoiningBonus
} = community.actions

export default community.reducer
