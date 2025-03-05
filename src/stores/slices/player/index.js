import { createSlice } from '@reduxjs/toolkit'
import {
  setFullModePlayer,
  setIsWatchPageVisible,
  setMiniModePlayer,
  setWatchMode
} from '../watch'

const initialState = {
  isFullScreen: false,
  isMiniPlayer: false,
  playerProps: {},
  playerPlayPauseState: null,
  playerPreferences: {
    autoPlayPlayer: { muted: true }
  }
}

const player = createSlice({
  name: 'player',
  initialState,
  reducers: {
    togglePlayerFullScreen: (state, action) => {
      state.isFullScreen = !state.isFullScreen
    },
    setPlayerFullScreen: (state, action) => {
      state.isFullScreen = action.payload
    },
    setMiniPlayer: (state, action) => {
      state.isMiniPlayer = action.payload
    },
    setGlobalPlayerProps: (state, action) => {
      state.playerProps = action.payload
    },
    setPlayerPlayPauseState: (state, action) => {
      state.playerPlayPauseState = action.payload
    },
    setPlayerPreferences: (state, action) => {
      const { type, data = {} } = action.payload
      state.playerPreferences = {
        ...state.playerPreferences,
        [type]: { ...state.playerPreferences[type], ...data }
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(setIsWatchPageVisible, (state, action) => {
      const isVisible = action.payload

      if (!isVisible) {
        state.isFullScreen = false
        state.isMiniPlayer = false
        state.playerProps = {}
        state.playerPlayPauseState = null
      }
    })

    builder.addCase(setFullModePlayer, (state, action) => {
      state.isMiniPlayer = false
      state.playerPlayPauseState = 'play'
    })

    builder.addCase(setMiniModePlayer, (state, action) => {
      state.isMiniPlayer = true
    })

    builder.addCase(setWatchMode, (state, action) => {
      state.isMiniPlayer = action.payload == 'shouldBeMax' ? false : true
    })
  }
})

export const {
  togglePlayerFullScreen,
  setPlayerFullScreen,
  setMiniPlayer,
  setGlobalPlayerProps,
  setPlayerPlayPauseState,
  setPlayerPreferences
} = player.actions

export default player.reducer
