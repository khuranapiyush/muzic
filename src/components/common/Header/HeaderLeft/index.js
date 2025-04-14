/* eslint-disable react-native/no-inline-styles */
import React, {memo} from 'react';
import CView from '../../core/View';
import appImages from '../../../../resource/images';
import {Image} from 'react-native';

const HeaderLeft = ({mode}) => {
  return (
    <CView row style={{alignItems: 'center'}}>
      <Image
        source={appImages.appLogo}
        style={{
          height: 60,
          width: 190,
          resizeMode: 'contain',
          marginLeft: 10,
        }}
      />
    </CView>
  );
};

export default memo(HeaderLeft);
