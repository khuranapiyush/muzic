import React from 'react';
import CView from '../core/View';
import appImages from '../../../resource/images';
import CText from '../core/Text';
import {Image} from 'react-native';

// This component has been modified to always show "Dark Mode"
// since the app is locked to dark mode
const ToggleThemeBtn = () => {
  return (
    <CView
      center
      style={{
        backgroundColor: '#000',
        alignSelf: 'flex-start',
        paddingRight: 5,
        paddingLeft: 15,
        paddingVertical: 5,
        borderRadius: 50,
      }}>
      <CView row>
        <CText size="medium" color="commonWhite" style={{alignSelf: 'center'}}>
          Dark Mode{' '}
        </CText>
        <CView
          style={{
            backgroundColor: '#FFF',
            padding: 5,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#E7E7E7',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 1,
          }}>
          <Image
            source={appImages.darkIcon}
            style={{
              width: 24,
              height: 24,
            }}
          />
        </CView>
      </CView>
    </CView>
  );
};

export default ToggleThemeBtn;
