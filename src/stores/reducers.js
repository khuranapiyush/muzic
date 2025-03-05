import {combineReducers} from 'redux';

import app from './slices/app';
import auth from './slices/auth';
import home from './slices/home';
import player from './slices/player';
import user from './slices/user';
import watch from './slices/watch';
import coinTxnStats from './slices/coinTxnStats';
import walletStats from './slices/walletStats';
import trade from './slices/trade';
import community from './slices/community';
import shortiePlayer from './slices/shortiePlayer';

// Combine all reducers without persistence
const rootReducer = combineReducers({
  auth,
  user,
  app,
  home,
  player,
  watch,
  coinTxnStats,
  walletStats,
  trade,
  community,
  shortiePlayer,
});

export default rootReducer;
