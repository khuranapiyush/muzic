import ROUTE_NAME from './routeName';

const ROUTE_MAPPING_BE = {
  WALLET: {name: ROUTE_NAME.Wallet, params: {}},
  MY_PROFILE: {name: ROUTE_NAME.Profile, params: {}},
  REDEEM_COIN: {name: ROUTE_NAME.Rewards, params: {}},
  LANGUAGE_SELECTION: {name: ROUTE_NAME.Language, params: {}},
  MY_PORTFOLIO: {
    name: ROUTE_NAME.Trade,
    params: {
      parentIdx: 0,
      childIdx: 1,
    },
  },
  MY_CONTENT: {name: ROUTE_NAME.MyContent, params: {}},
  REFER: {name: ROUTE_NAME.ReferAndEarn, params: {}},
  TRADE_VIEW: {
    name: ROUTE_NAME.Trade,
    params: {
      parentIdx: 1,
      childIdx: 0,
    },
  },
  EARN_COIN: {name: ROUTE_NAME.EarnCoin, params: {}},
};

export default ROUTE_MAPPING_BE;
