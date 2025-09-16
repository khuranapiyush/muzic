// import React from 'react'
import Banner from './Banner';
import Card100 from './Card100';
import Card30 from './Card30';
import Card45 from './Card45';
import CreatorBanner from './CreatorBanner';

import React, { Fragment } from 'react';
import Card80 from './Card80';
import Circle30 from './Circle30';
import Live45 from './Live45';

const HomeFeedMapping = {
  BANNER: Banner,
  CARD30: Card30,
  CARD100: Card100,
  CARD80: Card80,
  CARD45: Card45,
  CIRCLE4: Circle30,
  CARD401: Live45,
  CREATORINTERVENTION: CreatorBanner,
};

const defaultViewType = 'CARD100';

const HomeComponent = ({ as, ...rest }) => {
  if (!(as && HomeFeedMapping[as])) {
    return <Fragment />;
  }
  const ComponentType =
    (as && HomeFeedMapping[as]) ?? HomeFeedMapping[defaultViewType];
  return <ComponentType {...rest} />;
};

export default HomeComponent;
