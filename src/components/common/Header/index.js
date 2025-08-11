/* eslint-disable react-native/no-inline-styles */
import React, {memo, useContext} from 'react';
import {SafeAreaView, Platform} from 'react-native';
import CView from '../core/View';
import HeaderLeft from './HeaderLeft';
import HeaderRight from './HeaderRight';
import {ThemeContext} from '../../../context/ThemeContext';

const CustomHeader = props => {
  const {
    theme: {mode},
  } = useContext(ThemeContext);
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'transparent',
        position: 'absolute',
        top: Platform.OS === 'ios' ? -30 : -10,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}>
      <CView
        row
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          backgroundColor: 'transparent',
          marginTop: Platform.OS === 'ios' ? 15 : 25,
        }}>
        <HeaderLeft mode={mode} />
        <HeaderRight mode={mode} />
      </CView>
    </SafeAreaView>
  );
};

export default memo(CustomHeader);
