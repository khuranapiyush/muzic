import ROUTE_NAME from './routeName';

const ROUTE_MAPPING_BE = {
  WALLET: {name: ROUTE_NAME.Wallet, params: {}},
  MY_PROFILE: {name: ROUTE_NAME.Profile, params: {}},
  // HELP_CENTER("HELP_CENTER"),
  REDEEM_COIN: {name: ROUTE_NAME.Rewards, params: {}},
  LANGUAGE_SELECTION: {name: ROUTE_NAME.Language, params: {}},
  MY_PORTFOLIO: {
    name: ROUTE_NAME.Trade,
    params: {
      parentIdx: 0,
      childIdx: 1,
    },
  },
  // ORDER_HISTORY:("ORDER_HISTORY"),
  // LEADER_BOARD:("LEADER_BOARD"),
  MY_CONTENT: {name: ROUTE_NAME.MyContent, params: {}},
  REFER: {name: ROUTE_NAME.ReferAndEarn, params: {}},
  TRADE_VIEW: {
    name: ROUTE_NAME.Trade,
    params: {
      parentIdx: 1,
      childIdx: 0,
    },
  },
  // WEB_VIEW:("WEB_VIEW"),
  EARN_COIN: {name: ROUTE_NAME.EarnCoin, params: {}},
  // CREATE_DASHBOARD:("CREATE_DASHBOARD"),
  //  MARKET:("MARKET")
};

export default ROUTE_MAPPING_BE;
