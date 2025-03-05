import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isMuted: false,
  trackData: {}
}

const shortiePlayer = createSlice({
  name: 'shortiePlayer',
  initialState,
  reducers: {
    setShortiePlayerMuted: (state, action) => {
      state.isMuted = action.payload
    },
    setTrackData: (state, action) => {
      state.trackData = action.payload
    }
  }
})

export const { setShortiePlayerMuted, setTrackData } = shortiePlayer.actions

export default shortiePlayer.reducer
