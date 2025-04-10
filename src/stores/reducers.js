import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
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
import creditSettings from './slices/creditSettings';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
};

const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
};

const appPersistConfig = {
  key: 'app',
  storage: AsyncStorage,
};

const persistedReducers = {
  auth: persistReducer(authPersistConfig, auth),
  user: persistReducer(userPersistConfig, user),
  app: persistReducer(appPersistConfig, app),
};

const rootReducer = combineReducers({
  ...persistedReducers,
  home,
  player,
  watch,
  coinTxnStats,
  walletStats,
  trade,
  community,
  shortiePlayer,
  creditSettings,
});

export default rootReducer;
