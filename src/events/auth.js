// import {eventNames} from '../constants/event';
// import {trackCustomEvent} from '../utils/moe';

export const handleLoginEvent = (user, data) => {
  if (user?.isFirstLogin) {
    // trackCustomEvent(eventNames.firstLogin, data);
  } else {
    // trackCustomEvent(eventNames.login, data);
  }
};
