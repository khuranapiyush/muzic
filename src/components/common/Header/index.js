/* eslint-disable react-native/no-inline-styles */
import React, {memo, useContext} from 'react';
import {SafeAreaView} from 'react-native';
import CView from '../core/View';
import HeaderLeft from './HeaderLeft';
import HeaderRight from './HeaderRight';
import {ThemeContext} from '../../../context/ThemeContext';

const CustomHeader = props => {
  const {
    theme: {mode},
  } = useContext(ThemeContext);
  return (
    <SafeAreaView>
      <CView
        row
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          backgroundColor: '#000',
          paddingVertical: 10,
        }}>
        <HeaderLeft mode={mode} />
        <HeaderRight mode={mode} />
      </CView>
    </SafeAreaView>
  );
};

export default memo(CustomHeader);
